import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export interface ModelResponse {
  model: string
  text: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costCents: number
  status: 'success' | 'error'
  error?: string
}

// Cost per million tokens in cents (2026 pricing)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4': { input: 300, output: 1500 },
  'gpt-4o': { input: 250, output: 1000 },
  'grok-3': { input: 300, output: 1500 },
}

function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model] || { input: 300, output: 1500 }
  return Math.ceil((inputTokens * p.input + outputTokens * p.output) / 1_000_000)
}

const SYSTEM_PROMPT = `You are an editorial assistant for Discreet Dynasties, a platform about building quiet generational wealth through the FATE model (Food, Assurance, Tools & Skills, Energy), guided pathways, and legacy stewardship. The voice is: measured, resolute, practical, discreet. No spectacle, no hype — just substance.`

export async function callClaude(prompt: string, system?: string): Promise<ModelResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) return { model: 'claude-sonnet-4', text: '', inputTokens: 0, outputTokens: 0, totalTokens: 0, costCents: 0, status: 'error', error: 'ANTHROPIC_API_KEY not set' }

  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: system || SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('')
  const inputTokens = message.usage.input_tokens
  const outputTokens = message.usage.output_tokens

  return {
    model: 'claude-sonnet-4',
    text,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costCents: computeCost('claude-sonnet-4', inputTokens, outputTokens),
    status: 'success',
  }
}

export async function callGPT4o(prompt: string, system?: string): Promise<ModelResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return { model: 'gpt-4o', text: '', inputTokens: 0, outputTokens: 0, totalTokens: 0, costCents: 0, status: 'error', error: 'OPENAI_API_KEY not set' }

  const client = new OpenAI({ apiKey })
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: system || SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  })

  const text = response.choices[0]?.message?.content || ''
  const inputTokens = response.usage?.prompt_tokens || 0
  const outputTokens = response.usage?.completion_tokens || 0

  return {
    model: 'gpt-4o',
    text,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costCents: computeCost('gpt-4o', inputTokens, outputTokens),
    status: 'success',
  }
}

export async function callGrok(prompt: string, system?: string): Promise<ModelResponse> {
  const apiKey = process.env.XAI_API_KEY?.trim()
  if (!apiKey) return { model: 'grok-3', text: '', inputTokens: 0, outputTokens: 0, totalTokens: 0, costCents: 0, status: 'error', error: 'XAI_API_KEY not set' }

  const client = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' })
  const response = await client.chat.completions.create({
    model: 'grok-3',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: system || SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  })

  const text = response.choices[0]?.message?.content || ''
  const inputTokens = response.usage?.prompt_tokens || 0
  const outputTokens = response.usage?.completion_tokens || 0

  return {
    model: 'grok-3',
    text,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costCents: computeCost('grok-3', inputTokens, outputTokens),
    status: 'success',
  }
}

export type ModelId = 'claude' | 'gpt4o' | 'grok'

export async function callModel(model: ModelId, prompt: string, system?: string): Promise<ModelResponse> {
  try {
    switch (model) {
      case 'claude': return await callClaude(prompt, system)
      case 'gpt4o': return await callGPT4o(prompt, system)
      case 'grok': return await callGrok(prompt, system)
    }
  } catch (err) {
    const name = model === 'claude' ? 'claude-sonnet-4' : model === 'gpt4o' ? 'gpt-4o' : 'grok-3'
    return {
      model: name,
      text: '',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costCents: 0,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export { SYSTEM_PROMPT }
