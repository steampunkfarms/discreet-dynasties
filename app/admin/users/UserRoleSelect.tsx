'use client'

import { useState } from 'react'

export default function UserRoleSelect({
  userId,
  currentRole,
  roles,
}: {
  userId: string
  currentRole: string
  roles: string[]
}) {
  const [role, setRole] = useState(currentRole)
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value
    setSaving(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setRole(newRole)
    setSaving(false)
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={saving}
      className="text-xs font-mono px-2 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-amber)] disabled:opacity-50"
    >
      {roles.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  )
}
