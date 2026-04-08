/**
 * Cron lock — prevents concurrent execution of the same cron job.
 * Uses a unique constraint on cronName to enforce mutual exclusion.
 * Stale locks (older than 30 min) are cleaned automatically.
 */

import { prisma } from '@/lib/db'

export async function cleanStaleLocks(): Promise<void> {
  await prisma.cronLock.deleteMany({
    where: { lockedAt: { lt: new Date(Date.now() - 30 * 60 * 1000) } },
  })
}

export async function acquireCronLock(cronName: string): Promise<boolean> {
  try {
    await prisma.cronLock.create({ data: { cronName, lockedAt: new Date() } })
    return true
  } catch {
    return false
  }
}

export async function releaseCronLock(cronName: string): Promise<void> {
  await prisma.cronLock.deleteMany({ where: { cronName } })
}
