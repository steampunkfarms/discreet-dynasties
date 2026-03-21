import { MetadataRoute } from 'next'
import { DD_CHAPTERS } from '@/lib/dd/book'
import { DD_PATHWAYS } from '@/lib/dd/pathways'

const BASE_URL = 'https://discreet.tronboll.us'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/join`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/book`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/pathways`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/armory`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/the-vow`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/hall`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/forging-fathers`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const chapterPages: MetadataRoute.Sitemap = DD_CHAPTERS.map(chapter => ({
    url: `${BASE_URL}/book/${chapter.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const pathwayPages: MetadataRoute.Sitemap = DD_PATHWAYS.map(pathway => ({
    url: `${BASE_URL}/pathways/${pathway.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...chapterPages, ...pathwayPages]
}
