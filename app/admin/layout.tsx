import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin' }

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/gifts', label: 'Gift Access' },
  { href: '/admin/blasts', label: 'Email Blasts' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Authenticated but not admin: block
  if (session?.user && session.user.role !== 'admin') {
    redirect('/')
  }

  // Unauthenticated: let the login page render bare (middleware ensures
  // only /admin/login is reachable here without a session)
  if (!session?.user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
          <span className="font-mono text-xs text-[var(--color-ink-muted)] uppercase tracking-widest">Admin</span>
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
          <div className="ml-auto">
            <Link href="/" className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">← Site</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
