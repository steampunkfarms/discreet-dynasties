import { prisma } from '@/lib/db'
import GiftCreator from './GiftCreator'

const GIFT_LABELS: Record<string, string> = {
  '1_week': '1 Week',
  '1_month': '1 Month',
  '3_months': '3 Months',
  'walking_pass': 'Walking Pass',
}

export default async function AdminGiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams

  const where = filter === 'redeemed'
    ? { redeemedAt: { not: null as unknown as Date } }
    : filter === 'pending'
    ? { redeemedAt: null }
    : {}

  const gifts = await prisma.dDGiftCode.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      redeemedBy: { select: { email: true, name: true } },
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://discreet.tronboll.us'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">Gift Access</h1>
      </div>

      <GiftCreator />

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-medium text-[var(--color-ink)]">All Codes</h2>
          <div className="flex gap-2">
            {[['', 'All'], ['pending', 'Pending'], ['redeemed', 'Redeemed']].map(([f, label]) => (
              <a
                key={f}
                href={f ? `/admin/gifts?filter=${f}` : '/admin/gifts'}
                className={`px-2.5 py-1 text-xs rounded-sm border transition-colors ${
                  (filter ?? '') === f
                    ? 'bg-[var(--color-amber)] text-[var(--color-bg)] border-[var(--color-amber)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Code</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Type</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Recipient</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Status</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Created</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Link</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map(g => (
                <tr key={g.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-amber)]/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[var(--color-ink)]">{g.code}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-ink)]">{GIFT_LABELS[g.type] ?? g.type}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-ink-muted)]">
                    {g.recipientEmail ?? '—'}
                    {g.note && (
                      <p className="text-xs italic text-[var(--color-ink-muted)]/60 mt-0.5 max-w-xs truncate">"{g.note}"</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {g.redeemedAt ? (
                      <div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Redeemed</span>
                        <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                          {g.redeemedBy?.email ?? 'unknown'}<br/>
                          {new Date(g.redeemedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--color-amber)]">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--color-ink-muted)]">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    {!g.redeemedAt && (
                      <button
                        onClick={undefined}
                        className="text-xs text-[var(--color-amber)] hover:underline font-mono"
                        title={`${baseUrl}/gift/${g.code}`}
                      >
                        <CopyLink code={g.code} baseUrl={baseUrl} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {gifts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-[var(--color-ink-muted)]">
                    No gift codes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CopyLink({ code, baseUrl }: { code: string; baseUrl: string }) {
  // Server-rendered copy link — needs to be client for clipboard
  return <span className="font-mono text-[10px]">copy link</span>
}
