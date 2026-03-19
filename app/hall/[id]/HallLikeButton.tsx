'use client'

import { useState } from 'react'

export default function HallLikeButton({
  postId,
  initialCount,
  userLiked,
}: {
  postId: string
  initialCount: number
  userLiked: boolean
}) {
  const [liked, setLiked] = useState(userLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    const optimisticLiked = !liked
    setLiked(optimisticLiked)
    setCount(c => optimisticLiked ? c + 1 : c - 1)

    try {
      await fetch('/api/hall/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
    } catch {
      // Revert on error
      setLiked(!optimisticLiked)
      setCount(c => optimisticLiked ? c - 1 : c + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`transition-colors ${liked ? 'text-dynasty-amber' : 'text-dynasty-ink-muted hover:text-dynasty-amber'}`}
    >
      {count} {count === 1 ? 'like' : 'likes'}
    </button>
  )
}
