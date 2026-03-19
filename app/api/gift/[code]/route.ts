import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const GIFT_DAYS: Record<string, number | null> = {
  '1_week': 7,
  '1_month': 30,
  '3_months': 90,
  'walking_pass': null,
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to redeem this gift.' }, { status: 401 })
  }

  const { code } = await params

  const gift = await prisma.dDGiftCode.findUnique({ where: { code } })

  if (!gift) {
    return NextResponse.json({ error: 'Invalid gift code.' }, { status: 404 })
  }
  if (gift.redeemedAt) {
    return NextResponse.json({ error: 'This gift has already been redeemed.' }, { status: 400 })
  }

  const days = GIFT_DAYS[gift.type]
  const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null

  await prisma.$transaction([
    prisma.dDGiftCode.update({
      where: { code },
      data: {
        redeemedByUserId: session.user.id,
        redeemedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: gift.type === 'walking_pass' ? 'dd_basic' : 'dd_basic',
        isPaid: true,
        ddAccessExpiresAt: expiresAt,
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    type: gift.type,
    expiresAt: expiresAt?.toISOString() ?? null,
  })
}
