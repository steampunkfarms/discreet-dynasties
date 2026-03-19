'use client'

import { useState } from 'react'

const SEGMENTS = [
  { value: 'all', label: 'All Users' },
  { value: 'free', label: 'Free Users Only' },
  { value: 'paid', label: 'Paid Members Only' },
  { value: 'dd', label: 'DD Members (any tier)' },
  { value: 'highlights', label: 'Email Highlights Opted-In' },
]

export default function EmailBlastForm({
  userCounts,
}: {
  userCounts: Array<{ role: string; _count: { _all: number } }>
}) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [segment, setSegment] = useState('all')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<{ count: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required.')
      return
    }
    if (!confirm(`Send this blast to segment "${segment}"? This cannot be undone.`)) return

    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/blast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, segment }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to send.')
      setLoading(false)
      return
    }

    setSent(data)
    setSubject('')
    setBody('')
    setLoading(false)
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-6">
      <h2 className="font-display text-lg text-[var(--color-ink)] mb-5">Compose Blast</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Segment</label>
          <select
            value={segment}
            onChange={e => setSegment(e.target.value)}
            className="px-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-amber)]"
          >
            {SEGMENTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject line…"
            className="w-full px-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-amber)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Body (HTML)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="<p>Your message here…</p>"
            rows={8}
            className="w-full px-3 py-2 text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] rounded-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-amber)] resize-y"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-[var(--color-ink)] text-[var(--color-bg)] py-2.5 px-6 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send Blast'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {sent && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm text-sm text-green-700 dark:text-green-400">
          ✓ Blast sent to {sent.count} recipients.
        </div>
      )}
    </div>
  )
}
