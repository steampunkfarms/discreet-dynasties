import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/db'
import { getTierLabel, getTierBadgeColor } from '@/lib/auth-helpers'

export const metadata = { title: 'Account' }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, username: true, role: true, createdAt: true },
  })

  const userRole = (user?.role as string) || 'free'

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
              <p className="text-sm text-dynasty-ink">{user?.username || 'Not set'}</p>
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
          ) : (
            <a
              href="https://billing.stripe.com/p/login/test"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body text-sm font-medium text-dynasty-ink border border-dynasty-border px-5 py-3 rounded-sm hover:border-dynasty-amber/30 transition-colors"
            >
              Manage Billing →
            </a>
          )}
        </div>

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
