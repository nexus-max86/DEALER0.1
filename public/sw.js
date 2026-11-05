/* Service worker de DEALER.
 *
 * Règle de sécurité : on ne met JAMAIS en cache les pages, ni les données Supabase
 * (comptes, messages, annonces), ni l'administration. Seuls les fichiers fixes du site
 * (scripts et styles versionnés, icônes) et la page « pas de connexion » sont gardés.
 * Changer VERSION à chaque modification de ce fichier pour remplacer l'ancien cache.
 */
const VERSION = 'dealer-v1'
const CACHE = VERSION + '-fichiers'
const PAGE_HORS_LIGNE = '/hors-ligne.html'
const A_PRECHARGER = [PAGE_HORS_LIGNE, '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(A_PRECHARGER)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(cle => cle !== CACHE).map(cle => caches.delete(cle))))
      .then(() => self.clients.claim())
  )
})

function fichierFixe(url) {
  return url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')
}

self.addEventListener('fetch', event => {
  const requete = event.request
  if (requete.method !== 'GET') return
  const url = new URL(requete.url)
  // Supabase, Google Fonts, Unsplash… : le navigateur s'en occupe normalement
  if (url.origin !== self.location.origin) return

  // Pages : toujours depuis le réseau, page « pas de connexion » en secours
  if (requete.mode === 'navigate') {
    event.respondWith(fetch(requete).catch(() => caches.match(PAGE_HORS_LIGNE)))
    return
  }

  // Fichiers versionnés : depuis le cache s'ils y sont, sinon réseau puis mise en cache
  if (fichierFixe(url)) {
    event.respondWith(
      caches.match(requete).then(enCache => enCache || fetch(requete).then(reponse => {
        if (reponse.ok) {
          const copie = reponse.clone()
          caches.open(CACHE).then(cache => cache.put(requete, copie))
        }
        return reponse
      }))
    )
  }
  // Tout le reste (API, admin, images envoyées…) : pas d'interception
})
