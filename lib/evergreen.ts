import { createHash } from 'crypto'
import { prisma } from './db'
import { callModel, type ModelId } from './ai-models'
import type { PlatformContent } from './social'
import { parseAIJson } from './ai/parse-json'

// Active rotation: Claude + Grok. GPT-4o remains available as manual fallback via callModel('gpt4o').
const MODEL_ROTATION: ModelId[] = ['claude', 'grok']
const CHUNK_SIZE = 25

// --- Cursor Management ---

export async function getOrCreateCursor() {
  const existing = await prisma.evergreenCursor.findFirst()
  if (existing) return existing

  // First run: find the oldest published dispatch
  const oldest = await prisma.dispatch.findFirst({
    where: { published: true },
    orderBy: { publishedAt: 'asc' },
    select: { slug: true },
  })

  if (!oldest) return null

  return prisma.evergreenCursor.create({
    data: {
      currentPostSlug: oldest.slug,
      currentLine: 0,
      completedPosts: '[]',
      cycleNumber: 1,
      lastModelIndex: -1,
    },
  })
}

export interface ChunkResult {
  chunk: string
  postSlug: string
  postTitle: string
  startLine: number
  endLine: number
}

export async function getNextChunk(cursor: {
  id: string
  currentPostSlug: string
  currentLine: number
  completedPosts: string
  cycleNumber: number
}): Promise<ChunkResult | null> {
  // Get all published dispatches in chronological order
  const allPosts = await prisma.dispatch.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'asc' },
    select: { slug: true, title: true, content: true },
  })

  if (allPosts.length === 0) return null

  let completedPosts: string[] = []
  try { completedPosts = JSON.parse(cursor.completedPosts) } catch { /* ignore */ }

  // Find current post
  let post = allPosts.find(p => p.slug === cursor.currentPostSlug)
  let currentLine = cursor.currentLine

  // If current post not found (deleted?) or already completed, advance
  if (!post || completedPosts.includes(cursor.currentPostSlug)) {
    const next = findNextPost(allPosts.map(p => p.slug), completedPosts, cursor.currentPostSlug)
    if (!next) {
      // All posts exhausted — start new cycle
      await prisma.evergreenCursor.update({
        where: { id: cursor.id },
        data: {
          currentPostSlug: allPosts[0].slug,
          currentLine: 0,
          completedPosts: '[]',
          cycleNumber: cursor.cycleNumber + 1,
        },
      })
      post = allPosts[0]
      currentLine = 0
    } else {
      post = allPosts.find(p => p.slug === next)!
      currentLine = 0
      await prisma.evergreenCursor.update({
        where: { id: cursor.id },
        data: { currentPostSlug: next, currentLine: 0 },
      })
    }
  }

  const lines = post.content.split('\n')
  const nonEmptyRemaining = lines.slice(currentLine).filter(l => l.trim().length > 0)

  // If fewer than 5 non-empty lines remain, this post is exhausted
  if (nonEmptyRemaining.length < 5) {
    completedPosts.push(post.slug)
    const next = findNextPost(allPosts.map(p => p.slug), completedPosts, post.slug)

    if (!next) {
      // All posts exhausted — start new cycle
      await prisma.evergreenCursor.update({
        where: { id: cursor.id },
        data: {
          currentPostSlug: allPosts[0].slug,
          currentLine: 0,
          completedPosts: '[]',
          cycleNumber: cursor.cycleNumber + 1,
        },
      })
      // Return first chunk of first post in new cycle
      const firstPost = allPosts[0]
      const firstLines = firstPost.content.split('\n')
      const endLine = Math.min(CHUNK_SIZE, firstLines.length)
      return {
        chunk: firstLines.slice(0, endLine).join('\n'),
        postSlug: firstPost.slug,
        postTitle: firstPost.title,
        startLine: 0,
        endLine,
      }
    }

    const nextPost = allPosts.find(p => p.slug === next)!
    await prisma.evergreenCursor.update({
      where: { id: cursor.id },
      data: {
        currentPostSlug: next,
        currentLine: 0,
        completedPosts: JSON.stringify(completedPosts),
      },
    })
    const nextLines = nextPost.content.split('\n')
    const endLine = Math.min(CHUNK_SIZE, nextLines.length)
    return {
      chunk: nextLines.slice(0, endLine).join('\n'),
      postSlug: nextPost.slug,
      postTitle: nextPost.title,
      startLine: 0,
      endLine,
    }
  }

  // Normal case: return next chunk from current post
  const endLine = Math.min(currentLine + CHUNK_SIZE, lines.length)
  return {
    chunk: lines.slice(currentLine, endLine).join('\n'),
    postSlug: post.slug,
    postTitle: post.title,
    startLine: currentLine,
    endLine,
  }
}

function findNextPost(allSlugs: string[], completed: string[], currentSlug: string): string | null {
  const currentIndex = allSlugs.indexOf(currentSlug)
  // Look forward from current position
  for (let i = currentIndex + 1; i < allSlugs.length; i++) {
    if (!completed.includes(allSlugs[i])) return allSlugs[i]
  }
  // Wrap around
  for (let i = 0; i <= currentIndex; i++) {
    if (!completed.includes(allSlugs[i])) return allSlugs[i]
  }
  return null
}

// --- Model Rotation ---

export function getNextModel(lastModelIndex: number): { model: ModelId; newIndex: number } {
  const newIndex = (lastModelIndex + 1) % MODEL_ROTATION.length
  return { model: MODEL_ROTATION[newIndex], newIndex }
}

// --- Passage Extraction ---

export async function extractPassage(
  chunk: string,
  postTitle: string,
  startLine: number,
  endLine: number,
  model: ModelId,
): Promise<{ passage: string | null; response: import('./ai-models').ModelResponse }> {
  const prompt = `You are extracting quotable passages from dispatches by Discreet Dynasties.
Voice: measured, resolute, practical, discreet.

Dispatch: "${postTitle}"
Chunk (lines ${startLine}-${endLine}):
---
${chunk}
---

Find the single most quotable passage from this chunk — a sentence or short paragraph (1-4 sentences) that stands alone as a thought-provoking social media excerpt. It should be:
- Self-contained (makes sense without surrounding context)
- Provocative or reflective
- Representative of the voice
- Between 50-300 words

If no passage in this chunk is independently quotable (e.g., it's a transitional section, list items without context, frontmatter, or purely structural), return exactly: NO_QUOTABLE_PASSAGE

Return ONLY the passage text, nothing else. No quotes, no attribution, no commentary.`

  const result = await callModel(model, prompt)
  if (result.status !== 'success') return { passage: null, response: result }

  const text = result.text.trim()
  if (text === 'NO_QUOTABLE_PASSAGE' || text.length < 30) return { passage: null, response: result }

  return { passage: text, response: result }
}

// --- Social Copy Generation ---

export async function generateSocialCopy(
  passage: string,
  postTitle: string,
  postSlug: string,
  model: ModelId,
): Promise<{ copy: PlatformContent | null; response: import('./ai-models').ModelResponse }> {
  const prompt = `Turn this quotable passage into platform-native social media posts.
Source: Discreet Dynasties. Voice: measured, resolute, practical, discreet.

Dispatch: "${postTitle}"
Passage: "${passage}"
Link: https://discreet.tronboll.us/dispatches/${postSlug}

Generate:
- Facebook: Expand the thought into 2-3 reflective paragraphs. Do NOT include any links or URLs — Facebook throttles pages that post links. Do NOT add any author attribution line — the Page name and collaborator tag handle that.
- X/Twitter: 1000-4000 chars. Premium+ account (25k char limit) — use the space generously. Punchy hook, then expand with substance. Include the link.
- Instagram: Contemplative tone. 3-5 relevant hashtags. Include the link.

Return JSON only (no markdown fences):
{ "facebook": "...", "x": "...", "instagram": "..." }`

  const result = await callModel(model, prompt)
  if (result.status !== 'success') return { copy: null, response: result }

  const copy = parseAIJson<PlatformContent>(result.text)
  return { copy: copy ?? null, response: result }
}

// --- Deduplication ---

export function computePassageHash(passage: string): string {
  const normalized = passage.toLowerCase().replace(/\s+/g, ' ').trim()
  return createHash('sha256').update(normalized).digest('hex')
}

export async function isDuplicate(passageHash: string): Promise<boolean> {
  const existing = await prisma.evergreenQuote.findUnique({ where: { passageHash } })
  return existing !== null
}

// --- Cadence Control ---

export function shouldRunNow(): { shouldRun: boolean; reason: string } {
  const startDateStr = process.env.EVERGREEN_START_DATE?.trim()
  const currentHourUTC = new Date().getUTCHours()

  if (!startDateStr) {
    // No start date — default to once daily, only on the 8am UTC slot
    if (currentHourUTC >= 6 && currentHourUTC <= 10) {
      return { shouldRun: true, reason: 'no start date set, running on morning slot' }
    }
    return { shouldRun: false, reason: 'no start date set, skipping evening slot' }
  }

  const startDate = new Date(startDateStr)
  const daysSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)

  // Launch mode: first 14 days — run both slots
  if (daysSinceStart <= 14) {
    return { shouldRun: true, reason: `launch mode (day ${Math.ceil(daysSinceStart)} of 14)` }
  }

  // Cruise mode: only run on morning slot (8am UTC window)
  if (currentHourUTC >= 6 && currentHourUTC <= 10) {
    return { shouldRun: true, reason: 'cruise mode, morning slot' }
  }

  return { shouldRun: false, reason: 'cruise mode, skipping evening slot' }
}

// --- Cursor Advance ---

export async function advanceCursor(
  cursorId: string,
  newLine: number,
  newModelIndex: number,
) {
  await prisma.evergreenCursor.update({
    where: { id: cursorId },
    data: {
      currentLine: newLine,
      lastModelIndex: newModelIndex,
    },
  })
}
