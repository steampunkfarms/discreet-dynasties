import Link from 'next/link'
import { PLAN_DETAILS } from '@/lib/stripe'

export const metadata = { title: 'Join the Forge' }

export default function JoinPage() {
  const plans = Object.entries(PLAN_DETAILS) as [string, typeof PLAN_DETAILS[keyof typeof PLAN_DETAILS]][]

  return (
    <div className="page-enter max-w-wide mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">Join the Forge</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">
          Choose Your Level
        </h1>
        <p className="text-sm text-dynasty-ink-muted max-w-lg mx-auto leading-relaxed">
          Every tier gives you access to the Living Book and the Dynasty Companion. Build deeper as you go.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map(([key, plan]) => (
          <div key={key} className={`border rounded-sm p-6 flex flex-col ${
            key === 'dd_dynast' ? 'border-dynasty-amber' : 'border-dynasty-border'
          }`}>
            {key === 'dd_dynast' && (
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">Most Popular</p>
            )}
            <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-1">{plan.name}</h2>
            <p className="font-body text-xl font-medium text-dynasty-amber mb-2">{plan.price}</p>
            <p className="text-xs text-dynasty-ink-muted mb-4 capitalize">{plan.interval}</p>
            <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6">{plan.description}</p>
            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-dynasty-ink-light">
                  <span className="text-dynasty-amber mt-0.5 flex-shrink-0" aria-hidden="true">—</span>
                  {feature}
                </li>
              ))}
            </ul>
            <form action="/api/checkout" method="POST">
              <input type="hidden" name="tier" value={key} />
              <button
                type="submit"
                className={`w-full font-body text-sm font-medium py-3 px-4 rounded-sm transition-colors ${
                  key === 'dd_dynast'
                    ? 'text-dynasty-bg bg-dynasty-amber hover:bg-dynasty-amber-light'
                    : 'text-dynasty-ink border border-dynasty-border hover:border-dynasty-amber/30'
                }`}
              >
                Get {plan.name}
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-display-sm font-light text-dynasty-ink mb-8 text-center">Common Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'Can I use the same account as Stoic Preparedness?',
              a: 'Yes. Use the same email address to sign in. Your account is unified across both sites.',
            },
            {
              q: 'What is the difference between Builder and Steward?',
              a: 'Builder gives you the full book, FATE Audit, 3 pathways, and the Companion. Steward unlocks the full Armory, all 6 pathways, all 4 companion archetypes, and the historical/biblical advisor system.',
            },
            {
              q: 'What does the Dynast tier include?',
              a: 'Lifetime access to everything, plus Forging Fathers, The Vow ceremony, the Long Table Civic Framework, Council Mode (two advisors), and early access to all future content.',
            },
            {
              q: 'What is the Forge Bundle?',
              a: 'Both Stoic Preparedness and Discreet Dynasties at the Dynast/lifetime level. One payment, both forges, forever.',
            },
            {
              q: 'Can I cancel?',
              a: 'Builder (monthly) and Steward (annual) can be cancelled anytime. Dynast and Bundle are one-time payments with no renewals.',
            },
          ].map((item, i) => (
            <div key={i} className="border-b border-dynasty-border pb-6">
              <h3 className="font-display text-base font-semibold text-dynasty-ink mb-2">{item.q}</h3>
              <p className="text-sm text-dynasty-ink-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
