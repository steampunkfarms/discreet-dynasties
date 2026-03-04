import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="min-h-[85vh] flex flex-col justify-center max-w-content mx-auto px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-6">By F. Tronboll III</p>
        <h1 className="font-display text-display-xl md:text-[4.5rem] font-light text-dynasty-ink leading-[1.05] mb-6">
          Discreet<br />Dynasties
        </h1>
        <p className="font-display text-xl md:text-2xl text-dynasty-ink-muted font-light italic max-w-lg mb-10">
          Build What Lasts.<br />Leave What Matters.
        </p>
        <div className="space-y-4 max-w-xl mb-10">
          <p className="text-base leading-7 text-dynasty-ink-light">
            A dynasty is not built in a single generation. It is built <strong className="text-dynasty-ink">deliberately</strong> — by men who understand that what they build today will outlast them.
          </p>
          <p className="text-base leading-7 text-dynasty-ink-light">
            The FATE Model. The Long Table. The Vow. A framework for building households that <strong className="text-dynasty-ink">cannot be easily broken</strong>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/book"
            className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors text-center"
          >
            Enter the Forge
          </Link>
          <a
            href="https://a.co/d/discreet-dynasties"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-body text-sm font-medium text-dynasty-ink border border-dynasty-border px-6 py-3 rounded-sm hover:border-dynasty-amber/30 transition-colors text-center"
          >
            Get the Book
          </a>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-content mx-auto px-6 pb-20">
        <div className="p-5 bg-dynasty-surface border border-dynasty-border rounded-sm max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-2">The Mission</p>
          <p className="font-display text-lg text-dynasty-ink">
            <strong>To equip men of principle</strong>{' '}
            <span className="font-light">to build households that cannot be easily broken — households that feed, protect, and inspire for generations.</span>
          </p>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6">
        <hr className="border-dynasty-border" />
      </div>

      {/* Four Paths */}
      <section className="max-w-content mx-auto px-6 py-20 md:py-28">
        <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-10">Four Paths Into the Forge</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/book" className="group block">
            <div className="border border-dynasty-border rounded-sm p-6 h-full hover:border-dynasty-amber/30 transition-colors">
              <h3 className="font-display text-display-sm font-semibold text-dynasty-ink mb-3 group-hover:text-dynasty-amber transition-colors">
                The Living Book
              </h3>
              <p className="text-sm text-dynasty-ink-muted leading-relaxed">
                28 chapters on the doctrine of dynastic building. Read with an AI companion who knows every word.
              </p>
              <p className="mt-4 font-mono text-xs text-dynasty-amber">Read →</p>
            </div>
          </Link>
          <Link href="/assessments/fate" className="group block">
            <div className="border border-dynasty-border rounded-sm p-6 h-full hover:border-dynasty-amber/30 transition-colors">
              <h3 className="font-display text-display-sm font-semibold text-dynasty-ink mb-3 group-hover:text-dynasty-amber transition-colors">
                The FATE Audit
              </h3>
              <p className="text-sm text-dynasty-ink-muted leading-relaxed">
                Score your household across four domains: Food, Assurance, Tools & Skills, Energy. Know exactly where you stand.
              </p>
              <p className="mt-4 font-mono text-xs text-dynasty-amber">Audit →</p>
            </div>
          </Link>
          <Link href="/pathways" className="group block">
            <div className="border border-dynasty-border rounded-sm p-6 h-full hover:border-dynasty-amber/30 transition-colors">
              <h3 className="font-display text-display-sm font-semibold text-dynasty-ink mb-3 group-hover:text-dynasty-amber transition-colors">
                The Pathways
              </h3>
              <p className="text-sm text-dynasty-ink-muted leading-relaxed">
                Six guided programs. One week, one action, one reflection. From FATE Foundation to Quiet Mutual Aid.
              </p>
              <p className="mt-4 font-mono text-xs text-dynasty-amber">Begin →</p>
            </div>
          </Link>
          <Link href="/armory" className="group block">
            <div className="border border-dynasty-border rounded-sm p-6 h-full hover:border-dynasty-amber/30 transition-colors">
              <h3 className="font-display text-display-sm font-semibold text-dynasty-ink mb-3 group-hover:text-dynasty-amber transition-colors">
                The Armory
              </h3>
              <p className="text-sm text-dynasty-ink-muted leading-relaxed">
                AI-powered generators for custom stability plans, FATE improvement roadmaps, and Dynasty tools.
              </p>
              <p className="mt-4 font-mono text-xs text-dynasty-amber">Open →</p>
            </div>
          </Link>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6">
        <hr className="border-dynasty-border" />
      </div>

      {/* FATE overview */}
      <section className="max-w-content mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-5">The FATE Model</p>
            <h2 className="font-display text-display-md font-light text-dynasty-ink mb-4">
              Four Domains of Household Sovereignty
            </h2>
            <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6">
              Every dynasty runs on four foundational systems. Score each domain from Stability to Continuity to Integrity. Build the weakest rung first.
            </p>
            <Link href="/assessments/fate" className="inline-block font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
              Take the FATE Audit →
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { letter: 'F', name: 'Food', desc: 'Caloric independence and the feeding chain' },
              { letter: 'A', name: 'Assurance', desc: 'Financial, legal, medical, and security readiness' },
              { letter: 'T', name: 'Tools & Skills', desc: 'Knowledge that lives in hands, not hardware' },
              { letter: 'E', name: 'Energy', desc: 'Power, water, heat — the infrastructure of life' },
            ].map(domain => (
              <div key={domain.letter} className="flex items-start gap-4">
                <span className="font-mono text-lg font-semibold text-dynasty-amber w-6 flex-shrink-0">{domain.letter}</span>
                <div>
                  <p className="font-display text-base font-semibold text-dynasty-ink">{domain.name}</p>
                  <p className="text-sm text-dynasty-ink-muted">{domain.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6">
        <hr className="border-dynasty-border" />
      </div>

      {/* Companion teaser */}
      <section className="max-w-content mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-5">The Dynasty Companion</p>
            <h2 className="font-display text-display-md font-light text-dynasty-ink mb-4">
              A Private Advisor
            </h2>
            <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-4">
              Four archetypes. Twenty historical and biblical advisors. Ask questions, run audits, plan your pathways — always grounded in the doctrine.
            </p>
            <p className="text-sm text-dynasty-ink-muted leading-relaxed mb-6">
              Speak with The Steward, The Shepherd, The Sheepdog, or The Maker. Or convene a Council — two advisors, one conversation.
            </p>
            <Link href="/companion" className="inline-block font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
              Meet the Companion →
            </Link>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-ink-muted mb-5">What You Will Not Find</p>
            <ul className="space-y-3" role="list">
              {[
                'Prepper panic or collapse theater',
                'Gear obsession and tactical cosplay',
                'Political commentary or tribal framing',
                'Solutions designed for those without means',
                'Spectacle over substance',
              ].map((item, i) => (
                <li key={i} className="text-sm text-dynasty-ink-muted leading-relaxed pl-5 relative">
                  <span className="absolute left-0 text-dynasty-ink-muted" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6">
        <hr className="border-dynasty-border" />
      </div>

      {/* Closing */}
      <section className="max-w-content mx-auto px-6 py-20 md:py-28 pb-20">
        <div className="bg-dynasty-surface border border-dynasty-border rounded-sm p-8 md:p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-4">The Standard</p>
          <blockquote className="font-display text-lg md:text-xl text-dynasty-ink font-light italic max-w-lg mx-auto">
            A dynasty is not an inheritance. It is a practice — begun by one man, sustained by those who follow him because of what he built.
          </blockquote>
          <p className="text-sm text-dynasty-ink-light mt-6 max-w-md mx-auto leading-relaxed">
            The work does not announce itself. It simply accumulates — in skill, in surplus, in wisdom passed down and relationships deepened — until one day, the household cannot easily be broken.
          </p>
          <Link
            href="/join"
            className="inline-block mt-8 font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors"
          >
            Begin Building
          </Link>
        </div>
      </section>
    </div>
  )
}
