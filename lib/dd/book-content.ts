import fs from 'fs'
import path from 'path'

let cache: Map<number, string> | null = null

function load(): Map<number, string> {
  if (cache) return cache

  const filePath = path.join(process.cwd(), 'book.md')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n')
  const map = new Map<number, string>()

  let currentChapter: number | null = null
  let currentLines: string[] = []
  let pendingTitleSkip = false

  const flush = () => {
    if (currentChapter === null) return
    const text = currentLines.join('\n').trim()
    if (text) map.set(currentChapter, text)
  }

  for (const line of lines) {
    // "# CHAPTER N" exactly — opens a new chapter section.
    // "# CHAPTER 22 — ADDENDUM" intentionally does NOT match (no trailing junk),
    // so addendum content stays appended to the preceding chapter.
    const chapterMatch = line.match(/^#\s+CHAPTER\s+(\d+)\s*$/i)
    const isPartHeading = /^#\s+PART\s+/i.test(line)

    if (chapterMatch) {
      flush()
      currentChapter = parseInt(chapterMatch[1], 10)
      currentLines = []
      pendingTitleSkip = true
      continue
    }

    if (isPartHeading) {
      flush()
      currentChapter = null
      currentLines = []
      pendingTitleSkip = false
      continue
    }

    if (currentChapter === null) continue

    // The first "## ..." line after a chapter heading is the manuscript's
    // chapter title — the reader already sees the curated title in the page
    // header, so strip this to avoid a redundant/conflicting subtitle.
    if (pendingTitleSkip) {
      if (line.trim() === '') continue
      if (/^##\s+/.test(line)) {
        pendingTitleSkip = false
        continue
      }
      pendingTitleSkip = false
    }

    currentLines.push(line)
  }
  flush()

  cache = map
  return map
}

export function getManuscriptChapterMarkdown(chapterNumber: number): string | null {
  return load().get(chapterNumber) ?? null
}
