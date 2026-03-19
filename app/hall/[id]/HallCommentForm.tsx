'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HallCommentForm({ postId, parentId }: { postId: string; parentId?: string }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/hall/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, parentId, content: content.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to post reply.')
        setSubmitting(false)
        return
      }

      setContent('')
      router.refresh()
    } catch {
      setError('Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-dynasty-border pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-4">Leave a Reply</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Add to the conversation…"
          className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder:text-dynasty-ink-muted/50 focus:outline-none focus:border-dynasty-amber/50 transition-colors resize-none font-body"
          required
        />
        {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-5 py-2.5 rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting…' : 'Post Reply'}
        </button>
      </form>
    </div>
  )
}
