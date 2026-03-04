import Link from 'next/link'

export const metadata = { title: 'The Long Table' }

const LEVELS = [
  { number: 1, name: 'My Household', description: 'The first jurisdiction you must win. Your household must be prepared before you can extend to anyone else.', icon: '⌂' },
  { number: 2, name: 'The Two-Family Standard', description: 'Prepared enough for your household plus one equal household. The minimum ethical standard of Discreet Dynasties.', icon: '⌂⌂' },
  { number: 3, name: 'Neighborhood Resilience', description: 'The third ring. Know your neighbors. Identify vulnerabilities and surpluses on your street.', icon: '○○○' },
  { number: 4, name: 'The Long Table', description: 'Your trusted circle — 5 to 12 households who have formally committed to mutual readiness. Not a group chat. A council.', icon: '⬡' },
  { number: 5, name: 'Civic Extension', description: 'Engagement with civic institutions that matter: sheriff, school board, city council, DA. Not politics — governance.', icon: '△' },
  { number: 6, name: 'Regional Foundation', description: 'The outermost ring. A household network that spans a region and can respond to major, sustained disruptions.', icon: '✦' },
]

export default function LongTablePage() {
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

      <div className="space-y-0">
        {LEVELS.map((level, i) => (
          <div key={level.number} className="relative">
            <div className="flex items-start gap-6 py-8">
              <div className="flex-shrink-0 w-12 h-12 border border-dynasty-amber/30 rounded-sm flex items-center justify-center">
                <span className="font-mono text-sm font-semibold text-dynasty-amber">{level.number}</span>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-2">{level.name}</h2>
                <p className="text-sm text-dynasty-ink-muted leading-relaxed">{level.description}</p>
              </div>
            </div>
            {i < LEVELS.length - 1 && (
              <div className="absolute left-6 top-[4.5rem] h-full border-l border-dynasty-border/50" style={{ marginLeft: '23px' }} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-dynasty-surface border border-dynasty-border rounded-sm">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-3">Begin at Level 1</p>
        <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-4">
          Most households have not secured Level 1. There is no shame in this — only an opportunity for honest work. The Long Table begins at home.
        </p>
        <div className="flex gap-4">
          <Link href="/assessments/fate" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
            Take Your FATE Audit →
          </Link>
          <Link href="/pathways/quiet-mutual-aid" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
            Quiet Mutual Aid Pathway →
          </Link>
        </div>
      </div>
    </div>
  )
}
