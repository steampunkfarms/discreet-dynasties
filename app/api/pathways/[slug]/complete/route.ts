import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getPathwayBySlug } from '@/lib/dd/pathways'

interface Params { params: { slug: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isPaid) {
    return NextResponse.json({ error: 'Builder access required' }, { status: 403 })
  }

  const pathway = getPathwayBySlug(params.slug)
  if (!pathway) {
    return NextResponse.json({ error: 'Pathway not found' }, { status: 404 })
  }

  // Support both form POST and JSON POST
  let week: number
  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const body = await req.json()
    week = Number(body.week)
  } else {
    const formData = await req.formData()
    week = Number(formData.get('week'))
  }

  if (!week || week < 1 || week > pathway.weekCount) {
    return NextResponse.json({ error: 'Invalid week' }, { status: 400 })
  }

  const existing = await prisma.dDPathwayProgress.findUnique({
    where: { userId_pathway: { userId: session.user.id, pathway: params.slug } },
  })

  if (existing) {
    const nextWeek = week + 1
    const isComplete = nextWeek > pathway.weekCount

    await prisma.dDPathwayProgress.update({
      where: { id: existing.id },
      data: {
        weekNumber: isComplete ? pathway.weekCount : nextWeek,
        status: isComplete ? 'completed' : 'in_progress',
        completedAt: isComplete ? new Date() : null,
        updatedAt: new Date(),
      },
    })
  } else {
    // Create progress record at week 1 completed → advance to week 2
    const nextWeek = week + 1
    const isComplete = nextWeek > pathway.weekCount

    await prisma.dDPathwayProgress.create({
      data: {
        userId: session.user.id,
        pathway: params.slug,
        weekNumber: isComplete ? pathway.weekCount : nextWeek,
        status: isComplete ? 'completed' : 'in_progress',
        completedAt: isComplete ? new Date() : null,
      },
    })
  }

  // Redirect back to the pathway page (for form POST)
  return NextResponse.redirect(new URL(`/pathways/${params.slug}`, req.url))
}
