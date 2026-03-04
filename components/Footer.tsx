import Link from 'next/link'
import { DD_BOOK_URL, SP_URL, FT3_URL } from '@/lib/config'

export default function Footer() {
  return (
    <footer className="border-t border-dynasty-border mt-24">
      <div className="max-w-wide mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="font-body text-sm font-semibold text-dynasty-ink mb-3">Discreet Dynasties</p>
            <p className="text-sm text-dynasty-ink-muted leading-relaxed">
              Build what lasts. Leave what matters.
            </p>
          </div>
          <div>
            <h3 className="font-body text-xs font-semibold text-dynasty-ink-muted uppercase tracking-widest mb-3">The Forge</h3>
            <div className="space-y-2">
              <Link href="/book" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">The Living Book</Link>
              <Link href="/assessments/fate" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">FATE Audit</Link>
              <Link href="/pathways" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">Pathways</Link>
              <Link href="/armory" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">Armory</Link>
            </div>
          </div>
          <div>
            <h3 className="font-body text-xs font-semibold text-dynasty-ink-muted uppercase tracking-widest mb-3">Community</h3>
            <div className="space-y-2">
              <Link href="/hall" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">The Hall</Link>
              <Link href="/companion" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">Dynasty Companion</Link>
              <Link href="/long-table" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">The Long Table</Link>
              <Link href="/the-vow" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">The Vow</Link>
            </div>
          </div>
          <div>
            <h3 className="font-body text-xs font-semibold text-dynasty-ink-muted uppercase tracking-widest mb-3">More</h3>
            <div className="space-y-2">
              <a href={DD_BOOK_URL} target="_blank" rel="noopener noreferrer" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">Get the Book</a>
              <a href={SP_URL} target="_blank" rel="noopener noreferrer" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">Stoic Preparedness</a>
              <a href={FT3_URL} target="_blank" rel="noopener noreferrer" className="block text-sm text-dynasty-ink-muted hover:text-dynasty-amber transition-colors">F. Tronboll III</a>
            </div>
          </div>
        </div>
        <div className="border-t border-dynasty-border pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-dynasty-ink-muted">
            &copy; {new Date().getFullYear()} F. Tronboll III. All rights reserved.
          </p>
          <p className="font-mono text-xs text-dynasty-ink-muted">
            Build quietly. Build to last.
          </p>
        </div>
      </div>
    </footer>
  )
}
