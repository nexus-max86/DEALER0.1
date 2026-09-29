import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  metadataBase: new URL('https://dealer-luba.vercel.app'),
  title: { default: 'DEALER - Marketplace de Lubumbashi', template: '%s | DEALER' },
  description: 'Achetez et vendez facilement a Lubumbashi. Vetements, chaussures, telephones et plus encore sur DEALER.',
  openGraph: {
    title: 'DEALER - Marketplace de Lubumbashi',
    description: 'Achetez et vendez facilement a Lubumbashi.',
    url: 'https://dealer-luba.vercel.app',
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
          url: 'https://dealer-luba.vercel.app',
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
