import { prisma } from './db'
import { callModel, type ModelId, type ModelResponse } from './ai-models'
import { Resend } from 'resend'
import { marked } from 'marked'

const MODEL_ROTATION: ModelId[] = ['claude', 'gpt4o', 'grok']
const MODEL_NAMES: Record<ModelId, string> = {
  claude: 'claude-sonnet-4',
  gpt4o: 'gpt-4o',
  grok: 'grok-3',
}

// ─── Cursor Management ──────────────────────────────────────────

// DD uses its own cursor row (separate from stoic's by checking generationCount + lastContentType)
async function getOrCreateCursor() {
  // Find DD's cursor — identifiable by lastContentType containing 'hall'
  const existing = await prisma.contentGenCursor.findFirst({
    where: { lastContentType: { in: ['hall_post', 'email_dispatch_dd'] } },
  })
  if (existing) return existing

  // No DD cursor yet — create one
  return prisma.contentGenCursor.create({
    data: {
      lastModelIndex: -1,
      lastContentType: 'hall_post',
      lastDoctrineIdx: -1, // Used as chapter index for DD
      lastPracticeIdx: -1, // Unused by DD
      lastMentorIdx: -1,   // Unused by DD
      generationCount: 0,
    },
  })
}

function nextIndex(current: number, length: number): number {
  return (current + 1) % length
}

// ─── Slug Generation ────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

function generateExcerpt(content: string, maxLength = 300): string {
  const plain = content.replace(/[#*_~`>\[\]()!]/g, '').replace(/\n+/g, ' ').trim()
  if (plain.length <= maxLength) return plain
  return plain.slice(0, maxLength - 1).replace(/\s\S*$/, '') + '…'
}

// ─── Book Content Access ────────────────────────────────────────

async function getChapterList() {
  const chapters = await prisma.dDBookContent.findMany({
    distinct: ['chapter'],
    select: { part: true, chapter: true, chapterTitle: true },
    orderBy: [{ part: 'asc' }, { chapter: 'asc' }],
  })
  return chapters
}

async function getChapterContent(chapterNum: number): Promise<string> {
  const chunks = await prisma.dDBookContent.findMany({
    where: { chapter: chapterNum },
    orderBy: { chunkIndex: 'asc' },
    select: { text: true, section: true },
  })
  return chunks.map(c => c.text).join('\n\n')
}

// ─── Content Generation ─────────────────────────────────────────

const HALL_POST_SYSTEM = `You are a thoughtful editorial voice for Discreet Dynasties — a platform about building quiet, enduring generational wealth through the FATE model (Food, Assurance, Tools & Skills, Energy).

Your task: write a community discussion post for The Hall, the private forum where members reflect on dynasty-building principles.

Voice: measured, resolute, practical, discreet. No spectacle, no hype — just substance. Speak as a knowledgeable peer who has internalized these principles and wants to help others do the same.

Structure: 800-1500 words. Open with a concrete scenario or question that connects to daily life. Develop the principle from the book chapter. Close with a reflection prompt or practical exercise the reader can do this week.

Never invent doctrine the book doesn't contain. Ground every claim in the chapter material provided. Be specific — name concepts, reference the FATE pillars by name, describe real situations.`

const EMAIL_DISPATCH_SYSTEM = `You are the editorial voice of Discreet Dynasties, writing a newsletter dispatch for members.

Voice: measured, resolute, practical, discreet. Like a trusted advisor writing a personal letter — direct, substantive, no filler.

Structure: 500-1200 words. Hook (a question or scenario) → teaching (draw from the chapter) → application (what to do this week) → invitation to discuss in The Hall.

Never invent doctrine the book doesn't contain. Ground claims in chapter material. Be specific and concrete.`

export async function generateAndPublish(): Promise<{
  contentType: string
  model: string
  dispatch?: string
  hallPost?: string
  email?: string
  chapterTitle: string
}> {
  const cursor = await getOrCreateCursor()
  const chapters = await getChapterList()
  if (chapters.length === 0) throw new Error('No book chapters found in DDBookContent')

  // Alternate between hall posts and email dispatches
  const contentType = cursor.lastContentType === 'hall_post'
    ? 'email_dispatch_dd' as const
    : 'hall_post' as const

  // Rotate through chapters and models
  const chapterIdx = nextIndex(cursor.lastDoctrineIdx, chapters.length)
  const modelIdx = nextIndex(cursor.lastModelIndex, MODEL_ROTATION.length)
  const modelId = MODEL_ROTATION[modelIdx]

  const chapter = chapters[chapterIdx]
  const chapterContent = await getChapterContent(chapter.chapter)

  const systemPrompt = contentType === 'hall_post' ? HALL_POST_SYSTEM : EMAIL_DISPATCH_SYSTEM

  const userPrompt = contentType === 'hall_post'
    ? `Write a Hall discussion post drawing from this chapter of the Discreet Dynasties book.

CHAPTER: ${chapter.chapterTitle} (Part ${chapter.part}, Chapter ${chapter.chapter})

BOOK CONTENT:
${chapterContent.slice(0, 4000)}

Write the post now. Make it feel like a contribution from a fellow practitioner, not a lecture.`
    : `Write a newsletter dispatch for Discreet Dynasties members drawing from this chapter.

CHAPTER: ${chapter.chapterTitle} (Part ${chapter.part}, Chapter ${chapter.chapter})

BOOK CONTENT:
${chapterContent.slice(0, 4000)}

Write the dispatch now. Close with an invitation to continue the conversation in The Hall.`

  const response: ModelResponse = await callModel(modelId, userPrompt, systemPrompt)

  if (response.status === 'error') {
    throw new Error(`Model ${modelId} failed: ${response.error}`)
  }

  const content = response.text
  const title = contentType === 'hall_post'
    ? `On ${chapter.chapterTitle}`
    : `Discreet Dynasties — ${chapter.chapterTitle}`

  const results: {
    contentType: string
    model: string
    dispatch?: string
    hallPost?: string
    email?: string
    chapterTitle: string
  } = { contentType, model: MODEL_NAMES[modelId], chapterTitle: chapter.chapterTitle }

  // Create Dispatch record (feeds social cron + /dispatches page)
  const slug = `${slugify(title)}-${Date.now().toString(36)}`
  const excerpt = generateExcerpt(content)
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 250))

  await prisma.dispatch.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      published: true,
      publishedAt: new Date(),
      readingTime,
    },
  })
  results.dispatch = slug

  if (contentType === 'hall_post') {
    // Create DDHallPost for /hall
    const authorId = await getCompanionUserId()
    if (authorId) {
      const post = await prisma.dDHallPost.create({
        data: {
          authorId,
          content,
          category: 'general',
          isJournal: false,
          isPinned: false,
          isFlagged: false,
        },
      })
      results.hallPost = post.id
    }
  } else {
    // Send email dispatch to subscribers
    try {
      const blastId = await sendEmailDispatch(title, content)
      if (blastId) results.email = blastId
    } catch (err) {
      console.error('[dd-content-gen] Email dispatch failed:', err instanceof Error ? err.message : err)
    }
  }

  // Advance cursor
  await prisma.contentGenCursor.update({
    where: { id: cursor.id },
    data: {
      lastModelIndex: modelIdx,
      lastContentType: contentType,
      lastDoctrineIdx: chapterIdx,
      generationCount: { increment: 1 },
    },
  })

  return results
}

// ─── Companion User ─────────────────────────────────────────────

async function getCompanionUserId(): Promise<string | null> {
  // Find the admin user or a designated companion
  const admin = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  })
  return admin?.id ?? null
}

// ─── Email Dispatch ─────────────────────────────────────────────

async function sendEmailDispatch(subject: string, content: string): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null

  // Honor opt-out via emailHighlights field
  const recipients = await prisma.user.findMany({
    where: { email: { not: null }, bannedAt: null, emailHighlights: true },
    select: { id: true, email: true },
  })

  if (recipients.length === 0) return null

  const html = buildEmailHtml(content, subject)
  const resend = new Resend(apiKey)
  let sentCount = 0

  for (let i = 0; i < recipients.length; i += 50) {
    const batch = recipients.slice(i, i + 50)
    await Promise.all(
      batch.map(r =>
        resend.emails.send({
          from: 'Discreet Dynasties <discreet@tronboll.us>',
          to: r.email!,
          subject,
          html,
        }).then(() => sentCount++)
          .catch(() => {})
      )
    )
  }

  const blast = await prisma.emailBlast.create({
    data: {
      adminId: 'content-pipeline',
      subject,
      body: html,
      segment: 'all',
      recipientCount: sentCount,
    },
  })

  return blast.id
}

function buildEmailHtml(content: string, subject: string): string {
  // Render markdown → HTML, then inject inline styles for email client compatibility.
  // Email clients strip <style> blocks, so every tag must carry its styles inline.
  const rendered = marked.parse(content, { async: false, gfm: true }) as string

  const styled = rendered
    .replace(/<p>/g, '<p style="font-size: 15px; line-height: 1.7; color: #c8c4a8; margin: 0 0 16px;">')
    .replace(/<h2>/g, '<h2 style="font-size: 18px; font-weight: 600; color: #e8e4d0; margin: 24px 0 12px;">')
    .replace(/<h3>/g, '<h3 style="font-size: 16px; font-weight: 600; color: #e8e4d0; margin: 20px 0 10px;">')
    .replace(/<strong>/g, '<strong style="color: #e8e4d0;">')
    .replace(/<em>/g, '<em style="color: #d8d4b8;">')
    .replace(/<hr\s*\/?>/g, '<hr style="border: none; border-top: 1px solid #2a2a1a; margin: 24px 0;">')
    .replace(/<blockquote>/g, '<blockquote style="border-left: 3px solid #4a5a3a; padding-left: 16px; margin: 16px 0; color: #a8a488;">')
    .replace(/<ul>/g, '<ul style="padding-left: 20px; margin: 0 0 16px;">')
    .replace(/<ol>/g, '<ol style="padding-left: 20px; margin: 0 0 16px;">')
    .replace(/<li>/g, '<li style="font-size: 15px; line-height: 1.7; color: #c8c4a8; margin: 0 0 8px;">')
    .replace(/<a /g, '<a style="color: #8a9a6a; text-decoration: underline;" ')

  return `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1a1a14; color: #c8c4a8;">
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8a8a6a; margin-bottom: 24px;">Discreet Dynasties</p>
    <h1 style="font-size: 22px; font-weight: normal; color: #e8e4d0; margin-bottom: 24px;">${subject}</h1>

    ${styled}

    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #2a2a1a;">
      <a href="https://discreet.tronboll.us/hall" style="display: inline-block; background: #4a5a3a; color: #e8e4d0; padding: 10px 20px; font-size: 12px; font-family: monospace; text-decoration: none; border-radius: 2px;">Join the conversation in The Hall →</a>
    </div>

    <p style="font-size: 11px; color: #4a4a2a; margin-top: 32px; line-height: 1.6;">
      You're receiving this because you're a member of Discreet Dynasties.<br>
      <a href="https://discreet.tronboll.us/account" style="color: #6a6a4a;">Manage email preferences</a>
    </p>
  </div>`
}

// ─── Owner Notification ─────────────────────────────────────────

export async function notifyOwner(
  contentType: string,
  preview: string,
  results: { dispatch?: string; hallPost?: string; email?: string },
) {
  const ownerEmail = process.env.OWNER_EMAIL?.trim()
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!ownerEmail || !apiKey) return

  const typeLabel = contentType === 'hall_post' ? 'Hall post' : 'Email dispatch'
  const truncated = preview.length > 200 ? preview.slice(0, 197) + '…' : preview

  const details: string[] = []
  if (results.hallPost) details.push('Published to The Hall')
  if (results.email) details.push('Sent to subscribers')
  if (results.dispatch) details.push(`Dispatch: /dispatches/${results.dispatch}`)

  const html = `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1a1a14; color: #c8c4a8;">
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8a8a6a; margin-bottom: 24px;">Discreet Dynasties — Auto-Published</p>
    <h1 style="font-size: 22px; font-weight: normal; color: #e8e4d0; margin-bottom: 8px;">${typeLabel} published</h1>

    <div style="border-left: 2px solid #4a5a3a; padding-left: 16px; margin: 24px 0;">
      <p style="font-size: 13px; color: #c8c4a8; line-height: 1.6; margin: 0;">${truncated}</p>
    </div>

    <div style="margin: 16px 0; font-size: 12px; color: #8a8a6a;">
      ${details.map(d => `<p style="margin: 4px 0;">&#x2713; ${d}</p>`).join('')}
    </div>
  </div>`

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Discreet Dynasties <discreet@tronboll.us>',
      to: ownerEmail,
      subject: `Auto-published: ${typeLabel}`,
      html,
    })
  } catch {
    // Fail silently
  }
}
