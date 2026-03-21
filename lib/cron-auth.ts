import { timingSafeEqual } from 'crypto'

/**
 * Verify cron route authorization.
 * Accepts either CRON_SECRET (Vercel cron) or INTERNAL_SECRET (Orchestrator).
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const internalSecret = process.env.INTERNAL_SECRET?.trim()

  if (!authHeader) return false

  const provided = authHeader.replace('Bearer ', '')
  if (!provided) return false

  // Check CRON_SECRET
  if (cronSecret && safeCompare(provided, cronSecret)) return true

  // Check INTERNAL_SECRET
  if (internalSecret && safeCompare(provided, internalSecret)) return true

  return false
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
