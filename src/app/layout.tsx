import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'
import { SITE_URL } from '@/lib/catalogue'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'DEALER - Marketplace de Lubumbashi', template: '%s | DEALER' },
  description: 'Achetez et vendez facilement à Lubumbashi. Vêtements, chaussures, téléphones et plus encore sur DEALER.',
  openGraph: {
    title: 'DEALER - Marketplace de Lubumbashi',
    description: 'Achetez et vendez facilement à Lubumbashi.',
    images: ['https://images.unsplash.com/photo-1568720575666-84231057a1e2?auto=format&fit=crop&q=70&w=1200&h=630'],
    url: SITE_URL,
    siteName: 'DEALER',
    locale: 'fr_CD',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'DEALER Marketplace',
          description: 'Marketplace de Lubumbashi',
          url: SITE_URL,
          address: { '@type': 'PostalAddress', addressLocality: 'Lubumbashi', addressCountry: 'CD' },
        })}} />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
