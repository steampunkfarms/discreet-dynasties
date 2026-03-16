import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const GIFT_LABELS: Record<string, string> = {
  '1_week': '1-Week Access',
  '1_month': '1-Month Access',
  '3_months': '3-Month Access',
  'walking_pass': 'Walking Pass (Forever Free)',
}

function generateCode(): string {
  return 'DD-' + randomBytes(6).toString('hex').toUpperCase()
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { type, recipientEmail, note } = await req.json()

  const validTypes = ['1_week', '1_month', '3_months', 'walking_pass']
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid gift type' }, { status: 400 })
  }

  const code = generateCode()

  const gift = await prisma.dDGiftCode.create({
    data: {
      code,
      type,
      recipientEmail: recipientEmail || null,
      note: note || null,
      grantedByAdminId: session.user.id,
      sentAt: recipientEmail ? new Date() : null,
    },
  })

  // Send email if recipient provided
  if (recipientEmail) {
    const giftLabel = GIFT_LABELS[type]
    const redeemUrl = `${process.env.NEXTAUTH_URL ?? 'https://discreet.tronboll.us'}/gift/${code}`

    await resend.emails.send({
      from: 'Discreet Dynasties <noreply-discreet@tronboll.us>',
      to: recipientEmail,
      subject: `Your gift: ${giftLabel} to Discreet Dynasties`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #F5F0E8; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #FDFAF5; border: 1px solid #D4C9A8; border-radius: 4px; padding: 40px;">
    <p style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #7A6E55; margin: 0 0 24px;">Discreet Dynasties</p>
    <h1 style="font-size: 22px; color: #1C1812; margin: 0 0 16px; font-weight: 400;">You've been given access.</h1>
    <p style="font-size: 15px; color: #3C3628; line-height: 1.6; margin: 0 0 12px;">
      Someone thought you'd find value here. You've been gifted <strong>${giftLabel}</strong> to Discreet Dynasties.
    </p>
    ${note ? `<p style="font-size: 14px; color: #5C5445; line-height: 1.6; margin: 0 0 24px; padding: 16px; background: #F0EAD8; border-left: 3px solid #C4873C; font-style: italic;">"${note}"</p>` : '<p style="margin-bottom: 24px;"></p>'}
    <p style="font-size: 14px; color: #5C5445; line-height: 1.6; margin: 0 0 28px;">
      Use the button below to create your account or sign in. Your gift will be applied automatically.
    </p>
    <a href="${redeemUrl}" style="display: inline-block; background: #1C1812; color: #F2EDE5; text-decoration: none; padding: 12px 28px; font-size: 14px; letter-spacing: 0.05em; border-radius: 2px;">Claim Your Access →</a>
    <p style="font-size: 12px; color: #8C8070; margin: 24px 0 0; line-height: 1.5;">
      Or copy this link: ${redeemUrl}<br>
      ${type !== 'walking_pass' ? 'This gift expires from the day you first sign in.' : 'This pass grants permanent free access.'}
    </p>
    <hr style="border: none; border-top: 1px solid #D4C9A8; margin: 28px 0;">
    <p style="font-size: 11px; color: #8C8070; margin: 0; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.05em;">DISCREET DYNASTIES — BUILD WHAT LASTS</p>
  </div>
</body>
</html>
      `.trim(),
    })
  }

  return NextResponse.json({ code: gift.code, id: gift.id })
}

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const gifts = await prisma.dDGiftCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      redeemedBy: { select: { email: true, name: true } },
    },
  })

  return NextResponse.json(gifts)
}
