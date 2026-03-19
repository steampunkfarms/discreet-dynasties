import { prisma } from '@/lib/db'
import EmailBlastForm from './EmailBlastForm'

export default async function AdminBlastsPage() {
  const blasts = await prisma.emailBlast.findMany({
    orderBy: { sentAt: 'desc' },
    take: 20,
  })

  const userCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: { _all: true },
  })

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-6">Email Blasts</h1>

      <EmailBlastForm userCounts={userCounts} />

      {blasts.length > 0 && (
        <div className="mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-ink)]">Sent Blasts</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Subject</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Segment</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Recipients</th>
                <th className="text-left px-5 py-2.5 text-xs text-[var(--color-ink-muted)] font-normal">Sent</th>
              </tr>
            </thead>
            <tbody>
              {blasts.map(b => (
                <tr key={b.id} className="border-b border-[var(--color-border)]/50">
                  <td className="px-5 py-3 text-[var(--color-ink)]">{b.subject}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[var(--color-ink-muted)]">{b.segment}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">{b.recipientCount}</td>
                  <td className="px-5 py-3 text-xs text-[var(--color-ink-muted)]">{new Date(b.sentAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
