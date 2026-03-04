import Link from 'next/link'
import { auth } from '@/auth'

export const metadata = { title: 'The Vow' }

export default async function TheVowPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role || 'free'
  const isDynast = ['dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
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

      {isDynast ? (
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
      ) : (
        <div className="p-6 bg-dynasty-surface border border-dynasty-border rounded-sm">
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
    </div>
  )
}
