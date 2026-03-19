'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TakeTheVowPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [state, setState] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleTakeVow(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmed) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/vow/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() || null, state: state.trim() || null, isPublic }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong.')
        setSubmitting(false)
        return
      }

      router.push('/the-vow?taken=1')
    } catch {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/the-vow" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
          ← The Vow
        </Link>
      </div>

      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Formal Ceremony</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-3">Take The Vow</h1>
        <p className="text-sm text-dynasty-ink-muted leading-relaxed max-w-lg">
          This is not a ceremony for show. It is a private commitment — recorded to your dynasty account with date and name. No audience required. Only the honest intention.
        </p>
      </div>

      {/* The Vow Text */}
      <div className="border border-dynasty-border rounded-sm p-8 mb-10 bg-dynasty-surface">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-6">Read This Before You Proceed</p>
        <div className="font-display text-base text-dynasty-ink font-light leading-relaxed space-y-5">
          <p>I build for those who come after me — not to leave a monument, but to leave a foundation.</p>
          <p>I will not build for spectacle or recognition. I will build quietly, faithfully, in the daily work of household sovereignty.</p>
          <p>I commit to the FATE of my household: that my household will not be easily broken by food shortage, financial crisis, loss of skills, or energy dependence.</p>
          <p>I commit to the Long Table: to extend my preparation to those in my trusted circle, and to accept responsibility for those who cannot yet prepare for themselves.</p>
          <p>I take The Vow not because I am ready. I take it because I intend to become ready — and because the intention, made formal, changes how I build.</p>
        </div>
      </div>

      <form onSubmit={handleTakeVow} className="space-y-6">
        {/* Display name */}
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2 block">
            Your name (optional)
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="How you want your name recorded"
            maxLength={80}
            className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder:text-dynasty-ink-muted/50 focus:outline-none focus:border-dynasty-amber/50 transition-colors font-body"
          />
        </div>

        {/* State */}
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2 block">
            State or region (optional)
          </label>
          <input
            type="text"
            value={state}
            onChange={e => setState(e.target.value)}
            placeholder="e.g. Tennessee, Appalachia, Pacific Northwest"
            maxLength={60}
            className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder:text-dynasty-ink-muted/50 focus:outline-none focus:border-dynasty-amber/50 transition-colors font-body"
          />
        </div>

        {/* Public */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublic(v => !v)}
            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${isPublic ? 'bg-dynasty-amber' : 'bg-dynasty-border'}`}
            aria-pressed={isPublic}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <div>
            <p className="text-sm text-dynasty-ink">List my name among those who have taken The Vow</p>
            <p className="text-xs text-dynasty-ink-muted">Only your display name and region are shown — never your email</p>
          </div>
        </div>

        {/* Confirmation */}
        <div className="border border-dynasty-amber/30 rounded-sm p-5 bg-dynasty-amber/5">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setConfirmed(v => !v)}
              className={`mt-0.5 w-5 h-5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                confirmed ? 'border-dynasty-amber bg-dynasty-amber' : 'border-dynasty-border'
              }`}
              aria-pressed={confirmed}
            >
              {confirmed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <p className="text-sm text-dynasty-ink leading-relaxed">
              I have read The Vow. I take it with honest intention. I understand this is a personal commitment — recorded privately to my account — and not a performance.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !confirmed}
          className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-8 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Recording…' : 'I Take The Vow'}
        </button>
      </form>
    </div>
  )
}
