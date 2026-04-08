import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCronAuth } from '@/lib/cron-auth'
import { generateAndPublish, notifyOwner } from '@/lib/content-pipeline'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!verifyCronAuth(req.headers.get('authorization'))) {
    console.warn(`[dd-content-gen-auth] Rejected unauthorized call to ${req.url}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Kill switch — opt-in: must be explicitly 'true' to run
  if (process.env.CONTENT_GEN_ENABLED?.trim() !== 'true') {
    await prisma.cronLog.create({
      data: {
        cronName: 'content-gen',
        status: 'skipped',
        durationMs: 0,
        errors: JSON.stringify(['Kill switch CONTENT_GEN_ENABLED is not set to true']),
        executedAt: new Date(),
      },
    }).catch(() => {})
    return NextResponse.json({ status: 'skipped', reason: 'Kill switch not enabled' })
  }

  const startTime = Date.now()

  try {
    const result = await generateAndPublish()

    // Notify owner (FYI, not for approval)
    await notifyOwner(result.contentType, `Chapter: ${result.chapterTitle}`, result)

    // Log to CronLog
    await prisma.cronLog.create({
      data: {
        cronName: 'content-gen',
        status: 'success',
        durationMs: Date.now() - startTime,
        recordsAffected: 1,
        phases: JSON.stringify(result),
        gitSHA: process.env.NEXT_PUBLIC_GIT_SHA || null,
        executedAt: new Date(),
      },
    })

    return NextResponse.json({ status: 'success', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    await prisma.cronLog.create({
      data: {
        cronName: 'content-gen',
        status: 'error',
        durationMs: Date.now() - startTime,
        recordsAffected: 0,
        errors: JSON.stringify([message]),
        gitSHA: process.env.NEXT_PUBLIC_GIT_SHA || null,
        executedAt: new Date(),
      },
    }).catch(() => {})

    return NextResponse.json({ status: 'error', error: message }, { status: 500 })
  }
}
