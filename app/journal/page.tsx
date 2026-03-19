import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { formatDistanceToNow, format } from 'date-fns'

export const metadata = { title: 'Dynasty Journal' }

export default async function JournalPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isPaid) redirect('/join')

  const entries = await prisma.dDHallPost.findMany({
    where: { authorId: session.user.id, isJournal: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, content: true, category: true, createdAt: true },
  })

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">Private</p>
          <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-2">Dynasty Journal</h1>
          <p className="text-sm text-dynasty-ink-muted">Your private record. Only visible to you.</p>
        </div>
        <Link
          href="/hall/create?journal=1"
          className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-5 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
        >
          New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="py-20 text-center border border-dynasty-border rounded-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-3">No entries yet</p>
          <p className="text-sm text-dynasty-ink-muted mb-6 max-w-sm mx-auto">
            The journal is for private notes — progress, observations, questions you&apos;re working through.
          </p>
          <Link
            href="/hall/create?journal=1"
            className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors"
          >
            Write your first entry →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="border border-dynasty-border rounded-sm p-5 hover:border-dynasty-amber/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-dynasty-amber uppercase">{entry.category}</span>
                <span className="font-mono text-xs text-dynasty-ink-muted">
                  {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                </span>
                <span className="font-mono text-xs text-dynasty-ink-muted/50">
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-dynasty-ink leading-relaxed line-clamp-4 whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
