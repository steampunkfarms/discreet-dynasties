import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/auth'
import { buildDDCompanionPrompt, type AdvisorKey } from '@/lib/ai/prompts'
import { searchDDBook } from '@/lib/ai/rag'
import { prisma } from '@/lib/db'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { messages, mode, archetype, advisorKey, advisor2Key } = body

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (!isPaid) {
    return NextResponse.json({ error: 'Builder membership required' }, { status: 403 })
  }

  // Council mode requires Steward+
  const isSteward = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  if (mode === 'council' && !isSteward) {
    return NextResponse.json({ error: 'Council mode requires Steward membership' }, { status: 403 })
  }

  // RAG: search book for last user message
  const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop()?.content || ''
  const ragContext = await searchDDBook(lastUserMessage)

  // Build system prompt
  const systemPrompt = buildDDCompanionPrompt({
    archetype: mode === 'archetype' ? archetype : undefined,
    advisorKey: (mode === 'advisor' || mode === 'council') ? advisorKey as AdvisorKey : undefined,
    advisor2Key: mode === 'council' ? advisor2Key as AdvisorKey : undefined,
    ragContext,
  })

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''

  // Save to conversation log
  try {
    await prisma.dDConversation.upsert({
      where: { id: `${session.user.id}-latest` },
      create: {
        id: `${session.user.id}-latest`,
        userId: session.user.id,
        advisor: mode === 'advisor' || mode === 'council' ? (advisorKey || 'steward') : archetype || 'steward',
      },
      update: {
        advisor: mode === 'advisor' || mode === 'council' ? (advisorKey || 'steward') : archetype || 'steward',
        updatedAt: new Date(),
      },
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ content })
}
