import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    totalUsers,
    paidUsers,
    freeUsers,
    dynasts,
    activeGifts,
    redeemedGifts,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPaid: true } }),
    prisma.user.count({ where: { isPaid: false } }),
    prisma.dDVow.count(),
    prisma.dDGiftCode.count({ where: { redeemedAt: null } }),
    prisma.dDGiftCode.count({ where: { redeemedAt: { not: null } } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, email: true, name: true, role: true, isPaid: true, createdAt: true },
    }),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers, href: '/admin/users' },
    { label: 'Paid Members', value: paidUsers, href: '/admin/users?filter=paid' },
    { label: 'Free Users', value: freeUsers, href: '/admin/users?filter=free' },
    { label: 'Dynasts (Vow)', value: dynasts, href: '/admin/users?filter=dynast' },
    { label: 'Pending Gifts', value: activeGifts, href: '/admin/gifts' },
    { label: 'Redeemed Gifts', value: redeemedGifts, href: '/admin/gifts?filter=redeemed' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-4 hover:border-[var(--color-amber)] transition-colors"
          >
            <p className="text-2xl font-display font-semibold text-[var(--color-ink)]">{s.value}</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium text-[var(--color-ink)]">Recent Signups</h2>
          <Link href="/admin/users" className="text-xs text-[var(--color-amber)] hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left px-5 py-2 text-xs text-[var(--color-ink-muted)] font-normal">Email</th>
              <th className="text-left px-5 py-2 text-xs text-[var(--color-ink-muted)] font-normal">Name</th>
              <th className="text-left px-5 py-2 text-xs text-[var(--color-ink-muted)] font-normal">Role</th>
              <th className="text-left px-5 py-2 text-xs text-[var(--color-ink-muted)] font-normal">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map(u => (
              <tr key={u.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-amber)]/5 transition-colors">
                <td className="px-5 py-2.5 text-[var(--color-ink)]">{u.email}</td>
                <td className="px-5 py-2.5 text-[var(--color-ink-muted)]">{u.name ?? '—'}</td>
                <td className="px-5 py-2.5">
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded-sm ${
                    u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    u.isPaid ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-[var(--color-border)] text-[var(--color-ink-muted)]'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-[var(--color-ink-muted)] text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/gifts"
          className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-5 hover:border-[var(--color-amber)] transition-colors"
        >
          <h3 className="font-display text-[var(--color-ink)] mb-1">Gift Access</h3>
          <p className="text-sm text-[var(--color-ink-muted)]">Send 1-week, 1-month, 3-month, or Walking Pass access to anyone via email.</p>
        </Link>
        <Link
          href="/admin/users"
          className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-5 hover:border-[var(--color-amber)] transition-colors"
        >
          <h3 className="font-display text-[var(--color-ink)] mb-1">User Management</h3>
          <p className="text-sm text-[var(--color-ink-muted)]">View all users, change roles, suspend or manage accounts.</p>
        </Link>
        <Link
          href="/admin/blasts"
          className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-5 hover:border-[var(--color-amber)] transition-colors"
        >
          <h3 className="font-display text-[var(--color-ink)] mb-1">Email Blasts</h3>
          <p className="text-sm text-[var(--color-ink-muted)]">Send targeted email announcements to segments of your member list.</p>
        </Link>
      </div>
    </div>
  )
}
