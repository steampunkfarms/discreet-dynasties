'use client'

import { useState } from 'react'

export default function AccountBillingButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-block font-body text-sm font-medium text-dynasty-ink border border-dynasty-border px-5 py-3 rounded-sm hover:border-dynasty-amber/30 transition-colors disabled:opacity-50"
    >
      {loading ? 'Opening billing…' : 'Manage Billing →'}
    </button>
  )
}
