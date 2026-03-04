'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { ADVISORS, ARCHETYPES, type AdvisorKey } from '@/lib/ai/prompts'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type Mode = 'archetype' | 'advisor' | 'council'

export default function CompanionPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('archetype')
  const [selectedArchetype, setSelectedArchetype] = useState<string>('steward')
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorKey>('washington')
  const [selectedAdvisor2, setSelectedAdvisor2] = useState<AdvisorKey>('franklin')
  const [showSettings, setShowSettings] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isAuthed = !!session

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading || !isAuthed) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          mode,
          archetype: selectedArchetype,
          advisorKey: selectedAdvisor,
          advisor2Key: mode === 'council' ? selectedAdvisor2 : undefined,
        }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const advisorList = Object.entries(ADVISORS) as [AdvisorKey, typeof ADVISORS[AdvisorKey]][]
  const archetypeList = Object.entries(ARCHETYPES)

  const currentName = mode === 'archetype'
    ? ARCHETYPES[selectedArchetype as keyof typeof ARCHETYPES]?.name || 'The Steward'
    : mode === 'council'
    ? `${ADVISORS[selectedAdvisor]?.name} & ${ADVISORS[selectedAdvisor2]?.name}`
    : ADVISORS[selectedAdvisor]?.name || 'George Washington'

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b border-dynasty-border px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber">Dynasty Companion</p>
          <h1 className="font-display text-lg font-light text-dynasty-ink">{currentName}</h1>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-sm text-dynasty-ink-muted hover:text-dynasty-ink transition-colors"
          aria-expanded={showSettings}
        >
          Change Advisor <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="border-b border-dynasty-border px-6 py-4 bg-dynasty-surface">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-wide">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2">Mode</p>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as Mode)}
                className="w-full bg-dynasty-bg border border-dynasty-border rounded-sm px-3 py-2 text-sm text-dynasty-ink"
              >
                <option value="archetype">Archetype</option>
                <option value="advisor">Historical Advisor</option>
                <option value="council">Council (Two Advisors)</option>
              </select>
            </div>
            {mode === 'archetype' && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2">Archetype</p>
                <select
                  value={selectedArchetype}
                  onChange={e => setSelectedArchetype(e.target.value)}
                  className="w-full bg-dynasty-bg border border-dynasty-border rounded-sm px-3 py-2 text-sm text-dynasty-ink"
                >
                  {archetypeList.map(([key, a]) => (
                    <option key={key} value={key}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}
            {(mode === 'advisor' || mode === 'council') && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2">
                  {mode === 'council' ? 'Advisor 1' : 'Advisor'}
                </p>
                <select
                  value={selectedAdvisor}
                  onChange={e => setSelectedAdvisor(e.target.value as AdvisorKey)}
                  className="w-full bg-dynasty-bg border border-dynasty-border rounded-sm px-3 py-2 text-sm text-dynasty-ink"
                >
                  {advisorList.map(([key, a]) => (
                    <option key={key} value={key}>{a.name} ({a.era})</option>
                  ))}
                </select>
              </div>
            )}
            {mode === 'council' && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-dynasty-ink-muted mb-2">Advisor 2</p>
                <select
                  value={selectedAdvisor2}
                  onChange={e => setSelectedAdvisor2(e.target.value as AdvisorKey)}
                  className="w-full bg-dynasty-bg border border-dynasty-border rounded-sm px-3 py-2 text-sm text-dynasty-ink"
                >
                  {advisorList.filter(([key]) => key !== selectedAdvisor).map(([key, a]) => (
                    <option key={key} value={key}>{a.name} ({a.era})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            onClick={() => { setMessages([]); setShowSettings(false) }}
            className="mt-3 font-mono text-xs text-dynasty-ink-muted hover:text-dynasty-amber transition-colors"
          >
            Apply & Clear Conversation
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="max-w-content mx-auto text-center py-20">
            <p className="font-display text-display-sm font-light text-dynasty-ink mb-4">
              What would you build today?
            </p>
            <p className="text-sm text-dynasty-ink-muted mb-8">
              Ask about FATE scores, pathways, the Long Table, or anything in the book.
            </p>
            {!isAuthed && (
              <div className="p-4 border border-dynasty-border rounded-sm max-w-sm mx-auto">
                <p className="text-sm text-dynasty-ink-muted mb-3">Sign in to start a conversation.</p>
                <Link
                  href="/auth/signin"
                  className="inline-block font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-4 py-2 rounded-sm hover:bg-dynasty-amber-light transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-wide mx-auto`}>
            <div className={`max-w-[75%] ${msg.role === 'user'
              ? 'bg-dynasty-amber/10 border border-dynasty-amber/20 rounded-sm px-5 py-3'
              : 'bg-dynasty-surface border border-dynasty-border rounded-sm px-5 py-4'
            }`}>
              {msg.role === 'assistant' && (
                <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-3">{currentName}</p>
              )}
              <p className="text-sm text-dynasty-ink leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start max-w-wide mx-auto">
            <div className="bg-dynasty-surface border border-dynasty-border rounded-sm px-5 py-4">
              <p className="font-mono text-xs uppercase tracking-widest text-dynasty-amber mb-2">{currentName}</p>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-dynasty-amber rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-dynasty-amber rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-dynasty-amber rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isAuthed && (
        <div className="border-t border-dynasty-border px-6 py-4">
          <form onSubmit={sendMessage} className="flex gap-3 max-w-wide mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your advisor..."
              className="flex-1 bg-dynasty-surface border border-dynasty-border rounded-sm px-4 py-3 text-sm text-dynasty-ink placeholder-dynasty-ink-muted focus:outline-none focus:border-dynasty-amber transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="font-body text-sm font-medium text-dynasty-bg bg-dynasty-amber px-5 py-3 rounded-sm hover:bg-dynasty-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
