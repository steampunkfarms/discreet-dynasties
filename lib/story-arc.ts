import { prisma } from './db'
import { callModel } from './ai-models'

export interface StoryArc {
  parentSlug: string
  parentTitle: string
  parentExcerpt: string
  children: { slug: string; title: string; excerpt: string; threadOrder: number }[]
  totalParts: number
  themes: string[]
  arcSummary: string
}

export async function detectActiveArcs(): Promise<StoryArc[]> {
  return []
}

export async function generateArcSocialCopy(
  arc: StoryArc
): Promise<{ facebook: string; instagram: string; x: string }> {
  const useGrokForX = process.env.GROK_WIT_REFINEMENT?.trim() === 'true' && process.env.XAI_API_KEY?.trim()

  const prompt = `Generate social media copy for a multi-part content series by Discreet Dynasties.

Series: "${arc.parentTitle}" (${arc.totalParts} parts)
Themes: ${arc.themes.join(', ')}
Arc summary: ${arc.arcSummary}
Link: https://discreet.tronboll.us/dispatches/${arc.parentSlug}

Generate platform-native copy:
- Facebook: 2-3 reflective paragraphs. Do NOT include any links or URLs. Do NOT add any author attribution line.
- Instagram: Shorter, contemplative. 3-5 relevant hashtags. Include the link.
- X/Twitter: 500-2000 chars. Premium+ account — use the space. Include link.

Return JSON only (no markdown fences):
{ "facebook": "...", "instagram": "...", "x": "..." }`

  const result = await callModel('claude', prompt)
  if (result.status !== 'success') {
    throw new Error(`Failed to generate arc copy: ${result.error}`)
  }

  const copy = JSON.parse(result.text)

  if (useGrokForX && copy.x) {
    try {
      const grokResult = await callModel('grok', `Take this tweet draft and make it wittier while keeping the stewardship edge. Return only the revised tweet, under 280 chars:\n\n"${copy.x}"`)
      if (grokResult.status === 'success' && grokResult.text.length <= 280) {
        copy.x = grokResult.text.replace(/^["']|["']$/g, '').trim()
      }
    } catch { /* keep original */ }
  }

  return copy
}
