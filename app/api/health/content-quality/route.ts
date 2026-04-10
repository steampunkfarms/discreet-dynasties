import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCronAuth } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

const BLOCKLIST_PATTERNS = [
  /\(under \d+ characters?\)/i,
  /\(max \d+ chars?\)/i,
  /\(keep it under/i,
  /\[Your [\w\s]+\]/,
  /\{[\w_]+\}/,
  /<<[\w\s]+>>/,
  /Wall Post \(/i,
  /DO NOT mention/i,
  /as an AI/i,
  /I'm an AI/i,
  /language model/i,
  /\bLorem ipsum\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
]

function checkContent(text: string | null | undefined): string | null {
  if (!text) return null
  for (const pattern of BLOCKLIST_PATTERNS) {
    if (pattern.test(text)) return pattern.toString()
  }
  return null
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const issues: { type: string; content: string; source: string }[] = []

  // Check DailyDispatch (AI-generated daily emails)
  const dailyDispatches = await prisma.dailyDispatch
    .findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, content: true, subject: true },
    })
    .catch(() => [])

  for (const d of dailyDispatches) {
    for (const [field, val] of [
      ['content', d.content],
      ['subject', d.subject],
    ] as const) {
      const match = checkContent(val)
      if (match) {
        issues.push({
          type: 'prompt_leak',
          content: val.slice(0, 120),
          source: `DailyDispatch:${d.id}:${field}`,
        })
      }
    }
  }

  // Check ArmoryGeneration (AI-generated prep documents)
  const armoryItems = await prisma.armoryGeneration
    .findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, generatedContent: true },
    })
    .catch(() => [])

  for (const a of armoryItems) {
    const match = checkContent(a.generatedContent)
    if (match) {
      issues.push({
        type: 'prompt_leak',
        content: a.generatedContent.slice(0, 120),
        source: `ArmoryGeneration:${a.id}`,
      })
    }
  }

  // Check DDArmoryGeneration (DD-specific AI generators)
  const ddArmoryItems = await prisma.dDArmoryGeneration
    .findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, generatedContent: true },
    })
    .catch(() => [])

  for (const a of ddArmoryItems) {
    const match = checkContent(a.generatedContent)
    if (match) {
      issues.push({
        type: 'prompt_leak',
        content: a.generatedContent.slice(0, 120),
        source: `DDArmoryGeneration:${a.id}`,
      })
    }
  }

  // Check DDFateAudit AI action plans
  const fateAudits = await prisma.dDFateAudit
    .findMany({
      where: { takenAt: { gte: since } },
      select: { id: true, aiActionPlan: true },
    })
    .catch(() => [])

  for (const f of fateAudits) {
    const match = checkContent(f.aiActionPlan)
    if (match) {
      issues.push({
        type: 'prompt_leak',
        content: (f.aiActionPlan ?? '').slice(0, 120),
        source: `DDFateAudit:${f.id}:aiActionPlan`,
      })
    }
  }

  // Check DDPrepEvaluation AI analysis
  const prepEvals = await prisma.dDPrepEvaluation
    .findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, aiAnalysis: true, conversionPlan: true },
    })
    .catch(() => [])

  for (const p of prepEvals) {
    for (const [field, val] of [
      ['aiAnalysis', p.aiAnalysis],
      ['conversionPlan', p.conversionPlan],
    ] as const) {
      const match = checkContent(val)
      if (match) {
        issues.push({
          type: 'prompt_leak',
          content: (val ?? '').slice(0, 120),
          source: `DDPrepEvaluation:${p.id}:${field}`,
        })
      }
    }
  }

  // Check SocialPost content
  const socialPosts = await prisma.socialPost
    .findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, content: true },
    })
    .catch(() => [])

  for (const sp of socialPosts) {
    const match = checkContent(sp.content)
    if (match) {
      issues.push({
        type: 'prompt_leak',
        content: sp.content.slice(0, 120),
        source: `SocialPost:${sp.id}`,
      })
    }
  }

  return NextResponse.json({
    ok: issues.length === 0,
    issueCount: issues.length,
    issues,
    sampledAt: new Date().toISOString(),
  })
}
