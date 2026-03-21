import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCronAuth } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const gitSHA = process.env.NEXT_PUBLIC_GIT_SHA?.trim() || null

  try {
    const now = new Date()

    const due = await prisma.dispatch.findMany({
      where: {
        published: false,
        publishedAt: { not: null, lte: now },
      },
      select: { id: true, slug: true, title: true },
    })

    if (due.length === 0) {
      await prisma.cronLog.create({
        data: { cronName: 'publish', status: 'success', durationMs: Date.now() - start, recordsAffected: 0, gitSHA },
      })
      return NextResponse.json({ published: 0 })
    }

    await prisma.dispatch.updateMany({
      where: { id: { in: due.map(p => p.id) } },
      data: { published: true },
    })

    await prisma.cronLog.create({
      data: {
        cronName: 'publish',
        status: 'success',
        durationMs: Date.now() - start,
        recordsAffected: due.length,
        phases: JSON.stringify({ published: due.map(p => p.slug) }),
        gitSHA,
      },
    })

    return NextResponse.json({
      published: due.length,
      posts: due.map(p => ({ slug: p.slug, title: p.title })),
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    await prisma.cronLog.create({
      data: { cronName: 'publish', status: 'error', durationMs: Date.now() - start, errors: errorMsg, gitSHA },
    }).catch(() => {})
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
