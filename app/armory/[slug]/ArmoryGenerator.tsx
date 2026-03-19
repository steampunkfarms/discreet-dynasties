'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Field {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'select'
  options?: string[]
  placeholder?: string
}

interface Props {
  slug: string
  title: string
  desc: string
  fields: Field[]
}

export default function ArmoryGenerator({ slug, title, desc, fields }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function setField(key: string, value: string) {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setError('')
    setOutput('')
    setDone(false)

    try {
      const res = await fetch('/api/armory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatorType: slug, inputs }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Generation failed.')
        setGenerating(false)
        return
      }

      // Stream response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No stream')

      let fullText = ''
      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        const chunk = decoder.decode(value)
        fullText += chunk
        setOutput(fullText)
      }

      setDone(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="page-enter max-w-content mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/armory" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
          ← The Armory
        </Link>
      </div>

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dynasty-amber mb-4">Armory Generator</p>
        <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-2">{title}</h1>
        <p className="text-sm text-dynasty-ink-muted">{desc}</p>
      </div>

      {!done ? (
        <form onSubmit={handleGenerate} className="space-y-6">
          {fields.map(field => (
            <div key={field.key}>
              <label className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2 block">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  rows={4}
                  placeholder={field.placeholder}
                  className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder:text-dynasty-ink-muted/50 focus:outline-none focus:border-dynasty-amber/50 transition-colors resize-none font-body"
                />
              ) : field.type === 'select' ? (
                <select
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink focus:outline-none focus:border-dynasty-amber/50 transition-colors font-body"
                >
                  <option value="">Select…</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder:text-dynasty-ink-muted/50 focus:outline-none focus:border-dynasty-amber/50 transition-colors font-body"
                />
              )}
            </div>
          ))}

          {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

          <button
            type="submit"
            disabled={generating}
            className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-6 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>

          {generating && output && (
            <div className="mt-6">
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-3">Generating…</p>
              <div className="bg-dynasty-surface border border-dynasty-border rounded-sm p-6">
                <p className="text-sm text-dynasty-ink leading-relaxed whitespace-pre-wrap font-body">{output}</p>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber">Generated</p>
            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                className="font-mono text-xs text-dynasty-ink-muted hover:text-dynasty-amber transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => { setDone(false); setOutput('') }}
                className="font-mono text-xs text-dynasty-ink-muted hover:text-dynasty-amber transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
          <div className="bg-dynasty-surface border border-dynasty-border rounded-sm p-6 mb-6">
            <p className="text-sm text-dynasty-ink leading-relaxed whitespace-pre-wrap font-body">{output}</p>
          </div>
          <Link
            href="/armory"
            className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors"
          >
            ← Back to Armory
          </Link>
        </div>
      )}
    </div>
  )
}
