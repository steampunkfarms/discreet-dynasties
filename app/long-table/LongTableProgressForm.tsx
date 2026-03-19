'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LongTableProgressForm({ currentLevel, maxLevel }: { currentLevel: number; maxLevel: number }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  if (currentLevel >= maxLevel) {
    return (
      <p className="font-mono text-xs text-dynasty-amber">Level {maxLevel} — Regional Foundation reached.</p>
    )
  }

  async function advance() {
    setSaving(true)
    await fetch('/api/long-table/advance', { method: 'POST' })
    router.refresh()
    setSaving(false)
  }

  return (
    <button
      onClick={advance}
      disabled={saving}
      className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors disabled:opacity-50"
    >
      {saving ? 'Saving…' : `Mark Level ${currentLevel} complete → Advance to Level ${currentLevel + 1}`}
    </button>
  )
}
