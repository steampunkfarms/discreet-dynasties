import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCronAuth } from '@/lib/cron-auth'
import { dispatchToAll, pickImage, type PlatformContent } from '@/lib/social'
import {
  getOrCreateCursor,
  getNextChunk,
  getNextModel,
  extractPassage,
  generateSocialCopy,
  computePassageHash,
  isDuplicate,
  shouldRunNow,
  advanceCursor,
} from '@/lib/evergreen'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    console.warn(`[evergreen-auth] Rejected unauthorized call to ${request.url}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const gitSHA = process.env.NEXT_PUBLIC_GIT_SHA?.trim() || null

  // Kill switch — opt-in: must be explicitly 'true' to run
  if (process.env.EVERGREEN_CRON_ENABLED?.trim() !== 'true') {
    await prisma.cronLog.create({
      data: {
        cronName: 'evergreen',
        status: 'skipped',
        durationMs: Date.now() - start,
        phases: JSON.stringify({ reason: 'Kill switch EVERGREEN_CRON_ENABLED is not set to true' }),
        gitSHA,
      },
    }).catch(() => {})
    return NextResponse.json({ skipped: true, reason: 'Kill switch not enabled' })
  }

  // Cadence check
  const cadence = shouldRunNow()
  if (!cadence.shouldRun) {
    await prisma.cronLog.create({
      data: {
        cronName: 'evergreen',
        status: 'skipped',
        durationMs: Date.now() - start,
        phases: JSON.stringify({ reason: cadence.reason }),
        gitSHA,
      },
    }).catch(() => {})
    return NextResponse.json({ skipped: true, reason: cadence.reason })
  }

  const errors: string[] = []

  try {
    // Get cursor
    const cursor = await getOrCreateCursor()
    if (!cursor) {
      await prisma.cronLog.create({
        data: {
          cronName: 'evergreen',
          status: 'skipped',
          durationMs: Date.now() - start,
          phases: JSON.stringify({ reason: 'no published posts found' }),
          gitSHA,
        },
      }).catch(() => {})
      return NextResponse.json({ skipped: true, reason: 'no published posts found' })
    }

    // Get next chunk
    const chunk = await getNextChunk(cursor)
    if (!chunk) {
      await prisma.cronLog.create({
        data: {
          cronName: 'evergreen',
          status: 'skipped',
          durationMs: Date.now() - start,
          phases: JSON.stringify({ reason: 'no chunks available' }),
          gitSHA,
        },
      }).catch(() => {})
      return NextResponse.json({ skipped: true, reason: 'no chunks available' })
    }

    // Determine model
    const { model, newIndex } = getNextModel(cursor.lastModelIndex)

    // Extract passage
    const extraction = await extractPassage(chunk.chunk, chunk.postTitle, chunk.startLine, chunk.endLine, model)

    if (!extraction.passage) {
      // No quotable passage — advance cursor and return
      await advanceCursor(cursor.id, chunk.endLine, newIndex)
      await prisma.cronLog.create({
        data: {
          cronName: 'evergreen',
          status: 'success',
          durationMs: Date.now() - start,
          recordsAffected: 0,
          phases: JSON.stringify({
            postSlug: chunk.postSlug,
            lines: `${chunk.startLine}-${chunk.endLine}`,
            model,
            result: 'no_quotable_passage',
            cadence: cadence.reason,
          }),
          gitSHA,
        },
      }).catch(() => {})
      return NextResponse.json({
        extracted: false,
        postSlug: chunk.postSlug,
        lines: `${chunk.startLine}-${chunk.endLine}`,
        model,
        reason: 'no quotable passage in chunk',
      })
    }

    // Dedup check
    const hash = computePassageHash(extraction.passage)
    if (await isDuplicate(hash)) {
      await advanceCursor(cursor.id, chunk.endLine, newIndex)
      await prisma.cronLog.create({
        data: {
          cronName: 'evergreen',
          status: 'success',
          durationMs: Date.now() - start,
          recordsAffected: 0,
          phases: JSON.stringify({
            postSlug: chunk.postSlug,
            lines: `${chunk.startLine}-${chunk.endLine}`,
            model,
            result: 'duplicate_passage',
            cadence: cadence.reason,
          }),
          gitSHA,
        },
      }).catch(() => {})
      return NextResponse.json({
        extracted: false,
        postSlug: chunk.postSlug,
        model,
        reason: 'duplicate passage (already extracted in a previous cycle)',
      })
    }

    // Generate social copy
    const social = await generateSocialCopy(extraction.passage, chunk.postTitle, chunk.postSlug, model)

    // Refresh cursor to get latest cycleNumber
    const freshCursor = await prisma.evergreenCursor.findFirst()
    const cycleNumber = freshCursor?.cycleNumber || cursor.cycleNumber

    // Save EvergreenQuote
    const quote = await prisma.evergreenQuote.create({
      data: {
        postSlug: chunk.postSlug,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        extractedPassage: extraction.passage,
        passageHash: hash,
        model,
        cycleNumber,
        facebookCopy: social.copy?.facebook || null,
        xCopy: social.copy?.x || null,
        instagramCopy: social.copy?.instagram || null,
        dispatchStatus: social.copy ? 'extracted' : 'failed',
      },
    })

    // Dispatch to platforms
    let dispatched = 0
    if (social.copy) {
      const imageUrl = await pickImage(extraction.passage, 'discreet').catch(() => null)
      const results = await dispatchToAll(social.copy, imageUrl ?? undefined)

      for (const r of results) {
        const content = social.copy[r.platform as keyof PlatformContent] || ''
        await prisma.socialPost.create({
          data: {
            platform: r.platform,
            platformId: r.platformId || null,
            content,
            postSlug: chunk.postSlug,
            status: r.status,
            postedAt: r.status === 'posted' ? new Date() : null,
            error: r.error || null,
          },
        })
        if (r.status === 'posted') dispatched++
        if (r.status === 'failed') errors.push(`${r.platform}: ${r.error}`)
      }

      // Update quote status
      await prisma.evergreenQuote.update({
        where: { id: quote.id },
        data: {
          dispatchStatus: dispatched > 0 ? 'dispatched' : 'failed',
          dispatchedAt: dispatched > 0 ? new Date() : null,
        },
      })
    } else {
      errors.push(`Social copy generation failed: ${social.response.error || 'parse error'}`)
    }

    // Advance cursor
    await advanceCursor(cursor.id, chunk.endLine, newIndex)

    // Log execution
    const status = errors.length > 0 ? (dispatched > 0 ? 'partial' : 'error') : 'success'
    await prisma.cronLog.create({
      data: {
        cronName: 'evergreen',
        status,
        durationMs: Date.now() - start,
        recordsAffected: dispatched,
        phases: JSON.stringify({
          postSlug: chunk.postSlug,
          lines: `${chunk.startLine}-${chunk.endLine}`,
          model,
          passageLength: extraction.passage.length,
          dispatched,
          cycleNumber,
          cadence: cadence.reason,
        }),
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        gitSHA,
      },
    }).catch(() => {})

    return NextResponse.json({
      extracted: true,
      postSlug: chunk.postSlug,
      lines: `${chunk.startLine}-${chunk.endLine}`,
      model,
      passageLength: extraction.passage.length,
      dispatched,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    await prisma.cronLog.create({
      data: {
        cronName: 'evergreen',
        status: 'error',
        durationMs: Date.now() - start,
        errors: JSON.stringify([errorMsg]),
        gitSHA,
      },
    }).catch(() => {})
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
