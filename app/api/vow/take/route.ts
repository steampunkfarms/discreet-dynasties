import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isDynast = ['dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isDynast) {
    return NextResponse.json({ error: 'Dynast access required' }, { status: 403 })
  }

  const { displayName, state, isPublic } = await req.json()

  // Upsert — taking it again renews the date
  await prisma.dDVow.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName: displayName || null,
      state: state || null,
      isPublic: Boolean(isPublic),
    },
    update: {
      takenAt: new Date(),
      displayName: displayName || null,
      state: state || null,
      isPublic: Boolean(isPublic),
    },
  })

  return NextResponse.json({ ok: true })
}
