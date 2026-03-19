'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GiftRedemptionClient({ code }: { code: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleClaim() {
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/gift/${code}`, { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    // Redirect to forge after claiming
    router.push('/forge?gift=claimed')
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}
      <button
        onClick={handleClaim}
        disabled={loading}
        className="w-full bg-[var(--color-ink)] text-[var(--color-bg)] py-3 px-6 rounded-sm font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Activating…' : 'Claim Access →'}
      </button>
    </div>
  )
}
