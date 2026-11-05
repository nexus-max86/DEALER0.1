import type { MetadataRoute } from 'next'

// Fiche d'installation de l'application (PWA) : nom, icônes, couleurs, affichage plein écran
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'DEALER · Marketplace de Lubumbashi',
    short_name: 'DEALER',
    description: 'Achète et vends près de chez toi à Lubumbashi.',
    lang: 'fr',
    dir: 'ltr',
    start_url: '/?source=application',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFFFFF',
    theme_color: '#007782',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Vendre un article', short_name: 'Vendre', url: '/sell', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Mes messages', short_name: 'Messages', url: '/messages', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Rechercher', short_name: 'Recherche', url: '/search', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
