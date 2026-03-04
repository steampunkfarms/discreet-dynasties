import Link from 'next/link'
import { auth } from '@/auth'

export const metadata = { title: 'The Armory' }

const GENERATORS = [
  { slug: 'fate-roadmap', title: 'FATE Improvement Roadmap', desc: 'Generate a custom 90-day plan for your weakest FATE domain.', tier: 'builder', icon: '⚖' },
  { slug: 'stability-plan', title: 'Household Stability Plan', desc: 'A complete stability protocol for your household size and situation.', tier: 'builder', icon: '⌂' },
  { slug: 'food-storage-calculator', title: 'Food Storage Calculator', desc: 'Calculate exact caloric needs, variety, and storage specs for your household.', tier: 'builder', icon: '◆' },
  { slug: 'dead-preps-audit', title: 'Dead Preps Audit', desc: 'Classify every prep you own: Dead, Zombie, or Living. Get a resurrection plan.', tier: 'builder', icon: '○' },
  { slug: 'long-table-map', title: 'Long Table Circle Map', desc: 'Map your trusted network across all six Long Table levels.', tier: 'builder', icon: '⬡' },
  { slug: 'fate-letter', title: 'Dynasty Letter', desc: 'A letter to your children explaining the household\'s FATE posture and the why behind it.', tier: 'steward', icon: '✦' },
  { slug: 'trusted-list-profile', title: 'Trusted List Profile', desc: 'Generate criteria and a formal profile for each person on your Trusted List.', tier: 'steward', icon: '△' },
  { slug: 'vow-draft', title: 'The Vow Draft', desc: 'A personal draft of The Vow — your covenant with dynastic time.', tier: 'steward', icon: '❧' },
  { slug: 'energy-plan', title: 'Energy Independence Plan', desc: 'A phased plan to move from grid-dependent to grid-optional.', tier: 'steward', icon: '⚡' },
  { slug: 'dynasty-wealth-plan', title: 'Dynasty Wealth Plan', desc: 'A household financial sovereignty roadmap from current state to Integrity level.', tier: 'steward', icon: '⬡' },
]

export default async function ArmoryPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const isSteward = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  if (!isPaid) {
    return (
      <div className="page-enter max-w-content mx-auto px-6 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Armory</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">Builder Access Required</h1>
        <p className="text-sm text-dynasty-ink-muted mb-8 max-w-md mx-auto leading-relaxed">
          The Armory is available to Builder members and above. Join to access all 10+ AI-powered generators.
        </p>
        <Link href="/join" className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors">
          Join the Forge
        </Link>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-wide mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Armory</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">Dynasty Generators</h1>
        <p className="text-sm text-dynasty-ink-muted max-w-xl leading-relaxed">
          AI-powered tools that produce household-specific plans, audits, and documents — all grounded in the book&apos;s doctrine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GENERATORS.map(gen => {
          const isLocked = gen.tier === 'steward' && !isSteward
          return (
            <div key={gen.slug} className={`border border-dynasty-border rounded-sm p-6 ${isLocked ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl" aria-hidden="true">{gen.icon}</span>
                {isLocked && <span className="font-mono text-xs text-dynasty-amber">Steward+</span>}
              </div>
              <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-2">{gen.title}</h2>
              <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-4">{gen.desc}</p>
              {isLocked ? (
                <Link href="/join" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
                  Unlock with Steward →
                </Link>
              ) : (
                <Link href={`/armory/${gen.slug}`} className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
                  Open Generator →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
