// Redimensionne une photo dans le navigateur avant l'envoi (plus rapide sur une connexion mobile).
// carre = true : recadrage centré au format carré (photo de profil).
export async function redimensionner(file: File, max: number, carre = false): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  let sx = 0, sy = 0, sw = bitmap.width, sh = bitmap.height
  if (carre) {
    const cote = Math.min(sw, sh)
    sx = Math.round((sw - cote) / 2)
    sy = Math.round((sh - cote) / 2)
    sw = sh = cote
  }
  const ratio = Math.min(1, max / Math.max(sw, sh))
  const w = Math.round(sw * ratio)
  const h = Math.round(sh * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('conversion')
  return blob
}

// Chemin d'un fichier dans un bucket à partir de son adresse publique
export function cheminDepuisUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null
  const repere = '/storage/v1/object/public/' + bucket + '/'
  const i = url.indexOf(repere)
  return i >= 0 ? decodeURIComponent(url.slice(i + repere.length).split('?')[0]) : null
}
