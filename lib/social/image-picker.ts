import { prisma } from '@/lib/db'

const THEME_KEYWORDS: Record<string, string[]> = {
  'dynasty': [
    'dynasty', 'legacy', 'generational', 'stewardship', 'heritage',
    'wealth', 'family', 'inheritance', 'trust', 'estate',
    'patriarch', 'matriarch', 'endowment', 'succession',
  ],
  'fate': [
    'fate', 'food', 'assurance', 'tools', 'energy',
    'preparedness', 'household', 'audit', 'stability',
    'provisions', 'resilience', 'self-reliance',
  ],
}

function matchTag(content: string): string | null {
  const lower = content.toLowerCase()
  let bestTag: string | null = null
  let bestCount = 0

  for (const [tag, keywords] of Object.entries(THEME_KEYWORDS)) {
    const hits = keywords.filter(k => lower.includes(k)).length
    if (hits > bestCount) {
      bestCount = hits
      bestTag = tag
    }
  }

  return bestCount >= 2 ? bestTag : null
}

export async function pickImage(postContent: string, site: string): Promise<string | null> {
  const matchedTag = matchTag(postContent)

  if (matchedTag) {
    const tagged = await prisma.imagePool.findFirst({
      where: {
        OR: [{ site }, { site: 'shared' }],
        tags: { has: matchedTag },
      },
      orderBy: [{ lastUsedAt: { sort: 'asc', nulls: 'first' } }, { usedCount: 'asc' }],
    })

    if (tagged) {
      await prisma.imagePool.update({
        where: { id: tagged.id },
        data: { usedCount: { increment: 1 }, lastUsedAt: new Date() },
      })
      return tagged.blobUrl
    }
  }

  const fallback = await prisma.imagePool.findFirst({
    where: {
      OR: [{ site }, { site: 'shared' }],
    },
    orderBy: [{ lastUsedAt: { sort: 'asc', nulls: 'first' } }, { usedCount: 'asc' }],
  })

  if (!fallback) return null

  await prisma.imagePool.update({
    where: { id: fallback.id },
    data: { usedCount: { increment: 1 }, lastUsedAt: new Date() },
  })

  return fallback.blobUrl
}
