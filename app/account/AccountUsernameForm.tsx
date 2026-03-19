'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountUsernameForm({ current }: { current: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/account/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: value.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save')
      } else {
        setEditing(false)
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-dynasty-ink">{current || 'Not set'}</p>
        <button
          onClick={() => setEditing(true)}
          className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          maxLength={30}
          placeholder="your_name"
          className="font-body text-sm text-dynasty-ink bg-dynasty-surface border border-dynasty-border rounded-sm px-3 py-1.5 focus:outline-none focus:border-dynasty-amber/50 w-48"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-mono text-xs text-dynasty-bg bg-dynasty-amber px-3 py-1.5 rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setValue(current || ''); setError('') }}
          className="font-mono text-xs text-dynasty-ink-muted hover:text-dynasty-ink transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
