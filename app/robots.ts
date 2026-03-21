import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/forge/', '/account/', '/the-foundry'],
    },
    sitemap: 'https://discreet.tronboll.us/sitemap.xml',
  }
}
