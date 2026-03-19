import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { format } from 'date-fns'

export const metadata = { title: 'The Vow' }

interface Props { searchParams: { taken?: string } }

export default async function TheVowPage({ searchParams }: Props) {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role || 'free'
  const isDynast = ['dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const justTook = searchParams.taken === '1'

  // Load user's vow if they're logged in
  const existingVow = session?.user?.id && isDynast
    ? await prisma.dDVow.findUnique({ where: { userId: session.user.id } })
    : null

  // Load public vow registry
  const publicVows = await prisma.dDVow.findMany({
    where: { isPublic: true },
    orderBy: { takenAt: 'asc' },
    select: { displayName: true, state: true, takenAt: true },
    take: 100,
  })

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">

      {/* Success banner */}
      {justTook && (
        <div className="mb-10 p-5 bg-dynasty-amber/10 border border-dynasty-amber/30 rounded-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-2">The Vow Recorded</p>
          <p className="text-sm text-dynasty-ink leading-relaxed">
            Your commitment has been recorded. The work continues — not because of this moment, but because of every day after it.
          </p>
        </div>
      )}

      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Vow</p>
        <h1 className="font-display text-display-xl font-light text-dynasty-ink mb-4">
          A Covenant With Time
        </h1>
        <p className="font-display text-xl text-dynasty-ink-muted font-light italic max-w-lg">
          Not a promise to others. A reckoning with what you are building.
        </p>
      </div>

      <div className="prose-content mb-16">
        <p>
          The Vow is not a ceremony for show. It is a private commitment — the moment a man stops building by accident and begins building by intent.
        </p>
        <p>
          It acknowledges what is true: that a dynasty is not an inheritance. It is a practice. It begins with one man, in one season, making one decision — that what he builds will outlast him, and that the outlasting is worth the work.
        </p>
        <p>
          You do not need an audience. You do not need a ceremony. You need only the honest answer to one question:
        </p>
        <blockquote>
          Am I building something that cannot easily be broken?
        </blockquote>
        <p>
          If the answer is yes — or if it is not yet yes, but you intend to make it yes — then you are ready for The Vow.
        </p>
      </div>

      <div className="border border-dynasty-border rounded-sm p-8 mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-6">The Vow</p>
        <blockquote className="font-display text-lg text-dynasty-ink font-light leading-relaxed space-y-4">
          <p>I build for those who come after me — not to leave a monument, but to leave a foundation.</p>
          <p>I will not build for spectacle or recognition. I will build quietly, faithfully, in the daily work of household sovereignty.</p>
          <p>I commit to the FATE of my household: that my household will not be easily broken by food shortage, financial crisis, loss of skills, or energy dependence.</p>
          <p>I commit to the Long Table: to extend my preparation to those in my trusted circle, and to accept responsibility for those who cannot yet prepare for themselves.</p>
          <p>I take The Vow not because I am ready. I take it because I intend to become ready — and because the intention, made formal, changes how I build.</p>
        </blockquote>
      </div>

      {/* Dynast CTA */}
      {isDynast ? (
        <div className="mb-16">
          {existingVow ? (
            <div className="p-6 bg-dynasty-surface border border-dynasty-amber/30 rounded-sm">
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">The Vow Taken</p>
              <p className="text-sm text-dynasty-ink mb-1">
                Recorded on {format(new Date(existingVow.takenAt), 'MMMM d, yyyy')}
                {existingVow.displayName ? ` · ${existingVow.displayName}` : ''}
                {existingVow.state ? ` · ${existingVow.state}` : ''}
              </p>
              <p className="text-xs text-dynasty-ink-muted mb-4">
                {existingVow.isPublic ? 'Listed publicly in the registry below.' : 'Private — not listed publicly.'}
              </p>
              <Link
                href="/the-vow/take"
                className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors"
              >
                Renew or update your Vow →
              </Link>
            </div>
          ) : (
            <div className="p-6 bg-dynasty-surface border border-dynasty-amber/30 rounded-sm">
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">Dynast Access</p>
              <p className="text-sm text-dynasty-ink-muted mb-4">
                As a Dynast member, you can take The Vow formally — recorded to your dynasty account with date and commitment statement.
              </p>
              <Link
                href="/the-vow/take"
                className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
              >
                Take The Vow
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-16 p-6 bg-dynasty-surface border border-dynasty-border rounded-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">Dynast Tier Required</p>
          <p className="text-sm text-dynasty-ink-muted mb-4">
            The formal Vow ceremony is available to Dynast members. It includes a personalized commitment record and access to Forging Fathers.
          </p>
          <Link
            href="/join"
            className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Become a Dynast
          </Link>
        </div>
      )}

      {/* Public Registry */}
      {publicVows.length > 0 && (
        <div>
          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-2">Those Who Have Taken The Vow</p>
            <p className="text-xs text-dynasty-ink-muted">
              {publicVows.length} {publicVows.length === 1 ? 'builder has' : 'builders have'} chosen to be listed. Only display names and regions are shown.
            </p>
          </div>
          <div className="border border-dynasty-border rounded-sm divide-y divide-dynasty-border">
            {publicVows.map((vow, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-dynasty-amber">{i + 1}</span>
                  <span className="text-sm text-dynasty-ink">
                    {vow.displayName || 'Anonymous'}
                    {vow.state && <span className="text-dynasty-ink-muted"> · {vow.state}</span>}
                  </span>
                </div>
                <span className="font-mono text-xs text-dynasty-ink-muted">
                  {format(new Date(vow.takenAt), 'MMM yyyy')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
