import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import GiftRedemptionClient from './GiftRedemptionClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Claim Your Gift' }

const GIFT_LABELS: Record<string, string> = {
  '1_week': '1 Week',
  '1_month': '1 Month',
  '3_months': '3 Months',
  'walking_pass': 'Forever Free (Walking Pass)',
}

export default async function GiftPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const session = await auth()

  const gift = await prisma.dDGiftCode.findUnique({
    where: { code },
    include: { redeemedBy: { select: { email: true } } },
  })

  if (!gift) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-mono text-xs text-[var(--color-ink-muted)] uppercase tracking-widest mb-3">Gift Access</p>
          <h1 className="font-display text-2xl text-[var(--color-ink)] mb-3">Code Not Found</h1>
          <p className="text-[var(--color-ink-muted)]">This gift code is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  if (gift.redeemedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-mono text-xs text-[var(--color-ink-muted)] uppercase tracking-widest mb-3">Gift Access</p>
          <h1 className="font-display text-2xl text-[var(--color-ink)] mb-3">Already Claimed</h1>
          <p className="text-[var(--color-ink-muted)]">
            This gift was already redeemed on {new Date(gift.redeemedAt).toLocaleDateString()}.
          </p>
        </div>
      </div>
    )
  }

  // Not signed in — redirect to signin with return URL
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/gift/${code}`)
  }

  const giftLabel = GIFT_LABELS[gift.type] ?? gift.type

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-8 text-center">
          <p className="font-mono text-xs text-[var(--color-amber)] uppercase tracking-widest mb-4">Gift Access</p>
          <h1 className="font-display text-2xl text-[var(--color-ink)] mb-3">
            {giftLabel} Access
          </h1>
          <p className="text-[var(--color-ink-muted)] mb-2">
            You've been gifted access to Discreet Dynasties.
          </p>
          {gift.note && (
            <p className="text-sm text-[var(--color-ink-muted)] italic px-4 py-3 bg-[var(--color-amber)]/5 border border-[var(--color-amber)]/20 rounded-sm my-4">
              "{gift.note}"
            </p>
          )}
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            {gift.type === 'walking_pass'
              ? 'This is a permanent free pass. It never expires.'
              : `Your ${giftLabel.toLowerCase()} access begins when you claim it.`}
          </p>
          <GiftRedemptionClient code={code} />
        </div>
      </div>
    </div>
  )
}
