'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const searchParams = useSearchParams()
  const verify = searchParams.get('verify')
  const authError = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  if (verify) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">
            Check Your Email
          </p>
          <h1 className="font-display text-display-md font-light text-dynasty-ink mb-4">
            Magic link sent
          </h1>
          <p className="text-sm text-dynasty-ink-muted leading-relaxed">
            Click the link in your email to sign in. You can close this tab.
          </p>
        </div>
      </div>
    )
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    })
    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else if (res?.ok) {
      window.location.href = callbackUrl
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await signIn('resend-admin', { email, callbackUrl })
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4 text-center">
          Admin
        </p>
        <h1 className="font-display text-display-md font-light text-dynasty-ink mb-8 text-center">
          Sign In
        </h1>

        {(error || authError) && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
            {error || 'Authentication failed'}
          </p>
        )}

        {mode === 'password' ? (
          <form onSubmit={handlePassword} className="space-y-3 mb-6">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 text-sm bg-dynasty-surface border border-dynasty-border rounded-sm text-dynasty-ink placeholder:text-dynasty-ink-muted focus:outline-none focus:border-dynasty-amber"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="password"
              className="w-full px-4 py-2.5 text-sm bg-dynasty-surface border border-dynasty-border rounded-sm text-dynasty-ink placeholder:text-dynasty-ink-muted focus:outline-none focus:border-dynasty-amber"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm font-medium text-dynasty-bg bg-dynasty-amber rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-40"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3 mb-6">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 text-sm bg-dynasty-surface border border-dynasty-border rounded-sm text-dynasty-ink placeholder:text-dynasty-ink-muted focus:outline-none focus:border-dynasty-amber"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm font-medium text-dynasty-bg bg-dynasty-amber rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-40"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setError('') }}
          className="w-full text-center text-xs text-dynasty-ink-muted hover:text-dynasty-amber transition-colors"
        >
          {mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
