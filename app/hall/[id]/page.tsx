import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import HallCommentForm from './HallCommentForm'
import HallLikeButton from './HallLikeButton'

interface Props { params: { id: string } }

export default async function HallPostPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isPaid) redirect('/join')

  const post = await prisma.dDHallPost.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { username: true, email: true } },
      comments: {
        where: { isFlagged: false, parentId: null },
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { username: true, email: true } },
          replies: {
            where: { isFlagged: false },
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: { username: true, email: true } },
            },
          },
        },
      },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })

  if (!post || post.isFlagged) notFound()

  const userLiked = post.likes.some(l => l.userId === session.user.id)
  const authorName = (u: { username: string | null; email: string | null } | null) =>
    u?.username || u?.email?.split('@')[0] || 'Anonymous'

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/hall" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
          ← The Hall
        </Link>
      </div>

      {/* Post */}
      <div className="border border-dynasty-border rounded-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-dynasty-amber uppercase">{post.category}</span>
        </div>
        <p className="text-sm text-dynasty-ink leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center gap-4 text-xs text-dynasty-ink-muted font-mono">
          <span>{authorName(post.author)}</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          <span>{post._count.comments} replies</span>
          <HallLikeButton postId={post.id} initialCount={post._count.likes} userLiked={userLiked} />
        </div>
      </div>

      {/* Comments */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-6">
          {post._count.comments} {post._count.comments === 1 ? 'Reply' : 'Replies'}
        </p>

        {post.comments.length === 0 ? (
          <p className="text-sm text-dynasty-ink-muted italic">No replies yet. Be the first.</p>
        ) : (
          <div className="space-y-6">
            {post.comments.map(comment => (
              <div key={comment.id} className="space-y-4">
                <div className="border-l-2 border-dynasty-border pl-4">
                  <p className="text-sm text-dynasty-ink leading-relaxed mb-2 whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center gap-3 text-xs text-dynasty-ink-muted font-mono">
                    <span>{authorName(comment.author)}</span>
                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-6 space-y-4">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="border-l-2 border-dynasty-border/40 pl-4">
                        <p className="text-sm text-dynasty-ink leading-relaxed mb-2 whitespace-pre-wrap">{reply.content}</p>
                        <div className="flex items-center gap-3 text-xs text-dynasty-ink-muted font-mono">
                          <span>{authorName(reply.author)}</span>
                          <span>{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      <HallCommentForm postId={post.id} />
    </div>
  )
}
