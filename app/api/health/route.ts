import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()
  const version = process.env.NEXT_PUBLIC_BUILD_VERSION || '0.0.0'
  const buildSha = process.env.NEXT_PUBLIC_GIT_SHA || 'unknown'

  const checks: Record<string, string> = {}

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  // Stripe check
  try {
    await getStripe().balance.retrieve()
    checks.stripe = 'ok'
  } catch {
    checks.stripe = 'error'
  }

  checks.auth = checks.database === 'ok' ? 'ok' : 'error'

  const status = Object.values(checks).every(v => v === 'ok') ? 'healthy' : 'degraded'

  return NextResponse.json({
    site: 'discreet-dynasties',
    status,
    version,
    buildSha,
    timestamp,
    checks,
    crons: {},
  })
}
