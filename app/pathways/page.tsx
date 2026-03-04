import Link from 'next/link'
import { DD_PATHWAYS } from '@/lib/dd/pathways'
import { auth } from '@/auth'

export const metadata = { title: 'Pathways' }

export default async function PathwaysPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const isSteward = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  return (
    <div className="page-enter max-w-wide mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">Guided Pathways</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">Build Week by Week</h1>
        <p className="text-sm text-dynasty-ink-muted max-w-xl leading-relaxed">
          Six structured programs. One week, one action, one reflection. Each pathway is designed to build real, lasting capability — not knowledge that stays on paper.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DD_PATHWAYS.map(pathway => {
          const isLocked = pathway.tier === 'steward' && !isSteward
          const canEnter = isPaid && !isLocked

          return (
            <div key={pathway.slug} className={`border border-dynasty-border rounded-sm p-6 ${isLocked ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-2xl mb-2 block" aria-hidden="true">{pathway.icon}</span>
                  <h2 className="font-display text-display-sm font-semibold text-dynasty-ink">{pathway.title}</h2>
                  <p className="text-sm text-dynasty-ink-muted mt-1">{pathway.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-dynasty-amber block">
                    {pathway.weekCount} weeks
                  </span>
                  <span className="font-mono text-xs text-dynasty-ink-muted capitalize block mt-1">
                    {pathway.tier}+
                  </span>
                </div>
              </div>

              <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6">{pathway.description}</p>

              {canEnter ? (
                <Link
                  href={`/pathways/${pathway.slug}`}
                  className="inline-block font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors"
                >
                  Begin Pathway →
                </Link>
              ) : !isPaid ? (
                <Link href="/join" className="inline-block font-mono text-xs text-dynasty-amber">
                  Unlock with Builder →
                </Link>
              ) : (
                <Link href="/join" className="inline-block font-mono text-xs text-dynasty-amber">
                  Unlock with Steward →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
