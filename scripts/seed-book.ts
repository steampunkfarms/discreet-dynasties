/**
 * DD Book Seed Script
 * Reads the DD book markdown file, splits into chunks, generates embeddings,
 * and saves to DDBookContent table.
 *
 * Usage: npx tsx scripts/seed-book.ts
 *
 * IMPORTANT: Set DATABASE_URL and OPENAI_API_KEY in .env before running.
 * The book markdown file must be at one of the paths below (or update BOOK_PATH).
 */

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../.env') })

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL!.trim() })
const prisma = new PrismaClient({ adapter })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() })

// Update this to your actual book file path
const BOOK_PATHS = [
  path.join(__dirname, '../../..', 'Desktop/Stoic Project/Discreet Dynasties/dd-full-draft.md'),
  path.join(__dirname, '../book.md'),
]

const CHUNK_SIZE = 800   // words per chunk
const CHUNK_OVERLAP = 80 // words overlap

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    chunks.push(chunk)
    i += chunkSize - overlap
  }
  return chunks
}

function detectChapterSlug(text: string, lineIndex: number, fullLines: string[]): string | null {
  // Look back up to 20 lines for a chapter heading
  for (let i = lineIndex; i >= Math.max(0, lineIndex - 20); i--) {
    const line = fullLines[i].toLowerCase()
    if (line.startsWith('# chapter') || line.startsWith('## chapter')) {
      // Extract a simple slug
      return line.replace(/[#\s]+/g, ' ').trim().slice(0, 40).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
  }
  return null
}

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}

async function main() {
  let bookPath = BOOK_PATHS.find(p => fs.existsSync(p))
  if (!bookPath) {
    console.error('Book file not found. Checked:')
    BOOK_PATHS.forEach(p => console.error(' -', p))
    console.error('\nCreate a book.md file in the scripts directory or update BOOK_PATHS.')
    process.exit(1)
  }

  console.log('Reading book from:', bookPath)
  const rawText = fs.readFileSync(bookPath, 'utf-8')
  const lines = rawText.split('\n')

  // Split by chapter headings
  const chapters: { slug: string; text: string }[] = []
  let currentSlug = 'introduction'
  let currentLines: string[] = []

  for (const line of lines) {
    if (line.match(/^#{1,2}\s+chapter/i) || line.match(/^#{1,2}\s+\d+[\.:]/i)) {
      if (currentLines.length > 0) {
        chapters.push({ slug: currentSlug, text: currentLines.join('\n') })
      }
      currentSlug = line.toLowerCase()
        .replace(/^#+\s+/, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 60)
      currentLines = [line]
    } else {
      currentLines.push(line)
    }
  }
  if (currentLines.length > 0) {
    chapters.push({ slug: currentSlug, text: currentLines.join('\n') })
  }

  console.log(`Found ${chapters.length} chapters`)

  // Clear existing content
  await prisma.dDBookContent.deleteMany()
  console.log('Cleared existing DDBookContent')

  let totalChunks = 0

  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const chapter = chapters[chapterIndex]
    const chunks = chunkText(chapter.text, CHUNK_SIZE, CHUNK_OVERLAP)
    console.log(`  Processing chapter "${chapter.slug}" — ${chunks.length} chunks`)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await embed(chunk)
      const vectorLiteral = `[${embedding.join(',')}]`

      await prisma.$executeRaw`
        INSERT INTO "DDBookContent" (id, part, chapter, "chapterTitle", "chunkIndex", text, embedding, "createdAt")
        VALUES (
          gen_random_uuid(),
          ${chapterIndex + 1},
          ${chapterIndex + 1},
          ${chapter.slug},
          ${i},
          ${chunk},
          ${vectorLiteral}::vector,
          NOW()
        )
      `
      totalChunks++

      // Rate limit
      if ((i + 1) % 10 === 0) {
        await new Promise(r => setTimeout(r, 500))
      }
    }
  }

  console.log(`\nSeeded ${totalChunks} chunks across ${chapters.length} chapters.`)
  await prisma.$disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
