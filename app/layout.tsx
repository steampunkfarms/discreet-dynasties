import type { Metadata } from 'next'
import { Crimson_Pro, Outfit, IBM_Plex_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { personJsonLd, websiteJsonLd, JsonLdScript } from '@/lib/json-ld'
import './globals.css'

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson-pro',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://discreet.tronboll.us'),
  title: {
    default: 'Discreet Dynasties — Build What Lasts',
    template: '%s — Discreet Dynasties',
  },
  description: 'Discreet Dynasties — Build quiet generational wealth through the FATE model, guided pathways, and legacy stewardship.',
  keywords: ['family dynasty building', 'FATE audit', 'generational wealth', 'household stewardship', 'discreet dynasties', 'living preps', 'long table'],
  authors: [{ name: 'F. Tronboll III', url: 'https://ft3.tronboll.us/about' }],
  alternates: { canonical: 'https://discreet.tronboll.us' },
  openGraph: {
    title: 'Discreet Dynasties',
    description: 'Build What Lasts. Leave What Matters.',
    type: 'website',
    url: 'https://discreet.tronboll.us',
    siteName: 'Discreet Dynasties',
    images: [{ url: 'https://discreet.tronboll.us/og-image.png', width: 1200, height: 630, alt: 'Discreet Dynasties — Build What Lasts' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@FTronboll3',
    creator: '@FTronboll3',
    images: ['https://discreet.tronboll.us/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${crimsonPro.variable} ${outfit.variable} ${ibmPlexMono.variable}`}>
      <head>
        <JsonLdScript data={personJsonLd()} />
        <JsonLdScript data={websiteJsonLd('https://discreet.tronboll.us', 'Discreet Dynasties', 'Build quiet generational wealth through the FATE model, guided pathways, and legacy stewardship.')} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <Navigation />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
