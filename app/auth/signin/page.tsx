import { signIn } from '@/auth'

export const metadata = { title: 'Sign In' }

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The Dynasty Forge</p>
          <h1 className="font-display text-display-md font-light text-dynasty-ink mb-2">Sign In</h1>
          <p className="text-sm text-dynasty-ink-muted">Enter your email to receive a magic link.</p>
        </div>

        <form
          action={async (formData: FormData) => {
            'use server'
            await signIn('resend', formData)
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block font-mono text-xs uppercase tracking-[0.1em] text-dynasty-ink-muted mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder-dynasty-ink-muted focus:outline-none focus:border-dynasty-amber transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Send Magic Link
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dynasty-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-dynasty-bg px-3 text-dynasty-ink-muted font-mono uppercase tracking-[0.1em]">or</span>
            </div>
          </div>
          <form
            action={async () => {
              'use server'
              await signIn('github')
            }}
            className="mt-4"
          >
            <button
              type="submit"
              className="w-full font-body text-sm font-medium text-dynasty-ink border border-dynasty-border px-6 py-3 rounded-sm hover:border-dynasty-amber/30 transition-colors"
            >
              Continue with GitHub
            </button>
          </form>
        </div>

        <p className="mt-8 text-xs text-center text-dynasty-ink-muted leading-relaxed">
          No password required. No spam. Your account is shared with Stoic Preparedness if you use the same email.
        </p>
      </div>
    </div>
  )
}
