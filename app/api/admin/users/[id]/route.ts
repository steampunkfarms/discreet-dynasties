import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { role } = await req.json()

  const validRoles = ['free', 'dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role, isPaid: role !== 'free' },
    select: { id: true, role: true },
  })

  return NextResponse.json(user)
}
