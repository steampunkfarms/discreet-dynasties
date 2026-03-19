import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await req.json()
  const trimmed = (username || '').trim()

  if (trimmed && !/^[a-zA-Z0-9_]{1,30}$/.test(trimmed)) {
    return NextResponse.json({ error: 'Username must be 1–30 letters, numbers, or underscores' }, { status: 400 })
  }

  const existing = trimmed
    ? await prisma.user.findFirst({ where: { username: trimmed, NOT: { id: session.user.id } } })
    : null

  if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 409 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username: trimmed || null },
  })

  return NextResponse.json({ ok: true })
}
