import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import LongTableProgressForm from './LongTableProgressForm'

export const metadata = { title: 'The Long Table' }

const LEVELS = [
  {
    number: 1,
    name: 'My Household',
    description: 'The first jurisdiction you must win. Your household must be prepared before you can extend to anyone else. Complete your FATE Audit and reach Stability in all four domains.',
    action: 'Take your FATE Audit',
    actionHref: '/assessments/fate',
  },
  {
    number: 2,
    name: 'The Two-Family Standard',
    description: 'Prepared enough for your household plus one equal household. The minimum ethical standard of Discreet Dynasties. Not a goal — a baseline. If you have the means, you have the obligation.',
    action: 'Quiet Mutual Aid Pathway',
    actionHref: '/pathways/quiet-mutual-aid',
  },
  {
    number: 3,
    name: 'Neighborhood Resilience',
    description: 'The third ring. Know your neighbors. Identify vulnerabilities and surpluses on your street. You do not need to announce your preparations — only to know who needs what and who has what.',
    action: 'Long Table Circle Map',
    actionHref: '/armory/long-table-map',
  },
  {
    number: 4,
    name: 'The Long Table',
    description: 'Your trusted circle — 5 to 12 households who have formally committed to mutual readiness. Not a group chat. A council. Each member known, each role understood, each gap identified.',
    action: 'Build your Trusted List',
    actionHref: '/armory/trusted-list-profile',
  },
  {
    number: 5,
    name: 'Civic Extension',
    description: 'Engagement with civic institutions that matter: sheriff, school board, city council, DA. Not politics — governance. The Long Table builder earns a seat at these tables through competence, not ideology.',
    action: null,
    actionHref: null,
  },
  {
    number: 6,
    name: 'Regional Foundation',
    description: 'The outermost ring. A household network that spans a region and can respond to major, sustained disruptions. Few reach this level. It is not a destination — it is the horizon that keeps you building.',
    action: null,
    actionHref: null,
  },
]

export default async function LongTablePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isPaid) redirect('/join')

  const progress = await prisma.dDLongTableProgress.findUnique({
    where: { userId: session.user.id },
  })

  const currentLevel = progress?.level || 1

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Long Table</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">
          From Household to Civic Foundation
        </h1>
        <p className="text-sm text-dynasty-ink-muted max-w-xl leading-relaxed">
          A dynasty does not stop at the front door. The Long Table is the framework for extending household sovereignty outward — deliberately, quietly, at the pace of trust.
        </p>
      </div>

      {/* Progress bar + level advance */}
      <div className="mb-10 p-5 bg-dynasty-surface border border-dynasty-border rounded-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted">Your Current Level</p>
          <p className="font-mono text-xs text-dynasty-amber">{LEVELS[currentLevel - 1]?.name}</p>
        </div>
        <div className="flex gap-2 mb-4">
          {LEVELS.map(l => (
            <div
              key={l.number}
              className={`flex-1 h-1.5 rounded-full ${
                l.number < currentLevel ? 'bg-dynasty-amber' : l.number === currentLevel ? 'bg-dynasty-amber/40' : 'bg-dynasty-border'
              }`}
            />
          ))}
        </div>
        <LongTableProgressForm currentLevel={currentLevel} maxLevel={LEVELS.length} />
      </div>

      {/* Level cards */}
      <div className="space-y-0">
        {LEVELS.map((level, i) => {
          const isComplete = level.number < currentLevel
          const isCurrent = level.number === currentLevel
          const isLocked = level.number > currentLevel

          return (
            <div key={level.number} className="relative">
              <div className={`flex items-start gap-6 py-8 ${isLocked ? 'opacity-50' : ''}`}>
                <div className={`flex-shrink-0 w-12 h-12 border rounded-sm flex items-center justify-center ${
                  isComplete ? 'border-dynasty-amber bg-dynasty-amber/10' : isCurrent ? 'border-dynasty-amber' : 'border-dynasty-border'
                }`}>
                  {isComplete ? (
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                      <path d="M1 5.5L4.5 9L13 1" stroke="#C4873C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={`font-mono text-sm font-semibold ${isCurrent ? 'text-dynasty-amber' : 'text-dynasty-ink-muted'}`}>{level.number}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-display text-display-sm font-semibold text-dynasty-ink">{level.name}</h2>
                    {isCurrent && <span className="font-mono text-xs border border-dynasty-amber text-dynasty-amber px-2 py-0.5 rounded-sm">Current</span>}
                    {isComplete && <span className="font-mono text-xs text-dynasty-amber">✓ Complete</span>}
                  </div>
                  <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-3">{level.description}</p>
                  {level.action && level.actionHref && !isLocked && (
                    <Link href={level.actionHref} className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
                      {level.action} →
                    </Link>
                  )}
                </div>
              </div>
              {i < LEVELS.length - 1 && (
                <div
                  className={`absolute left-[47px] top-[4.5rem] h-full border-l ${isComplete ? 'border-dynasty-amber/40' : 'border-dynasty-border/50'}`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-12 p-6 bg-dynasty-surface border border-dynasty-border rounded-sm">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-3">Begin at Level 1</p>
        <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-4">
          Most households have not secured Level 1. There is no shame in this — only an opportunity for honest work. The Long Table begins at home.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link href="/assessments/fate" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">Take Your FATE Audit →</Link>
          <Link href="/pathways/quiet-mutual-aid" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">Quiet Mutual Aid Pathway →</Link>
        </div>
      </div>
    </div>
  )
}
