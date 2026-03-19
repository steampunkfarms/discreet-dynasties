import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/db'
import { getTierLabel, getTierBadgeColor, isDDDynast } from '@/lib/auth-helpers'
import AccountUsernameForm from './AccountUsernameForm'
import AccountBillingButton from './AccountBillingButton'

export const metadata = { title: 'Account' }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, username: true, role: true, createdAt: true, stripeCustomerId: true },
  })

  const userRole = (user?.role as string) || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const isDynast = isDDDynast(userRole)
  const isLifetime = userRole === 'admin'

  const vow = isDynast
    ? await prisma.dDVow.findUnique({ where: { userId: session.user.id } })
    : null

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">Account</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Profile */}
        <div className="border border-dynasty-border rounded-sm p-6">
          <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-6">Profile</h2>
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-1">Email</p>
              <p className="text-sm text-dynasty-ink">{user?.email}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-1">Username</p>
              <AccountUsernameForm current={user?.username ?? null} />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-1">Account Tier</p>
              <p className={`text-sm font-medium ${getTierBadgeColor(userRole)}`}>
                {getTierLabel(userRole)}
              </p>
            </div>
            {user?.createdAt && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-1">Member Since</p>
                <p className="text-sm text-dynasty-ink">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Membership */}
        <div className="border border-dynasty-border rounded-sm p-6">
          <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-6">Membership</h2>
          <p className={`text-sm font-medium mb-4 ${getTierBadgeColor(userRole)}`}>
            Current plan: {getTierLabel(userRole)}
          </p>
          {userRole === 'free' ? (
            <Link
              href="/join"
              className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-5 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
            >
              Upgrade to Builder
            </Link>
          ) : isLifetime ? (
            <p className="text-sm text-dynasty-ink-muted">Lifetime access — no billing required.</p>
          ) : user?.stripeCustomerId ? (
            <AccountBillingButton />
          ) : (
            <p className="text-sm text-dynasty-ink-muted">No billing account linked.</p>
          )}
        </div>

        {/* The Vow — Dynasts only */}
        {isDynast && (
          <div className="border border-dynasty-amber/20 rounded-sm p-6 bg-dynasty-amber/5">
            <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-4">The Vow</h2>
            {vow ? (
              <div className="space-y-2">
                <p className="text-sm text-dynasty-ink">
                  Taken on {new Date(vow.takenAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {vow.displayName && <> as <span className="text-dynasty-amber">{vow.displayName}</span></>}
                  {vow.state && <>, {vow.state}</>}
                </p>
                <Link href="/the-vow/take" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
                  Renew The Vow →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-dynasty-ink-muted mb-3">You have not yet taken The Vow.</p>
                <Link
                  href="/the-vow/take"
                  className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-5 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
                >
                  Take The Vow
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Cross-site */}
        <div className="border border-dynasty-border rounded-sm p-6">
          <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-4">Other Forges</h2>
          <p className="text-sm text-dynasty-ink-muted mb-4">Your account is shared with Stoic Preparedness. Same email, unified access.</p>
          <a
            href="https://stoic.tronboll.us"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors"
          >
            Visit Stoic Preparedness →
          </a>
        </div>

        {/* Sign out */}
        <div className="border border-dynasty-border rounded-sm p-6">
          <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-4">Sign Out</h2>
          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}>
            <button type="submit" className="font-body text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors">
              Sign out of all forges
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
