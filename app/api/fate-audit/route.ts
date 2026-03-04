import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()

  const body = await req.json()
  const { answers, scores } = body

  if (!answers || !scores) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Save audit if logged in
  if (session?.user?.id) {
    await prisma.dDFateAudit.create({
      data: {
        userId: session.user.id,
        rawAnswers: answers,
        foodStability: scores.food >= 1 ? 1 : 0,
        foodContinuity: scores.food >= 2 ? 1 : 0,
        foodIntegrity: scores.food >= 3 ? 1 : 0,
        assuranceStability: scores.assurance >= 1 ? 1 : 0,
        assuranceContinuity: scores.assurance >= 2 ? 1 : 0,
        assuranceIntegrity: scores.assurance >= 3 ? 1 : 0,
        toolsStability: scores.tools >= 1 ? 1 : 0,
        toolsContinuity: scores.tools >= 2 ? 1 : 0,
        toolsIntegrity: scores.tools >= 3 ? 1 : 0,
        energyStability: scores.energy >= 1 ? 1 : 0,
        energyContinuity: scores.energy >= 2 ? 1 : 0,
        energyIntegrity: scores.energy >= 3 ? 1 : 0,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
