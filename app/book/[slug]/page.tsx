import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { auth } from '@/auth'
import { getChapterBySlug, getAdjacentChapters } from '@/lib/dd/book'
import { getManuscriptChapterMarkdown } from '@/lib/dd/book-content'
import { bookJsonLd, breadcrumbJsonLd, JsonLdScript } from '@/lib/json-ld'

const BASE_URL = 'https://discreet.tronboll.us'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = getChapterBySlug(params.slug)
  if (!chapter) return { title: 'Chapter' }
  const title = `Chapter ${chapter.number}: ${chapter.title}`
  const description = `${chapter.subtitle || chapter.title} — ${chapter.title} from the Discreet Dynasties Living Book.`
  return {
    title,
    description,
    openGraph: { title, description },
  }
}

interface Props {
  params: { slug: string }
}

export default async function ChapterPage({ params }: Props) {
  const chapter = getChapterBySlug(params.slug)
  if (!chapter) notFound()

  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role || 'free'
  const isAdmin = userRole === 'admin'
  const isPaid = isAdmin || ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle'].includes(userRole)

  if (chapter.tier !== 'free' && !isPaid) {
    redirect('/join')
  }

  const fullContent = chapter.manuscriptChapter !== undefined
    ? (getManuscriptChapterMarkdown(chapter.manuscriptChapter) ?? '')
    : ''
  const { prev, next } = getAdjacentChapters(chapter.slug)

  return (
    <div className="page-enter max-w-prose mx-auto px-6 py-12">
      <JsonLdScript data={bookJsonLd({
        name: `Chapter ${chapter.number}: ${chapter.title}`,
        description: `${chapter.subtitle || chapter.title} — ${chapter.title} from the Discreet Dynasties Living Book.`,
        url: `${BASE_URL}/book/${chapter.slug}`,
      })} />
      <JsonLdScript data={breadcrumbJsonLd([
        { name: 'Home', url: BASE_URL },
        { name: 'Book', url: `${BASE_URL}/book` },
        { name: chapter.title, url: `${BASE_URL}/book/${chapter.slug}` },
      ])} />

      <div className="mb-10">
        <Link href="/book" className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors">
          ← All Chapters
        </Link>
      </div>

      <article>
        <header className="mb-10 pb-8 border-b border-dynasty-border">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-dynasty-amber mb-3">
            Chapter {String(chapter.number).padStart(2, '0')}
          </p>
          <h1 className="font-display text-display-lg font-light text-dynasty-ink mb-3">{chapter.title}</h1>
          {chapter.subtitle && (
            <p className="font-display text-xl text-dynasty-ink-muted font-light italic">{chapter.subtitle}</p>
          )}
        </header>

        <div className="prose-content reading-content">
          {fullContent ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{fullContent}</ReactMarkdown>
          ) : (
            <div className="py-20 text-center">
              <p className="text-dynasty-ink-muted font-mono text-xs uppercase tracking-widest mb-4">Chapter Coming Soon</p>
              <p className="text-sm text-dynasty-ink-muted">This chapter is being prepared. Check back shortly.</p>
            </div>
          )}
        </div>
      </article>

      {/* Navigation */}
      <nav className="mt-16 pt-8 border-t border-dynasty-border flex justify-between items-center gap-4" aria-label="Chapter navigation">
        {prev ? (
          <Link href={`/book/${prev.slug}`} className="group flex-1">
            <p className="font-mono text-xs text-dynasty-ink-muted mb-1">← Previous</p>
            <p className="font-display text-base text-dynasty-ink group-hover:text-dynasty-amber transition-colors">{prev.title}</p>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link href={`/book/${next.slug}`} className="group flex-1 text-right">
            <p className="font-mono text-xs text-dynasty-ink-muted mb-1">Next →</p>
            <p className="font-display text-base text-dynasty-ink group-hover:text-dynasty-amber transition-colors">{next.title}</p>
          </Link>
        ) : <div className="flex-1" />}
      </nav>

      {/* Companion CTA */}
      <div className="mt-12 p-6 bg-dynasty-surface border border-dynasty-border rounded-sm">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-dynasty-amber mb-2">Discuss This Chapter</p>
        <p className="text-sm text-dynasty-ink-muted mb-4">Ask the Dynasty Companion a question about {chapter.title}.</p>
        <Link
          href={`/companion?chapter=${chapter.slug}`}
          className="font-mono text-xs text-dynasty-amber hover:text-dynasty-amber-light transition-colors"
        >
          Open Companion →
        </Link>
      </div>
    </div>
  )
}
