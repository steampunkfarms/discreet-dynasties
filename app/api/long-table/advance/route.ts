import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const MAX_LEVEL = 6

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isPaid) return NextResponse.json({ error: 'Builder access required' }, { status: 403 })

  const existing = await prisma.dDLongTableProgress.findUnique({
    where: { userId: session.user.id },
  })

  const currentLevel = existing?.level || 1
  const nextLevel = Math.min(currentLevel + 1, MAX_LEVEL)

  await prisma.dDLongTableProgress.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, level: nextLevel },
    update: { level: nextLevel, updatedAt: new Date() },
  })

  return NextResponse.json({ level: nextLevel })
}
