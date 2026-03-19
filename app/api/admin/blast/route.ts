import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY?.trim())

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { subject, body, segment } = await req.json()

  if (!subject?.trim() || !body?.trim() || !segment) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Build user filter based on segment
  let where: Record<string, unknown> = {}
  if (segment === 'free') where = { isPaid: false }
  if (segment === 'paid') where = { isPaid: true }
  if (segment === 'dd') where = { role: { in: ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'] } }
  if (segment === 'highlights') where = { emailHighlights: true }

  const users = await prisma.user.findMany({
    where: { ...where, email: { not: null } },
    select: { id: true, email: true },
  })

  if (users.length === 0) {
    return NextResponse.json({ error: 'No users in this segment.' }, { status: 400 })
  }

  // Create blast record
  const blast = await prisma.emailBlast.create({
    data: {
      adminId: session.user.id,
      subject,
      body,
      segment,
      recipientCount: users.length,
    },
  })

  // Send in batches of 50
  const BATCH_SIZE = 50
  const results: { userId: string; email: string; status: 'sent' | 'failed' }[] = []

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(
      batch.map(async u => {
        try {
          await resend.emails.send({
            from: 'Discreet Dynasties <discreet@tronboll.us>',
            to: u.email!,
            subject,
            html: body,
          })
          results.push({ userId: u.id, email: u.email!, status: 'sent' })
        } catch {
          results.push({ userId: u.id, email: u.email!, status: 'failed' })
        }
      })
    )
  }

  // Record recipients
  await prisma.emailBlastRecipient.createMany({
    data: results.map(r => ({
      blastId: blast.id,
      userId: r.userId,
      email: r.email,
      status: r.status,
    })),
  })

  const sentCount = results.filter(r => r.status === 'sent').length
  return NextResponse.json({ count: sentCount, blastId: blast.id })
}
