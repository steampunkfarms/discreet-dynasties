import Link from 'next/link'
import { DD_CHAPTERS, DD_SECTIONS } from '@/lib/dd/book'
import { auth } from '@/auth'

export const metadata = { title: 'The Living Book' }

export default async function BookPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role || 'free'
  const isAdmin = userRole === 'admin'
  const isPaid = isAdmin || ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle'].includes(userRole)

  return (
    <div className="page-enter max-w-wide mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Living Book</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">Discreet Dynasties</h1>
        <p className="text-sm text-dynasty-ink-muted max-w-xl leading-relaxed">
          28 chapters on building households that last. Read free chapters to start, or unlock the full book with a Builder membership.
        </p>
      </div>

      <div className="space-y-12">
        {DD_SECTIONS.map(section => {
          const chapters = DD_CHAPTERS.filter(c => c.section === section.key)
          return (
            <div key={section.key}>
              <div className="mb-4 pb-4 border-b border-dynasty-border">
                <h2 className="font-display text-display-sm font-semibold text-dynasty-ink">{section.label}</h2>
                <p className="text-sm text-dynasty-ink-muted mt-1">{section.description}</p>
              </div>
              <div className="space-y-2">
                {chapters.map(chapter => {
                  const isLocked = chapter.tier !== 'free' && !isPaid
                  return (
                    <div key={chapter.slug}>
                      {isLocked ? (
                        <div className="flex items-center justify-between p-4 border border-dynasty-border/50 rounded-sm opacity-60">
                          <div>
                            <span className="font-mono text-xs text-dynasty-ink-muted mr-3">{String(chapter.number).padStart(2, '0')}</span>
                            <span className="font-display text-base text-dynasty-ink-muted">{chapter.title}</span>
                            {chapter.subtitle && (
                              <span className="text-sm text-dynasty-ink-muted ml-2 italic">— {chapter.subtitle}</span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-dynasty-amber">Builder+</span>
                        </div>
                      ) : (
                        <Link
                          href={`/book/${chapter.slug}`}
                          className="flex items-center justify-between p-4 border border-dynasty-border rounded-sm hover:border-dynasty-amber/30 transition-colors group"
                        >
                          <div>
                            <span className="font-mono text-xs text-dynasty-ink-muted mr-3">{String(chapter.number).padStart(2, '0')}</span>
                            <span className="font-display text-base text-dynasty-ink group-hover:text-dynasty-amber transition-colors">{chapter.title}</span>
                            {chapter.subtitle && (
                              <span className="text-sm text-dynasty-ink-muted ml-2 italic">— {chapter.subtitle}</span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-dynasty-amber opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {!isPaid && (
        <div className="mt-16 p-8 bg-dynasty-surface border border-dynasty-border rounded-sm text-center">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-3">Unlock the Full Book</p>
          <h2 className="font-display text-display-sm font-light text-dynasty-ink mb-4">Builder Membership — $7/mo</h2>
          <p className="text-sm text-dynasty-ink-muted max-w-md mx-auto leading-relaxed mb-6">
            Access all 28 chapters, the FATE Audit, guided pathways, and the Dynasty Companion.
          </p>
          <Link
            href="/join"
            className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Join the Forge
          </Link>
        </div>
      )}
    </div>
  )
}
