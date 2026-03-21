import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getPathwayBySlug } from '@/lib/dd/pathways'
import { prisma } from '@/lib/db'
import { courseJsonLd, breadcrumbJsonLd, JsonLdScript } from '@/lib/json-ld'

const BASE_URL = 'https://discreet.tronboll.us'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathway = getPathwayBySlug(params.slug)
  if (!pathway) return { title: 'Pathway' }
  const description = pathway.description.length > 160
    ? pathway.description.slice(0, 157) + '...'
    : pathway.description
  return {
    title: pathway.title,
    description,
    openGraph: { title: pathway.title, description },
  }
}

export default async function PathwayPage({ params }: Props) {
  const pathway = getPathwayBySlug(params.slug)
  if (!pathway) notFound()

  const session = await auth()
  const userId = session?.user?.id
  const userRole = (session?.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const isSteward = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  if (!isPaid) redirect('/join')
  if (pathway.tier === 'steward' && !isSteward) redirect('/join')

  // Load progress
  let progress = null
  if (userId) {
    progress = await prisma.dDPathwayProgress.findFirst({
      where: { userId, pathway: pathway.slug },
    })
  }

  const currentWeek = progress?.weekNumber || 1
  // Build completedWeeks from weekNumber (all weeks before current are complete)
  const completedWeeks: number[] = progress ? Array.from({ length: currentWeek - 1 }, (_, i) => i + 1) : []

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <JsonLdScript data={courseJsonLd({
        name: pathway.title,
        description: pathway.description,
        url: `${BASE_URL}/pathways/${pathway.slug}`,
        numberOfWeeks: pathway.weekCount,
      })} />
      <JsonLdScript data={breadcrumbJsonLd([
        { name: 'Home', url: BASE_URL },
        { name: 'Pathways', url: `${BASE_URL}/pathways` },
        { name: pathway.title, url: `${BASE_URL}/pathways/${pathway.slug}` },
      ])} />

      <div className="mb-4">
        <Link href="/pathways" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
          ← All Pathways
        </Link>
      </div>

      <div className="mb-10">
        <span className="text-3xl mb-3 block" aria-hidden="true">{pathway.icon}</span>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-3">Guided Pathway</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-2">{pathway.title}</h1>
        <p className="text-sm text-dynasty-ink-muted">{pathway.subtitle}</p>
      </div>

      <div className="mb-10 p-5 bg-dynasty-surface border border-dynasty-border rounded-sm">
        <p className="text-sm text-dynasty-ink-muted leading-relaxed">{pathway.description}</p>
      </div>

      {/* Progress */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-3">
          Progress — {completedWeeks.length} of {pathway.weekCount} weeks complete
        </p>
        <div className="flex gap-2 flex-wrap">
          {pathway.weeks.map(week => (
            <div
              key={week.number}
              className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-mono ${
                completedWeeks.includes(week.number)
                  ? 'bg-dynasty-amber text-dynasty-bg'
                  : week.number === currentWeek
                  ? 'border-2 border-dynasty-amber text-dynasty-amber'
                  : 'border border-dynasty-border text-dynasty-ink-muted'
              }`}
            >
              {week.number}
            </div>
          ))}
        </div>
      </div>

      {/* Week cards */}
      <div className="space-y-6">
        {pathway.weeks.map(week => {
          const isComplete = completedWeeks.includes(week.number)
          const isCurrent = week.number === currentWeek && !isComplete

          return (
            <div
              key={week.number}
              className={`border rounded-sm p-6 ${
                isCurrent ? 'border-dynasty-amber/50 bg-dynasty-surface' : 'border-dynasty-border'
              } ${isComplete ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-1">Week {week.number}</p>
                  <h2 className="font-display text-display-sm font-semibold text-dynasty-ink">{week.title}</h2>
                </div>
                {isComplete && <span className="font-mono text-xs text-dynasty-amber">Complete ✓</span>}
                {isCurrent && <span className="font-mono text-xs text-dynasty-amber border border-dynasty-amber px-2 py-1 rounded-sm">Current</span>}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2">This Week&apos;s Action</p>
                  <p className="text-sm text-dynasty-ink leading-relaxed">{week.action}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2">Reflection</p>
                  <p className="text-sm text-dynasty-ink-muted italic leading-relaxed">{week.reflection}</p>
                </div>
              </div>

              {isCurrent && userId && (
                <form action={`/api/pathways/${pathway.slug}/complete`} method="POST" className="mt-6">
                  <input type="hidden" name="week" value={week.number} />
                  <button
                    type="submit"
                    className="font-mono text-xs text-dynasty-bg bg-dynasty-amber px-4 py-2 rounded-sm hover:bg-dynasty-amber-light transition-colors"
                  >
                    Mark Week {week.number} Complete
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
