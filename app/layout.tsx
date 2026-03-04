import type { Metadata } from 'next'
import { Crimson_Pro, Outfit, IBM_Plex_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
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
  title: {
    default: 'Discreet Dynasties — Build What Lasts',
    template: '%s — Discreet Dynasties',
  },
  description: 'A framework for building households that last generations. The FATE Model. The Long Table. The Vow. For men who build quietly and intend to leave something behind.',
  openGraph: {
    title: 'Discreet Dynasties',
    description: 'Build What Lasts. Leave What Matters.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${crimsonPro.variable} ${outfit.variable} ${ibmPlexMono.variable}`}>
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
