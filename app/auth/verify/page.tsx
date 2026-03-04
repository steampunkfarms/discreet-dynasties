export const metadata = { title: 'Check Your Email' }

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-6">The Dynasty Forge</p>
        <h1 className="font-display text-display-md font-light text-dynasty-ink mb-4">Check Your Email</h1>
        <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6">
          A sign-in link has been sent to your email address. Click the link to enter the Forge.
        </p>
        <p className="text-xs text-dynasty-ink-muted">
          The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    </div>
  )
}
