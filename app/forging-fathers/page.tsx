import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { ADVISORS } from '@/lib/ai/prompts'

export const metadata = { title: 'Forging Fathers' }

const ADVISOR_GROUPS = [
  {
    label: 'American Founders',
    keys: ['washington', 'franklin', 'adams'] as const,
  },
  {
    label: 'Biblical Advisors',
    keys: ['joseph', 'solomon', 'nehemiah', 'david'] as const,
  },
  {
    label: 'Historical Figures',
    keys: ['lincoln', 'marcus', 'musashi', 'cincinnatus', 'lewis', 'boone'] as const,
  },
]

export default async function ForgingFathersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isDynast = ['dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const isSteward = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  if (!isSteward) redirect('/join')

  return (
    <div className="page-enter max-w-wide mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">Forging Fathers</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-3">Council of Advisors</h1>
        <p className="text-sm text-dynasty-ink-muted max-w-xl leading-relaxed">
          Thirteen historical and biblical figures — each embodied as a Dynasty Advisor. Ask them what you would ask a wise elder who has lived what you&apos;re building.
        </p>
        {isDynast && (
          <div className="mt-4 p-4 bg-dynasty-surface border border-dynasty-amber/20 rounded-sm inline-block">
            <p className="font-mono text-xs text-dynasty-amber">
              Dynast Access — Council Mode available in the Companion
            </p>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {ADVISOR_GROUPS.map(group => (
          <div key={group.label}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-ink-muted mb-6">{group.label}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.keys.map(key => {
                const advisor = ADVISORS[key]
                return (
                  <Link
                    key={key}
                    href={`/companion?advisor=${key}`}
                    className="block border border-dynasty-border rounded-sm p-5 hover:border-dynasty-amber/40 transition-colors group"
                  >
                    <div className="mb-3">
                      <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-1">{advisor.era}</p>
                      <h2 className="font-display text-lg font-semibold text-dynasty-ink group-hover:text-dynasty-amber transition-colors">
                        {advisor.name}
                      </h2>
                    </div>
                    <p className="text-xs text-dynasty-ink-muted leading-relaxed mb-4">{advisor.domain}</p>
                    <p className="text-xs font-mono text-dynasty-amber/60 group-hover:text-dynasty-amber transition-colors">
                      Open Session →
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {isDynast && (
        <div className="mt-16 border border-dynasty-amber/30 rounded-sm p-8 bg-dynasty-surface">
          <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">Council Mode</p>
          <h2 className="font-display text-display-sm font-light text-dynasty-ink mb-3">Two Advisors, One Conversation</h2>
          <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6 max-w-xl">
            Bring two advisors into the same session. Watch them agree, disagree, and synthesize. The tension between different kinds of wisdom is the point.
          </p>
          <Link
            href="/companion?mode=council"
            className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Open Council Mode
          </Link>
        </div>
      )}

      {!isDynast && (
        <div className="mt-16 border border-dynasty-border rounded-sm p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">Dynast Tier</p>
          <h2 className="font-display text-display-sm font-light text-dynasty-ink mb-3">Council Mode</h2>
          <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6 max-w-xl">
            Dynast members can run Council Mode — two advisors in one conversation. Available with Dynast or Forge Bundle membership.
          </p>
          <Link
            href="/join"
            className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Become a Dynast
          </Link>
        </div>
      )}
    </div>
  )
}
