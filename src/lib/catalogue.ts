// Catégories, villes, états et photos du site.
// Les photos d'illustration viennent d'Unsplash (licence libre, usage commercial autorisé).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dealer-0-1.vercel.app').replace(/\/$/, '')

// Image Unsplash recadrée et compressée à la largeur demandée
export function photo(id: string, largeur = 800, hauteur?: number) {
  const h = hauteur ? '&h=' + hauteur : ''
  return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&q=70&w=' + largeur + h
}

export type Categorie = { slug: string; label: string; icon: string; photo: string }

export const CATEGORIES: Categorie[] = [
  { slug: 'chaussures', label: 'Chaussures', icon: '👟', photo: 'photo-1552346154-21d32810aba3' },
  { slug: 'vetements', label: 'Vêtements', icon: '👕', photo: 'photo-1489987707025-afc232f7ea0f' },
  { slug: 'telephones', label: 'Téléphones', icon: '📱', photo: 'photo-1523206489230-c012c64b2b48' },
  { slug: 'beaute', label: 'Beauté', icon: '💄', photo: 'photo-1522335789203-aabd1fc54bc9' },
  { slug: 'electronique', label: 'Électronique', icon: '💻', photo: 'photo-1496181133206-80ce9b88a853' },
  { slug: 'automobile', label: 'Automobile', icon: '🚗', photo: 'photo-1547245324-d777c6f05e80' },
  { slug: 'maison', label: 'Maison', icon: '🏠', photo: 'photo-1550581190-9c1c48d21d6c' },
  { slug: 'sport', label: 'Sport', icon: '⚽', photo: 'photo-1579952363873-27f3bade9f55' },
  { slug: 'autre', label: 'Autre', icon: '📦', photo: 'photo-1483985988355-763728e1935b' },
]

export function categorie(slug: string | null | undefined): Categorie | undefined {
  return CATEGORIES.find(c => c.slug === (slug || '').toLowerCase())
}

export const VILLES = ['Lubumbashi', 'Kinshasa', 'Kolwezi', 'Likasi', 'Goma', 'Bukavu']

export const ETATS = ['Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état', 'Bon état', 'État correct']

// Photo réelle de Lubumbashi (jonathan BUHENDWA, Unsplash)
export const PHOTO_ACCUEIL = { id: 'photo-1568720575666-84231057a1e2', credit: 'Lubumbashi · Photo jonathan BUHENDWA / Unsplash' }

export const PHOTOS_ETAPES = {
  photographier: 'photo-1581442616850-7bcff1d80af7',
  publier: 'photo-1573496782432-8690d8148c46',
  vendre: 'photo-1777065851469-71aef898a26f',
}

// Numéro au format international pour WhatsApp (RDC : +243)
export function numeroWhatsApp(tel: string | null | undefined): string | null {
  let n = (tel || '').replace(/[^\d+]/g, '')
  if (!n) return null
  if (n.startsWith('+')) n = n.slice(1)
  else if (n.startsWith('00')) n = n.slice(2)
  else if (n.startsWith('0')) n = '243' + n.slice(1)
  else if (n.length === 9) n = '243' + n
  return n.length >= 10 && n.length <= 15 ? n : null
}

export function prixAffiche(prix: number | string | null | undefined) {
  const n = Number(prix)
  if (!isFinite(n)) return ''
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' $'
}

export function datePublication(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z')
  const minutes = Math.round((Date.now() - d.getTime()) / 60000)
  if (minutes < 60) return 'il y a ' + Math.max(1, minutes) + ' min'
  const heures = Math.round(minutes / 60)
  if (heures < 24) return 'il y a ' + heures + ' h'
  const jours = Math.round(heures / 24)
  if (jours < 7) return 'il y a ' + jours + ' jour' + (jours > 1 ? 's' : '')
  return 'le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}
