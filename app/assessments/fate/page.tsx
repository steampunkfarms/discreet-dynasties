'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FATE_QUESTIONS, scoreFateAudit, getFateLevelLabel, getWeakestDomain, type FateDomain } from '@/lib/dd/fate'

const DOMAIN_LABELS: Record<FateDomain, string> = {
  food: 'Food',
  assurance: 'Assurance',
  tools: 'Tools & Skills',
  energy: 'Energy',
}

export default function FateAuditPage() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const allQuestions = FATE_QUESTIONS
  const answeredCount = Object.keys(answers).length

  function handleAnswer(id: string, value: boolean) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  async function handleSubmit() {
    setSaving(true)
    const scores = scoreFateAudit(answers)
    try {
      await fetch('/api/fate-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, scores }),
      })
    } catch { /* silent */ }
    setSaving(false)
    setSubmitted(true)
  }

  if (submitted) {
    const scores = scoreFateAudit(answers)
    const weakest = getWeakestDomain(scores)
    const domains: FateDomain[] = ['food', 'assurance', 'tools', 'energy']

    return (
      <div className="page-enter max-w-content mx-auto px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">FATE Audit Results</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-8">Your Household Score</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {domains.map(domain => (
            <div key={domain} className="p-5 bg-dynasty-surface border border-dynasty-border rounded-sm text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-2">{DOMAIN_LABELS[domain]}</p>
              <p className="font-display text-display-sm font-light text-dynasty-ink">{scores[domain]}</p>
              <p className="text-xs text-dynasty-ink-muted mt-1">{getFateLevelLabel(scores[domain])}</p>
              {domain === weakest && (
                <p className="font-mono text-xs text-dynasty-amber mt-2">Weakest Rung</p>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-dynasty-surface border border-dynasty-border rounded-sm mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">Your Next Step</p>
          <p className="font-display text-lg text-dynasty-ink mb-2">
            Focus on <strong>{DOMAIN_LABELS[weakest]}</strong> first.
          </p>
          <p className="text-sm text-dynasty-ink-muted leading-relaxed">
            This is your weakest domain. Every system in your household is only as strong as its weakest rung. Build here before building higher elsewhere.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/companion"
            className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors text-center"
          >
            Discuss with the Companion
          </Link>
          <Link
            href="/pathways"
            className="inline-block font-body text-sm font-medium text-dynasty-ink border border-dynasty-border px-6 py-3 rounded-sm hover:border-dynasty-amber/30 transition-colors text-center"
          >
            Start a Pathway
          </Link>
          <button
            onClick={() => { setAnswers({}); setSubmitted(false) }}
            className="font-body text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors"
          >
            Retake Audit
          </button>
        </div>
      </div>
    )
  }

  const domains: FateDomain[] = ['food', 'assurance', 'tools', 'energy']

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">The FATE Audit</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-4">
          Know Where You Stand
        </h1>
        <p className="text-sm text-dynasty-ink-muted max-w-xl leading-relaxed">
          Answer honestly. This is not a quiz — it is a mirror. Score yourself across four domains at three levels: Stability, Continuity, and Integrity.
        </p>
        <p className="text-sm text-dynasty-ink-muted mt-2">{answeredCount} of {allQuestions.length} answered</p>
      </div>

      <div className="space-y-12">
        {domains.map(domain => {
          const domainQuestions = FATE_QUESTIONS.filter(q => q.domain === domain)
          const levels = [1, 2, 3] as const
          const levelLabels = { 1: 'Stability (30 days)', 2: 'Continuity (90 days)', 3: 'Integrity (Full Independence)' }

          return (
            <div key={domain}>
              <h2 className="font-display text-display-sm font-semibold text-dynasty-ink mb-6 pb-4 border-b border-dynasty-border">
                {DOMAIN_LABELS[domain]}
              </h2>
              {levels.map(level => {
                const levelQuestions = domainQuestions.filter(q => q.level === level)
                return (
                  <div key={level} className="mb-8">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-4">{levelLabels[level]}</h3>
                    <div className="space-y-4">
                      {levelQuestions.map(q => (
                        <div key={q.id} className="p-4 bg-dynasty-surface border border-dynasty-border rounded-sm">
                          <p className="text-sm text-dynasty-ink leading-relaxed mb-3">{q.text}</p>
                          {q.helpText && (
                            <p className="text-xs text-dynasty-ink-muted mb-3 italic">{q.helpText}</p>
                          )}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAnswer(q.id, true)}
                              className={`px-4 py-2 text-xs font-mono rounded-sm border transition-colors ${
                                answers[q.id] === true
                                  ? 'bg-dynasty-amber text-dynasty-bg border-dynasty-amber'
                                  : 'border-dynasty-border text-dynasty-ink-muted hover:border-dynasty-amber/30'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleAnswer(q.id, false)}
                              className={`px-4 py-2 text-xs font-mono rounded-sm border transition-colors ${
                                answers[q.id] === false
                                  ? 'bg-dynasty-border-strong text-dynasty-ink border-dynasty-border-strong'
                                  : 'border-dynasty-border text-dynasty-ink-muted hover:border-dynasty-border-strong/50'
                              }`}
                            >
                              Not yet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="mt-12 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={saving || answeredCount === 0}
          className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-8 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'See My Results'}
        </button>
      </div>
    </div>
  )
}
