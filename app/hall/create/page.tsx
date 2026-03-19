'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'fate', label: 'FATE Progress' },
  { value: 'pathways', label: 'Pathways' },
  { value: 'long-table', label: 'Long Table' },
  { value: 'the-vow', label: 'The Vow' },
  { value: 'gray-man', label: 'Gray Man' },
  { value: 'tools-skills', label: 'Tools & Skills' },
  { value: 'food', label: 'Food' },
  { value: 'energy', label: 'Energy' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'dynasty-wealth', label: 'Dynasty Wealth' },
  { value: 'question', label: 'Question' },
]

function HallCreateInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [isJournal, setIsJournal] = useState(searchParams.get('journal') === '1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const remaining = 2000 - content.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/hall/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), category, isJournal }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to post.')
        setSubmitting(false)
        return
      }

      const data = await res.json()
      router.push(isJournal ? '/hall' : `/hall/${data.id}`)
    } catch {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/hall" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
          ← The Hall
        </Link>
      </div>

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Hall</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-2">Post to The Hall</h1>
        <p className="text-sm text-dynasty-ink-muted">Share progress, ask a question, or note an observation for the community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-3 block">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                  category === cat.value
                    ? 'border-dynasty-amber text-dynasty-amber bg-dynasty-amber/10'
                    : 'border-dynasty-border text-dynasty-ink-muted hover:border-dynasty-amber/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-3 block">
            Post
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
            rows={8}
            placeholder="What's on your mind about the work?"
            className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder:text-dynasty-ink-muted/50 focus:outline-none focus:border-dynasty-amber/50 transition-colors resize-none font-body"
            required
          />
          <p className={`text-xs font-mono mt-1 text-right ${remaining < 100 ? 'text-dynasty-amber' : 'text-dynasty-ink-muted'}`}>
            {remaining} remaining
          </p>
        </div>

        {/* Journal option */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsJournal(v => !v)}
            className={`w-10 h-5 rounded-full transition-colors relative ${isJournal ? 'bg-dynasty-amber' : 'bg-dynasty-border'}`}
            aria-pressed={isJournal}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isJournal ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <div>
            <p className="text-sm text-dynasty-ink">Private journal entry</p>
            <p className="text-xs text-dynasty-ink-muted">Only visible to you — not posted to The Hall</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 font-mono">{error}</p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting…' : isJournal ? 'Save Journal Entry' : 'Post to The Hall'}
          </button>
          <Link href="/hall" className="font-mono text-xs text-dynasty-ink-muted hover:text-dynasty-ink transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function HallCreatePage() {
  return (
    <Suspense fallback={<div className="max-w-content mx-auto px-6 py-20"><p className="font-mono text-xs text-dynasty-ink-muted">Loading…</p></div>}>
      <HallCreateInner />
    </Suspense>
  )
}
