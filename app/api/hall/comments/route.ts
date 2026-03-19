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
  const { postId, parentId, content } = body

  if (!postId || !content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: 'Comment too long' }, { status: 400 })
  }

  const comment = await prisma.dDHallComment.create({
    data: {
      postId,
      authorId: session.user.id,
      parentId: parentId || null,
      content: content.trim(),
    },
  })

  return NextResponse.json({ id: comment.id })
}
