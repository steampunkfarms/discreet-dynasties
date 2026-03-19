import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isPaid) {
    return NextResponse.json({ error: 'Builder access required' }, { status: 403 })
  }

  const body = await req.json()
  const { content, category, isJournal } = body

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Content too long' }, { status: 400 })
  }

  const post = await prisma.dDHallPost.create({
    data: {
      authorId: session.user.id,
      content: content.trim(),
      category: category || 'general',
      isJournal: Boolean(isJournal),
    },
  })

  return NextResponse.json({ id: post.id })
}
