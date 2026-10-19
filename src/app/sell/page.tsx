'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase, assurerProfil } from '@/lib/supabase'
import { CATEGORIES, ETATS, VILLES, photo, numeroWhatsApp, prixAffiche } from '@/lib/catalogue'
import Header from '@/components/Header'
import Icone from '@/components/Icone'

const MAX_PHOTOS = 5
const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp']

type Photo = { fichier: File; apercu: string }

// Redimensionne la photo (1600 px max) et la convertit en JPEG :
// l'envoi est bien plus rapide sur une connexion mobile.
async function preparerPhoto(file: File): Promise<Blob> {
  const MAX = 1600
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const ratio = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * ratio)
    const h = Math.round(bitmap.height * ratio)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82))
    if (!blob) throw new Error('conversion')
    return blob
  } catch {
    if (TYPES_ACCEPTES.includes(file.type) && file.size <= 6 * 1024 * 1024) return file
    throw new Error('format')
  }
}

function messageErreur(message: string) {
  const m = message.toLowerCase()
  if (m.includes('row-level security') || m.includes('jwt') || m.includes('not authorized')) return 'Ta session a expiré : reconnecte-toi, puis publie à nouveau.'
  if (m.includes('exceeded') || m.includes('too large')) return 'Une photo est trop lourde. Choisis une autre photo.'
  if (m.includes('mime') || m === 'format') return 'Format de photo non accepté. Utilise des photos JPG ou PNG.'
  if (m.includes('fetch') || m.includes('network')) return 'Pas de connexion internet. Vérifie ton réseau, puis réessaie.'
  return "La publication n'a pas abouti (" + message + '). Réessaie dans un instant.'
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 8,
  fontSize: 16, fontFamily: 'inherit', outline: 'none', background: 'white',
}
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }
const btnBack: React.CSSProperties = { flex: 1, padding: '13px 0', borderRadius: 8, border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 15 }
const btnNext: React.CSSProperties = { flex: 2, padding: '14px 0', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 15 }

export default function Sell() {
  const [compte, setCompte] = useState<'chargement' | 'absent' | 'ok'>('chargement')
  const [etape, setEtape] = useState(1)
  const [cat, setCat] = useState('')
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [marque, setMarque] = useState('')
  const [taille, setTaille] = useState('')
  const [etat, setEtat] = useState('')
  const [ville, setVille] = useState('Lubumbashi')
  const [quantite, setQuantite] = useState('1')
  const [telephone, setTelephone] = useState('')
  const [telephoneInitial, setTelephoneInitial] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [progression, setProgression] = useState('')
  const [erreur, setErreur] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const total = 4

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setCompte('absent'); return }
      setCompte('ok')
      try {
        const profil = await assurerProfil(data.session.user)
        setTelephone(profil.telephone || '')
        setTelephoneInitial(profil.telephone || '')
        if (profil.ville && VILLES.includes(profil.ville)) setVille(profil.ville)
      } catch { /* le profil sera recréé à la publication */ }
    })
  }, [])

  function ajouterPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const nouvelles = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpe?g|png|webp|heic|heif)$/i))
    const place = MAX_PHOTOS - photos.length
    if (nouvelles.length > place) setErreur('Maximum ' + MAX_PHOTOS + ' photos par annonce.')
    else setErreur('')
    setPhotos([...photos, ...nouvelles.slice(0, place).map(f => ({ fichier: f, apercu: URL.createObjectURL(f) }))])
    e.target.value = ''
  }

  function retirerPhoto(i: number) {
    URL.revokeObjectURL(photos[i].apercu)
    setPhotos(photos.filter((_, j) => j !== i))
  }

  function mettreEnPrincipale(i: number) {
    if (i === 0) return
    const copie = [...photos]
    const [p] = copie.splice(i, 1)
    setPhotos([p, ...copie])
  }

  function suivant(depuis: number) {
    setErreur('')
    if (depuis === 1 && photos.length === 0) { setErreur('Ajoute au moins une photo de ton article.'); return }
    if (depuis === 2 && !cat) { setErreur('Choisis une catégorie.'); return }
    if (depuis === 3) {
      const manque = [!titre.trim() && 'le titre', !etat && "l'état", !description.trim() && 'la description'].filter(Boolean)
      if (manque.length) { setErreur('Il manque : ' + manque.join(', ') + '.'); return }
    }
    setEtape(depuis + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function publier() {
    setErreur('')
    const montant = parseFloat(prix.replace(',', '.'))
    if (!isFinite(montant) || montant <= 0) { setErreur('Indique un prix supérieur à 0.'); return }
    const stock = parseInt(quantite, 10)
    if (!Number.isInteger(stock) || stock < 1) { setErreur('Indique une quantité d’au moins 1.'); return }
    if (telephone.trim() && !numeroWhatsApp(telephone)) { setErreur('Ce numéro WhatsApp n’est pas valide (ex. +243 97 000 0000). Corrige-le ou laisse le champ vide.'); return }

    setLoading(true)
    const envoyees: string[] = []
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setCompte('absent'); throw new Error('row-level security') }
      const user = session.user
      await assurerProfil(user)
      if (telephone.trim() !== telephoneInitial) {
        await supabase.from('profiles').update({ telephone: telephone.trim() || null }).eq('id', user.id)
      }

      const imageUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setProgression('Envoi des photos (' + (i + 1) + '/' + photos.length + ')…')
        const blob = await preparerPhoto(photos[i].fichier)
        const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
        const chemin = user.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
        const { error: upErr } = await supabase.storage.from('produits').upload(chemin, blob, { contentType: blob.type || 'image/jpeg', cacheControl: '31536000' })
        if (upErr) throw new Error(upErr.message)
        envoyees.push(chemin)
        imageUrls.push(supabase.storage.from('produits').getPublicUrl(chemin).data.publicUrl)
      }

      setProgression('Publication de l’annonce…')
      const { data, error } = await supabase.from('produits').insert({
        titre: titre.trim(),
        description: description.trim(),
        prix: montant,
        categorie: cat,
        marque: marque.trim() || null,
        taille: taille.trim() || null,
        etat,
        ville,
        images: imageUrls,
        vendeur_id: user.id,
        statut: 'actif',
        quantite: stock,
      }).select('id').single()
      if (error) throw new Error(error.message)
      window.location.href = '/merci?id=' + data.id
    } catch (e) {
      if (envoyees.length) await supabase.storage.from('produits').remove(envoyees).catch(() => {})
      setErreur(messageErreur(e instanceof Error ? e.message : String(e)))
      setProgression('')
      setLoading(false)
    }
  }

  const categorieChoisie = CATEGORIES.find(c => c.slug === cat)

  if (compte === 'chargement') {
    return <><Header /><main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Chargement…</p></main></>
  }

  if (compte === 'absent') {
    return (
      <>
        <Header />
        <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px' }}>
          <div className="card" style={{ maxWidth: 480, margin: '0 auto', overflow: 'hidden' }}>
            <img src={photo('photo-1581442616850-7bcff1d80af7', 960, 420)} alt="Une personne photographie un article avec son téléphone" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: 28, textAlign: 'center' }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Pour vendre, il faut un compte</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                C’est gratuit et ça prend une minute. Ensuite, tu reviens directement ici pour publier ton annonce.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="/auth?mode=inscription&next=/sell" style={{ background: 'var(--primary)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 8, fontSize: 16 }}>Créer mon compte gratuit</a>
                <a href="/auth?next=/sell" style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)', fontWeight: 700, padding: '13px 0', borderRadius: 8, fontSize: 15 }}>J’ai déjà un compte</a>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '24px 16px 96px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Étape {etape} sur {total}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{['Photos', 'Catégorie', 'Détails', 'Prix et contact'][etape - 1]}</p>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 4, width: (etape / total * 100) + '%', transition: 'width 0.3s' }} />
            </div>
          </div>

          {erreur && <div role="alert" style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>{erreur}</div>}

          <div className="card" style={{ padding: 24 }}>

            {etape === 1 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Ajoute les photos de ton article</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>De vraies photos, prises par toi : c’est ce qui donne confiance aux acheteurs. Jusqu’à {MAX_PHOTOS} photos.</p>

                <input ref={inputRef} type="file" accept="image/*" multiple onChange={ajouterPhotos} style={{ display: 'none' }} />

                {photos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 14 }}>
                    {photos.map((p, i) => (
                      <div key={p.apercu} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                        <img src={p.apercu} alt={'Photo ' + (i + 1)} onClick={() => mettreEnPrincipale(i)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: i === 0 ? 'default' : 'pointer' }} />
                        {i === 0 && <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'var(--primary)', color: 'white', fontSize: 11, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Principale</span>}
                        <button type="button" aria-label={'Retirer la photo ' + (i + 1)} onClick={() => retirerPhoto(i)}
                          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: 'white', cursor: 'pointer', fontSize: 15, lineHeight: '26px' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => inputRef.current?.click()}
                    style={{ width: '100%', border: '2px dashed var(--primary)', borderRadius: 10, padding: photos.length ? 18 : 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--primary-light)', marginBottom: 16, fontFamily: 'inherit' }}>
                    <Icone nom="photo" taille={photos.length ? 24 : 36} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{photos.length ? 'Ajouter une autre photo' : 'Prendre ou choisir des photos'}</span>
                    {!photos.length && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Depuis l’appareil photo ou la galerie</span>}
                  </button>
                )}
                {photos.length > 1 && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Touche une photo pour la mettre en photo principale.</p>}

                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Conseils pour de bonnes photos</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>Lumière du jour · Fond simple · Plusieurs angles · Montre les défauts s’il y en a</p>
                </div>

                <button type="button" onClick={() => suivant(1)} style={{ ...btnNext, width: '100%' }}>Continuer</button>
              </div>
            )}

            {etape === 2 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Quelle catégorie ?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Choisis celle qui correspond le mieux.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.slug} type="button" onClick={() => setCat(c.slug)} aria-pressed={cat === c.slug}
                      style={{ position: 'relative', height: 84, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0, border: cat === c.slug ? '3px solid var(--primary)' : '1px solid var(--border)', background: '#0b2a30' }}>
                      <img src={photo(c.photo, 320, 200)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
                      <span style={{ position: 'absolute', left: 10, bottom: 8, color: 'white', fontWeight: 700, fontSize: 15, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{c.label}</span>
                      {cat === c.slug && <span style={{ position: 'absolute', top: 6, right: 6, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, fontSize: 14, lineHeight: '24px' }}>✓</span>}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setEtape(1)} style={btnBack}>Retour</button>
                  <button type="button" onClick={() => suivant(2)} style={btnNext}>Continuer</button>
                </div>
              </div>
            )}

            {etape === 3 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Décris ton article</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Plus c’est précis, plus tu vendras vite.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label htmlFor="titre" style={labelStyle}>Titre *</label>
                    <input id="titre" type="text" value={titre} onChange={e => setTitre(e.target.value)} maxLength={80} placeholder="Ex. : Air Jordan 1 taille 42, très bon état" style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label htmlFor="marque" style={labelStyle}>Marque</label>
                      <input id="marque" type="text" value={marque} onChange={e => setMarque(e.target.value)} placeholder="Nike, Samsung…" style={inputStyle} />
                    </div>
                    <div>
                      <label htmlFor="taille" style={labelStyle}>Taille</label>
                      <input id="taille" type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder="M, 42, 128 Go…" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="etat" style={labelStyle}>État *</label>
                    <select id="etat" value={etat} onChange={e => setEtat(e.target.value)} style={inputStyle}>
                      <option value="">Choisis l’état</option>
                      {ETATS.map(x => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="description" style={labelStyle}>Description *</label>
                    <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} maxLength={1500}
                      placeholder="État, utilisation, accessoires fournis, raison de la vente…" style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="button" onClick={() => setEtape(2)} style={btnBack}>Retour</button>
                  <button type="button" onClick={() => suivant(3)} style={btnNext}>Continuer</button>
                </div>
              </div>
            )}

            {etape === 4 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Prix et contact</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Les acheteurs t’écrivent sur DEALER et tu reçois une notification.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label htmlFor="prix" style={labelStyle}>Prix en dollars *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>$</span>
                      <input id="prix" type="number" inputMode="decimal" value={prix} onChange={e => setPrix(e.target.value)} placeholder="0" min="1" step="0.01" style={{ ...inputStyle, paddingLeft: 30 }} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="quantite" style={labelStyle}>Quantité disponible *</label>
                    <input id="quantite" type="number" inputMode="numeric" min="1" step="1" value={quantite} onChange={e => setQuantite(e.target.value)} style={inputStyle} />
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>1 pour un article unique. Quand le stock tombe à 0, l’annonce passe en « Vendu » et les acheteurs intéressés sont prévenus.</p>
                  </div>
                  <div>
                    <label htmlFor="ville" style={labelStyle}>Ville *</label>
                    <select id="ville" value={ville} onChange={e => setVille(e.target.value)} style={inputStyle}>
                      {VILLES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tel" style={labelStyle}>Ton numéro WhatsApp <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(facultatif)</span></label>
                    <input id="tel" type="tel" inputMode="tel" autoComplete="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+243 97 000 0000" style={inputStyle} />
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>Proposé en option aux acheteurs qui préfèrent WhatsApp. Il est enregistré dans ton profil.</p>
                  </div>

                  <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Aperçu de ton annonce</p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {photos[0] && <img src={photos[0].apercu} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} />}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titre || 'Sans titre'}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{categorieChoisie?.label} · {etat} · {ville}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{prix ? prixAffiche(prix.replace(',', '.')) : 'Prix à indiquer'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {progression && <p role="status" style={{ marginTop: 16, fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>{progression}</p>}

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="button" onClick={() => setEtape(3)} disabled={loading} style={btnBack}>Retour</button>
                  <button type="button" onClick={publier} disabled={loading}
                    style={{ ...btnNext, background: loading ? 'var(--border)' : 'var(--primary)', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Publication…' : 'Publier mon annonce'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
