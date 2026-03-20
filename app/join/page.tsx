import Link from 'next/link'
import { auth } from '@/auth'
import { getTierLabel } from '@/lib/auth-helpers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscribe — Discreet Dynasties',
  description: 'Subscriptions are managed through Stoic Preparedness.',
}

export default async function JoinPage() {
  const session = await auth()
  const userRole = session?.user?.role || 'free'
  const hasPaidAccess = userRole !== 'free' && userRole !== 'admin'

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">
        Subscribe
      </p>

      {hasPaidAccess ? (
        <>
          <h1 className="font-display text-display-md font-light text-dynasty-ink mb-4">
            You&apos;re a {getTierLabel(userRole)}
          </h1>
          <p className="text-sm text-dynasty-ink-muted max-w-lg mx-auto leading-relaxed mb-8">
            You already have access to Discreet Dynasties. Continue to your dashboard
            or manage your subscription through Stoic Preparedness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/forge"
              className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber py-3 px-6 rounded-sm hover:bg-dynasty-amber-light transition-colors"
            >
              Continue to Your Dashboard
            </Link>
            <a
              href="https://stoic.tronboll.us/account?tab=billing"
              className="font-body text-sm font-medium text-dynasty-ink border border-dynasty-border py-3 px-6 rounded-sm hover:border-dynasty-amber/30 transition-colors"
            >
              Manage Subscription
            </a>
          </div>
        </>
      ) : (
        <>
          <h1 className="font-display text-display-md font-light text-dynasty-ink mb-4">
            Subscriptions are managed through Stoic Preparedness
          </h1>
          <p className="text-sm text-dynasty-ink-muted max-w-lg mx-auto leading-relaxed mb-4">
            Discreet Dynasties is part of the Tronboll Family of Sites. All subscriptions — including
            Builder, Steward, Dynast, and the Forge Bundle — are managed through Stoic Preparedness,
            the foundation everything is built on.
          </p>
          <p className="text-sm text-dynasty-ink-muted max-w-lg mx-auto leading-relaxed mb-8">
            Quiet wealth. Enduring households. Building multi-generational resilience through
            financial stewardship, estate planning, and discreet preparation.
          </p>
          <a
            href="https://stoic.tronboll.us/join"
            className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber py-3 px-6 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Subscribe at stoic.tronboll.us/join &rarr;
          </a>

          {/* FAQ */}
          <div className="max-w-content mx-auto mt-16 text-left">
            <h2 className="font-display text-display-sm font-light text-dynasty-ink mb-8 text-center">Common Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Where do I subscribe?',
                  a: 'All subscriptions are managed at stoic.tronboll.us/join. Once subscribed, your access is unified across all Tronboll sites.',
                },
                {
                  q: 'Can I use the same account?',
                  a: 'Yes. Use the same email address to sign in to both Stoic Preparedness and Discreet Dynasties. Your account is unified.',
                },
                {
                  q: 'What tiers give me DD access?',
                  a: 'Builder ($7/mo), Steward ($69/yr), Dynast ($199 lifetime), and Forge Bundle ($249 lifetime) all include Discreet Dynasties access.',
                },
                {
                  q: 'I already subscribed through this site. Is my subscription still active?',
                  a: 'Yes. All existing subscriptions remain active. You can manage billing at stoic.tronboll.us or through your account page here.',
                },
              ].map((item, i) => (
                <div key={i} className="border-b border-dynasty-border pb-6">
                  <h3 className="font-display text-base font-semibold text-dynasty-ink mb-2">{item.q}</h3>
                  <p className="text-sm text-dynasty-ink-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
