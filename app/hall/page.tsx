import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'The Hall' }

export default async function HallPage() {
  const session = await auth()
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(
    (session?.user as { role?: string })?.role || ''
  )

  let posts: Array<{
    id: string
    content: string
    category: string
    createdAt: Date
    author: { username: string | null; email: string | null }
    _count: { comments: number; likes: number }
  }> = []

  if (isPaid) {
    const rawPosts = await prisma.dDHallPost.findMany({
      where: { isJournal: false, isFlagged: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: { select: { username: true, email: true } },
        _count: { select: { comments: true, likes: true } },
      },
    })
    posts = rawPosts as unknown as typeof posts
  }

  if (!isPaid) {
    return (
      <div className="page-enter max-w-content mx-auto px-6 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Hall</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">For Dynasty Builders</h1>
        <p className="text-sm text-dynasty-ink-muted mb-8 max-w-md mx-auto leading-relaxed">
          The Hall is a private community for members. Join to discuss pathways, share progress, and connect with other builders.
        </p>
        <Link href="/join" className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors">
          Join the Forge
        </Link>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-wide mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Hall</p>
          <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-2">Dynasty Builders</h1>
          <p className="text-sm text-dynasty-ink-muted">A private space for members to share progress and ask questions.</p>
        </div>
        {session && (
          <Link
            href="/hall/create"
            className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-5 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Post to The Hall
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-dynasty-ink-muted font-mono text-xs uppercase tracking-widest">The Hall is quiet.</p>
            <p className="text-sm text-dynasty-ink-muted mt-2">Be the first to post.</p>
          </div>
        ) : (
          posts.map(post => (
            <Link key={post.id} href={`/hall/${post.id}`} className="block border border-dynasty-border rounded-sm p-5 hover:border-dynasty-amber/30 transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-dynasty-amber uppercase">{post.category}</span>
              </div>
              <p className="text-sm text-dynasty-ink leading-relaxed line-clamp-3 mb-3">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-dynasty-ink-muted font-mono">
                <span>{post.author?.username || post.author?.email?.split('@')[0] || 'Anonymous'}</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <span>{post._count.comments} replies</span>
                <span>{post._count.likes} likes</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
