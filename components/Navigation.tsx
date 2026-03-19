'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { href: '/book', label: 'The Book' },
  { href: '/forge', label: 'My Forge' },
  { href: '/assessments/fate', label: 'FATE Audit' },
  { href: '/pathways', label: 'Pathways' },
  { href: '/armory', label: 'Armory' },
  { href: '/companion', label: 'Companion' },
  { href: '/hall', label: 'The Hall' },
]

export default function Navigation() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="border-b border-dynasty-border bg-dynasty-bg sticky top-0 z-50">
      <nav className="max-w-wide mx-auto px-6 h-14 flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-lg font-semibold text-dynasty-ink hover:text-dynasty-amber transition-colors"
        >
          Discreet Dynasties
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 font-body text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span>{session.user?.email?.split('@')[0]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-dynasty-bg-elevated border border-dynasty-border rounded-sm py-1 shadow-lg">
                  <Link href="/forge" className="block px-4 py-2 text-sm text-dynasty-ink-muted hover:text-dynasty-ink hover:bg-dynasty-surface transition-colors" onClick={() => setUserMenuOpen(false)}>My Forge</Link>
                  <Link href="/account" className="block px-4 py-2 text-sm text-dynasty-ink-muted hover:text-dynasty-ink hover:bg-dynasty-surface transition-colors" onClick={() => setUserMenuOpen(false)}>Account</Link>
                  <hr className="border-dynasty-border my-1" />
                  <button
                    onClick={() => { signOut(); setUserMenuOpen(false) }}
                    className="block w-full text-left px-4 py-2 text-sm text-dynasty-ink-muted hover:text-dynasty-ink hover:bg-dynasty-surface transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-4 py-2 rounded-sm hover:bg-dynasty-amber-light transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-dynasty-ink-muted hover:text-dynasty-ink transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dynasty-border bg-dynasty-bg-elevated">
          <div className="max-w-wide mx-auto px-6 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 font-body text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-dynasty-border my-3" />
            <div className="flex items-center gap-2 py-2">
              <ThemeToggle />
              <span className="font-body text-xs text-dynasty-ink-muted">Toggle theme</span>
            </div>
            <hr className="border-dynasty-border my-3" />
            {session ? (
              <>
                <Link href="/account" className="block py-2 font-body text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors" onClick={() => setMobileOpen(false)}>Account</Link>
                <button onClick={() => { signOut(); setMobileOpen(false) }} className="block py-2 font-body text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors">Sign out</button>
              </>
            ) : (
              <Link href="/auth/signin" className="block py-2 font-body text-sm font-medium text-dynasty-amber" onClick={() => setMobileOpen(false)}>Sign in →</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
