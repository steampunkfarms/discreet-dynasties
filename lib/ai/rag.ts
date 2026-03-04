import { prisma } from '@/lib/db'
import OpenAI from 'openai'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

export async function embedQuery(text: string): Promise<number[]> {
  const res = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}

export async function searchDDBook(query: string, topK = 5): Promise<string> {
  try {
    const embedding = await embedQuery(query)
    const vectorLiteral = `[${embedding.join(',')}]`

    const results = await prisma.$queryRaw<Array<{ text: string; chapter: number; similarity: number }>>`
      SELECT text, chapter, 1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM "DDBookContent"
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> ${vectorLiteral}::vector) > 0.3
      ORDER BY similarity DESC
      LIMIT ${topK}
    `

    if (!results.length) return ''
    return results.map(r => `[Chapter ${r.chapter}]\n${r.text}`).join('\n\n---\n\n')
  } catch {
    return ''
  }
}
