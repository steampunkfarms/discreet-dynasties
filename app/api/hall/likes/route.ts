import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const existing = await prisma.dDHallLike.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  })

  if (existing) {
    await prisma.dDHallLike.delete({ where: { id: existing.id } })
    return NextResponse.json({ liked: false })
  } else {
    await prisma.dDHallLike.create({ data: { postId, userId: session.user.id } })
    return NextResponse.json({ liked: true })
  }
}
