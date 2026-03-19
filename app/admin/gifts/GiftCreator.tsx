'use client'

import { useState } from 'react'

const GIFT_TYPES = [
  { value: '1_week', label: '1 Week', description: 'Expires 7 days from first login' },
  { value: '1_month', label: '1 Month', description: 'Expires 30 days from first login' },
  { value: '3_months', label: '3 Months', description: 'Expires 90 days from first login' },
  { value: 'walking_pass', label: 'Walking Pass', description: 'Permanent free access — never expires' },
]

export default function GiftCreator() {
  const [type, setType] = useState('1_month')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ code: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    setLoading(true)
    setError(null)
    setResult(null)

    const res = await fetch('/api/admin/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipientEmail: email || undefined, note: note || undefined }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to create gift.')
      setLoading(false)
      return
    }

    setResult(data)
    setEmail('')
    setNote('')
    setLoading(false)
  }

  const redeemUrl = result ? `${window.location.origin}/gift/${result.code}` : ''

  function copyLink() {
    navigator.clipboard.writeText(redeemUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm p-6">
      <h2 className="font-display text-lg text-[var(--color-ink)] mb-5">Create a Gift</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Gift Type</label>
          <div className="space-y-2">
            {GIFT_TYPES.map(t => (
              <label key={t.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  checked={type === t.value}
                  onChange={() => setType(t.value)}
                  className="mt-0.5 accent-[var(--color-amber)]"
                />
                <div>
                  <p className="text-sm text-[var(--color-ink)] font-medium">{t.label}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{t.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
              Recipient Email <span className="normal-case text-[var(--color-ink-muted)]/60">(optional — sends email)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-amber)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
              Personal Note <span className="normal-case text-[var(--color-ink-muted)]/60">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Thought you'd find this useful…"
              rows={3}
              className="w-full px-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-amber)] resize-none"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-[var(--color-ink)] text-[var(--color-bg)] py-2.5 px-4 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating…' : email ? 'Create & Send Email' : 'Create Gift Code'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm">
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
            ✓ Gift created{email ? ' and sent' : ''}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-white/50 dark:bg-black/20 px-3 py-2 rounded-sm text-[var(--color-ink)] truncate">
              {redeemUrl}
            </code>
            <button
              onClick={copyLink}
              className="px-3 py-2 text-xs bg-[var(--color-ink)] text-[var(--color-bg)] rounded-sm hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
