import { prisma } from '@/lib/db'
import UserRoleSelect from './UserRoleSelect'

const ROLES = ['free', 'dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin']

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const { filter, q } = await searchParams

  const where: Record<string, unknown> = {}
  if (filter === 'paid') where.isPaid = true
  if (filter === 'free') where.isPaid = false
  if (filter === 'dynast') where.ddVow = { isNot: null }
  if (q) where.OR = [
    { email: { contains: q, mode: 'insensitive' } },
    { name: { contains: q, mode: 'insensitive' } },
  ]

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isPaid: true,
      createdAt: true,
      ddAccessExpiresAt: true,
      ddVow: { select: { takenAt: true } },
      _count: { select: { ddConversations: true, ddFateAudits: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">Users</h1>
        <span className="text-sm text-[var(--color-ink-muted)]">{users.length} shown</span>
      </div>

      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email or name…"
          className="flex-1 max-w-sm px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-amber)]"
        />
        <div className="flex gap-2">
          {['', 'paid', 'free', 'dynast'].map(f => (
            <a
              key={f}
              href={f ? `/admin/users?filter=${f}` : '/admin/users'}
              className={`px-3 py-2 text-xs rounded-sm border transition-colors ${
                (filter ?? '') === f
                  ? 'bg-[var(--color-amber)] text-[var(--color-bg)] border-[var(--color-amber)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {f || 'All'}
            </a>
          ))}
        </div>
      </form>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Email</th>
              <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Name</th>
              <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Role</th>
              <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Gift Expires</th>
              <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Activity</th>
              <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-amber)]/5 transition-colors">
                <td className="px-5 py-3">
                  <div className="text-[var(--color-ink)]">{u.email}</div>
                  {u.ddVow && (
                    <div className="text-xs text-[var(--color-amber)] mt-0.5">⚔ Dynast</div>
                  )}
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-muted)]">{u.name ?? '—'}</td>
                <td className="px-5 py-3">
                  <UserRoleSelect userId={u.id} currentRole={u.role} roles={ROLES} />
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-ink-muted)]">
                  {u.ddAccessExpiresAt
                    ? new Date(u.ddAccessExpiresAt) < new Date()
                      ? <span className="text-red-500">Expired {new Date(u.ddAccessExpiresAt).toLocaleDateString()}</span>
                      : new Date(u.ddAccessExpiresAt).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-ink-muted)]">
                  {u._count.ddConversations}c / {u._count.ddFateAudits}a
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-ink-muted)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
