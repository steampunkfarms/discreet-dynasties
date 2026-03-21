/**
 * JSON-LD structured data generators for TFOS SEO.
 * Master utility — satellites reference this pattern.
 */

export const TFOS_AUTHOR = {
  '@type': 'Person' as const,
  name: 'F. Tronboll III',
  url: 'https://ft3.tronboll.us/about',
}

export const TFOS_SITES = [
  'https://ft3.tronboll.us',
  'https://stoic.tronboll.us',
  'https://discreet.tronboll.us',
  'https://tronboll.us',
]

// --- WebSite schema (home page) ---

export function websiteJsonLd(siteUrl: string, siteName: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description,
    author: TFOS_AUTHOR,
    publisher: TFOS_AUTHOR,
  }
}

// --- Person schema (author — every page) ---

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'F. Tronboll III',
    url: 'https://ft3.tronboll.us/about',
    sameAs: TFOS_SITES,
  }
}

// --- BlogPosting / Article schema ---

export function articleJsonLd(opts: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  wordCount?: number
  keywords?: string[]
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished,
    ...(opts.dateModified && { dateModified: opts.dateModified }),
    author: TFOS_AUTHOR,
    publisher: TFOS_AUTHOR,
    url: opts.url,
    ...(opts.wordCount && { wordCount: opts.wordCount }),
    ...(opts.keywords?.length && { keywords: opts.keywords.join(', ') }),
    ...(opts.image && { image: opts.image }),
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  }
}

// --- BreadcrumbList schema ---

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// --- Book / Chapter schema (stoic + discreet) ---

export function bookJsonLd(opts: {
  name: string
  description: string
  url: string
  author?: typeof TFOS_AUTHOR
  numberOfPages?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    author: opts.author || TFOS_AUTHOR,
    ...(opts.numberOfPages && { numberOfPages: opts.numberOfPages }),
  }
}

// --- Course schema (practice weeks, pathways) ---

export function courseJsonLd(opts: {
  name: string
  description: string
  url: string
  provider?: string
  numberOfWeeks?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: {
      '@type': 'Person',
      name: opts.provider || 'F. Tronboll III',
    },
    ...(opts.numberOfWeeks && {
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseWorkload: `P${opts.numberOfWeeks}W`,
      },
    }),
  }
}

// --- FAQPage schema ---

export function faqJsonLd(questions: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

// --- HowTo schema (audits, generators) ---

export function howToJsonLd(opts: {
  name: string
  description: string
  url: string
  steps: Array<{ name: string; text: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
}

// --- Helper to inject JSON-LD script tag ---

export function JsonLdScript({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
