import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getTierLabel, getTierBadgeColor } from '@/lib/auth-helpers'
import { getFateLevelLabel, type FateDomain } from '@/lib/dd/fate'
import { DD_PATHWAYS } from '@/lib/dd/pathways'

export const metadata = { title: 'My Forge' }

const DOMAIN_LABELS: Record<FateDomain, string> = {
  food: 'Food',
  assurance: 'Assurance',
  tools: 'Tools & Skills',
  energy: 'Energy',
}

export default async function ForgePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const userId = session.user.id
  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  const [latestAudit, activePathways] = await Promise.all([
    prisma.dDFateAudit.findFirst({
      where: { userId },
      orderBy: { takenAt: 'desc' },
    }),
    isPaid ? prisma.dDPathwayProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }) : Promise.resolve([]),
  ])

  // Derive domain-level scores (max of stability=1, continuity=2, integrity=3)
  const fateScores: Record<FateDomain, number> | null = latestAudit ? {
    food: (latestAudit.foodIntegrity ? 3 : latestAudit.foodContinuity ? 2 : latestAudit.foodStability ? 1 : 0),
    assurance: (latestAudit.assuranceIntegrity ? 3 : latestAudit.assuranceContinuity ? 2 : latestAudit.assuranceStability ? 1 : 0),
    tools: (latestAudit.toolsIntegrity ? 3 : latestAudit.toolsContinuity ? 2 : latestAudit.toolsStability ? 1 : 0),
    energy: (latestAudit.energyIntegrity ? 3 : latestAudit.energyContinuity ? 2 : latestAudit.energyStability ? 1 : 0),
  } : null
  const domains: FateDomain[] = ['food', 'assurance', 'tools', 'energy']

  return (
    <div className="page-enter max-w-wide mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-3">My Forge</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-2">
          {session.user.email?.split('@')[0]}&apos;s Dynasty
        </h1>
        <span className={`font-mono text-xs ${getTierBadgeColor(userRole)}`}>
          {getTierLabel(userRole)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FATE Scores */}
        <div className="border border-dynasty-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-display-sm font-semibold text-dynasty-ink">FATE Scores</h2>
            <Link href="/assessments/fate" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
              {latestAudit ? 'Retake →' : 'Take Audit →'}
            </Link>
          </div>
          {fateScores ? (
            <div className="grid grid-cols-2 gap-4">
              {domains.map(domain => (
                <div key={domain} className="p-4 bg-dynasty-surface border border-dynasty-border rounded-sm">
                  <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-1">{DOMAIN_LABELS[domain]}</p>
                  <p className="font-display text-display-sm font-light text-dynasty-ink">{fateScores[domain] || 0}</p>
                  <p className="text-xs text-dynasty-ink-muted">{getFateLevelLabel((fateScores[domain] || 0) as 0 | 1 | 2 | 3)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-dynasty-ink-muted mb-4">No audit on file. Know where you stand.</p>
              <Link href="/assessments/fate" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
                Take Your First FATE Audit →
              </Link>
            </div>
          )}
        </div>

        {/* Active Pathways */}
        <div className="border border-dynasty-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-display-sm font-semibold text-dynasty-ink">Active Pathways</h2>
            <Link href="/pathways" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
              All Pathways →
            </Link>
          </div>
          {activePathways.length > 0 ? (
            <div className="space-y-4">
              {activePathways.map(p => {
                const pathway = DD_PATHWAYS.find(pw => pw.slug === p.pathway)
                if (!pathway) return null
                const currentWeek = p.weekNumber || 1
                return (
                  <Link key={p.id} href={`/pathways/${p.pathway}`} className="block p-4 bg-dynasty-surface border border-dynasty-border rounded-sm hover:border-dynasty-amber/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-display text-base font-semibold text-dynasty-ink">{pathway.title}</p>
                      <p className="font-mono text-xs text-dynasty-amber">Week {currentWeek}/{pathway.weekCount}</p>
                    </div>
                    <div className="flex gap-1">
                      {pathway.weeks.map(w => (
                        <div key={w.number} className={`h-1.5 flex-1 rounded-full ${
                          w.number < currentWeek
                            ? 'bg-dynasty-amber'
                            : w.number === currentWeek
                            ? 'bg-dynasty-amber/40'
                            : 'bg-dynasty-border'
                        }`} />
                      ))}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-dynasty-ink-muted mb-4">No active pathways. Begin building week by week.</p>
              {isPaid ? (
                <Link href="/pathways" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
                  Choose a Pathway →
                </Link>
              ) : (
                <Link href="/join" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
                  Join to Access Pathways →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="border border-dynasty-border rounded-sm p-6">
          <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/companion', label: 'Open Dynasty Companion', locked: !isPaid },
              { href: '/armory', label: 'Open The Armory', locked: !isPaid },
              { href: '/hall', label: 'Visit The Hall', locked: !isPaid },
              { href: '/journal', label: 'Dynasty Journal', locked: !isPaid },
              { href: '/book', label: 'Continue Reading', locked: false },
              { href: '/account', label: 'Account Settings', locked: false },
            ].map(item => (
              item.locked ? (
                <div key={item.href} className="flex items-center justify-between p-3 border border-dynasty-border/50 rounded-sm opacity-50">
                  <span className="text-sm text-dynasty-ink-muted">{item.label}</span>
                  <span className="font-mono text-xs text-dynasty-amber">Builder+</span>
                </div>
              ) : (
                <Link key={item.href} href={item.href} className="flex items-center justify-between p-3 border border-dynasty-border rounded-sm hover:border-dynasty-amber/30 transition-colors group">
                  <span className="text-sm text-dynasty-ink group-hover:text-dynasty-amber transition-colors">{item.label}</span>
                  <span className="font-mono text-xs text-dynasty-amber opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              )
            ))}
          </div>
        </div>

        {/* Upgrade CTA if free */}
        {!isPaid && (
          <div className="border border-dynasty-amber/30 bg-dynasty-surface rounded-sm p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">Unlock the Forge</p>
            <h2 className="font-display text-display-sm font-light text-dynasty-ink mb-3">
              Builder — $7/mo
            </h2>
            <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6">
              Full book access, FATE Audit, guided pathways, and the Dynasty Companion.
            </p>
            <Link href="/join" className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-5 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors">
              Join the Forge
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
