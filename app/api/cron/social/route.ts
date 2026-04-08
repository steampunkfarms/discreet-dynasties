import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCronAuth } from '@/lib/cron-auth'
import { callModel } from '@/lib/ai-models'
import { dispatchToAll, postFirstComments, pickImage, type PlatformContent } from '@/lib/social'
import { fetchPlatformMetrics } from '@/lib/social/metrics'
import { detectActiveArcs, generateArcSocialCopy } from '@/lib/story-arc'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    console.warn(`[social-auth] Rejected unauthorized call to ${request.url}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const gitSHA = process.env.NEXT_PUBLIC_GIT_SHA?.trim() || null

  // Kill switch — opt-in: must be explicitly 'true' to run
  if (process.env.SOCIAL_CRON_ENABLED?.trim() !== 'true') {
    await prisma.cronLog.create({
      data: {
        cronName: 'social',
        status: 'skipped',
        durationMs: Date.now() - start,
        phases: JSON.stringify({ reason: 'Kill switch SOCIAL_CRON_ENABLED is not set to true' }),
        gitSHA,
      },
    }).catch(() => {})
    return NextResponse.json({ skipped: true, reason: 'SOCIAL_CRON_ENABLED is false' })
  }

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const summary: { standalone: number; arcs: number; scheduled: number; metricsFetched: number; imagesUsed: number; errors: string[] } = {
    standalone: 0, arcs: 0, scheduled: 0, metricsFetched: 0, imagesUsed: 0, errors: [],
  }

  try {
    // 1. Handle scheduled social posts whose time has arrived
    const dueScheduled = await prisma.socialPost.findMany({
      where: { status: 'scheduled', scheduledAt: { lte: now } },
    })

    for (const sp of dueScheduled) {
      const content: PlatformContent = { [sp.platform]: sp.content }
      const results = await dispatchToAll(content)
      const result = results[0]

      await prisma.socialPost.update({
        where: { id: sp.id },
        data: {
          status: result?.status === 'posted' ? 'posted' : 'failed',
          platformId: result?.platformId || null,
          postedAt: result?.status === 'posted' ? now : null,
          error: result?.error || null,
        },
      })

      if (result?.status === 'posted') summary.scheduled++
      else summary.errors.push(`Scheduled ${sp.platform}: ${result?.error}`)
    }

    // 2. Find recently published dispatches without social posts
    const recentDispatches = await prisma.dispatch.findMany({
      where: {
        published: true,
        publishedAt: { gte: twentyFourHoursAgo, lte: now },
      },
      select: { slug: true, title: true, content: true, excerpt: true },
    })

    for (const dispatch of recentDispatches) {
      // Skip if already dispatched
      const existing = await prisma.socialPost.findFirst({
        where: { postSlug: dispatch.slug, status: { not: 'failed' } },
      })
      if (existing) continue

      // Generate social copy for dispatch
      const copyPrompt = `Generate social media copy for a dispatch by Discreet Dynasties.
Voice: measured, resolute, practical, discreet. No spectacle, no hype — just substance.

Title: "${dispatch.title}"
Excerpt: ${dispatch.excerpt}
Content: ${dispatch.content.slice(0, 2000)}
Link: https://discreet.tronboll.us/dispatches/${dispatch.slug}

Generate platform-native copy:
- Facebook: 2-3 reflective paragraphs. Do NOT include any links or URLs — Facebook throttles pages that post links. Do NOT add any author attribution line — the Page name and collaborator tag handle that.
- Instagram: Shorter, contemplative. 3-5 hashtags. Include the link.
- X/Twitter: 1000-4000 chars. Premium+ account (25k char limit) — use the space generously. Punchy hook, then expand with substance. Include link.

Return JSON only (no markdown fences):
{ "facebook": "...", "instagram": "...", "x": "..." }`

      try {
        const result = await callModel('claude', copyPrompt)
        if (result.status !== 'success') {
          summary.errors.push(`Copy gen for ${dispatch.slug}: ${result.error}`)
          continue
        }

        const copy = JSON.parse(result.text) as PlatformContent

        // Optionally refine X copy through Grok (Premium+ — no 280 char limit)
        if (process.env.GROK_WIT_REFINEMENT?.trim() === 'true' && process.env.XAI_API_KEY?.trim() && copy.x) {
          try {
            const grokResult = await callModel('grok', `Refine this X post — make it wittier and sharper while keeping the stewardship edge and substance. Premium account, so length is fine. Return only the post:\n\n"${copy.x}"`)
            if (grokResult.status === 'success' && grokResult.text.length > 0) {
              copy.x = grokResult.text.replace(/^["']|["']$/g, '').trim()
            }
          } catch { /* keep original */ }
        }

        // Pick an image from the pool for photo/IG posting
        const imageUrl = await pickImage(dispatch.content, 'discreet').catch(() => null)
        if (imageUrl) summary.imagesUsed++

        // Dispatch to all platforms
        const results = await dispatchToAll(copy, imageUrl ?? undefined)

        // Save records
        for (const r of results) {
          const platformContent = copy[r.platform as keyof PlatformContent] || ''
          await prisma.socialPost.create({
            data: {
              platform: r.platform,
              platformId: r.platformId || null,
              content: platformContent,
              postSlug: dispatch.slug,
              status: r.status,
              postedAt: r.status === 'posted' ? now : null,
              error: r.error || null,
            },
          })
        }

        // First comment: AI-generated reply with article link
        const fcResults = await postFirstComments(results, dispatch.slug, dispatch.title, dispatch.excerpt || undefined)
        for (const fc of fcResults) {
          if (fc.status === 'posted' && fc.commentId) {
            await prisma.socialPost.updateMany({
              where: { postSlug: dispatch.slug, platform: fc.platform, status: 'posted' },
              data: { firstCommentId: fc.commentId, firstCommentAt: now },
            })
          } else if (fc.status === 'failed') {
            summary.errors.push(`First comment ${fc.platform}: ${fc.error}`)
          }
        }

        summary.standalone++
      } catch (err) {
        summary.errors.push(`${dispatch.slug}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // 3. Story-arc detection (stub — dispatches are standalone)
    try {
      const arcs = await detectActiveArcs()
      for (const arc of arcs) {
        const copy = await generateArcSocialCopy(arc)

        const results = await dispatchToAll(copy)
        for (const r of results) {
          await prisma.socialPost.create({
            data: {
              platform: r.platform,
              platformId: r.platformId || null,
              content: copy[r.platform as keyof typeof copy] || '',
              postSlug: arc.parentSlug,
              threadArc: JSON.stringify(arc.children.map(c => c.slug)),
              status: r.status,
              postedAt: r.status === 'posted' ? now : null,
              error: r.error || null,
            },
          })
        }

        summary.arcs++
      }
    } catch (err) {
      summary.errors.push(`Arc detection: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // 4. Fetch platform metrics for posts at least 24h old without metrics
    try {
      const postsNeedingMetrics = await prisma.socialPost.findMany({
        where: {
          status: 'posted',
          platformId: { not: null },
          postedAt: { lte: twentyFourHoursAgo },
          metrics: { none: {} },
        },
        take: 20,
      })

      for (const sp of postsNeedingMetrics) {
        try {
          const metrics = await fetchPlatformMetrics(sp.platform, sp.platformId!)
          await prisma.socialMetric.create({
            data: {
              socialPostId: sp.id,
              impressions: metrics.impressions,
              engagements: metrics.engagements,
              clicks: metrics.clicks,
              likes: metrics.likes,
              retweets: metrics.retweets,
              replies: metrics.replies,
            },
          })
          summary.metricsFetched++
        } catch (err) {
          summary.errors.push(`Metrics ${sp.platform}/${sp.platformId}: ${err instanceof Error ? err.message : 'Unknown'}`)
        }
      }
    } catch (err) {
      summary.errors.push(`Metrics phase: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

  } catch (err) {
    summary.errors.push(`Fatal: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }

  // Log execution
  const totalAffected = summary.standalone + summary.arcs + summary.scheduled + summary.metricsFetched
  const status = summary.errors.length > 0 ? (totalAffected > 0 ? 'partial' : 'error') : 'success'

  await prisma.cronLog.create({
    data: {
      cronName: 'social',
      status,
      durationMs: Date.now() - start,
      recordsAffected: totalAffected,
      phases: JSON.stringify({
        standalone: summary.standalone,
        arcs: summary.arcs,
        scheduled: summary.scheduled,
        metricsFetched: summary.metricsFetched,
      }),
      errors: summary.errors.length > 0 ? JSON.stringify(summary.errors) : null,
      gitSHA,
    },
  }).catch(() => {}) // don't let logging failure mask the real error

  return NextResponse.json({
    timestamp: now.toISOString(),
    ...summary,
  })
}
