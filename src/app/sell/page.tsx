'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const categories = [
  { slug: 'chaussures', label: 'Chaussures', icon: '👟' },
  { slug: 'vetements', label: 'Vêtements', icon: '👕' },
  { slug: 'telephones', label: 'Téléphones', icon: '📱' },
  { slug: 'beaute', label: 'Beauté', icon: '💄' },
  { slug: 'electronique', label: 'Électronique', icon: '💻' },
  { slug: 'automobile', label: 'Automobile', icon: '🚗' },
  { slug: 'maison', label: 'Maison', icon: '🏠' },
  { slug: 'autre', label: 'Autre', icon: '📦' },
]

export default function Sell() {
  const [etape, setEtape] = useState(1)
  const [cat, setCat] = useState('')
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [marque, setMarque] = useState('')
  const [taille, setTaille] = useState('')
  const [etat, setEtat] = useState('')
  const [ville, setVille] = useState('Lubumbashi')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const total = 4

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 4)
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function publier() {
    setLoading(true)
    setErreur('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErreur("Tu dois être connecté pour publier une annonce.")
      setLoading(false)
      return
    }

    // Upload des photos
    const imageUrls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const fileName = user.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext
      const { error: upErr } = await supabase.storage
        .from('produits')
        .upload(fileName, photo, { contentType: photo.type })
      if (upErr) {
        setErreur("Erreur upload photo : " + upErr.message)
        setLoading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('produits').getPublicUrl(fileName)
      imageUrls.push(urlData.publicUrl)
    }

    // Création du produit
    const { error } = await supabase.from('produits').insert({
      titre,
      description,
      prix: parseFloat(prix),
      categorie: cat,
      marque,
      taille,
      etat,
      ville,
      images: imageUrls,
      vendeur_id: user.id,
      statut: 'actif',
    })

    if (error) {
      setErreur("Erreur lors de la publication. Réessaie.")
    } else {
      window.location.href = '/merci'
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  } as React.CSSProperties

  const btnBack = {
    flex: 1,
    padding: '13px 0',
    borderRadius: 8,
    border: '1.5px solid var(--border)',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  } as React.CSSProperties

  const btnNext = {
    flex: 2,
    padding: '14px 0',
    borderRadius: 8,
    border: 'none',
    background: 'var(--primary)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 15,
  } as React.CSSProperties

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* BARRE DE PROGRESSION */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Étape {etape} sur {total}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{Math.round((etape/total)*100)}% complété</p>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 4, width: (etape/total*100) + '%', transition: 'width 0.3s' }} />
            </div>
          </div>

          {erreur && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {erreur}
            </div>
          )}

          <div className="card" style={{ padding: 32 }}>

            {/* ÉTAPE 1 — PHOTOS */}
            {etape === 1 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Ajoutez vos photos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Les articles avec photos se vendent 3x plus vite.</p>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotos}
                  style={{ display: 'none' }}
                />

                {previews.length === 0 ? (
                  <div
                    onClick={() => inputRef.current?.click()}
                    style={{ border: '2px dashed var(--primary)', borderRadius: 10, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'var(--primary-light)', marginBottom: 20 }}
                  >
                    <span style={{ fontSize: 40 }}>📷</span>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>Cliquez pour ajouter des photos</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>JPG, PNG · 4 photos maximum</p>
                  </div>
                ) : (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
                      {previews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={src} alt={"Photo " + (i+1)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {i === 0 && (
                            <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'var(--primary)', color: 'white', fontSize: 11, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Principale</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => inputRef.current?.click()}
                      style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Changer les photos
                    </button>
                  </div>
                )}

                <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Conseils pour de bonnes photos</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                    Bonne lumière naturelle · Fond neutre · Plusieurs angles · Montrez les défauts si présents
                  </p>
                </div>

                <button
                  onClick={() => setEtape(2)}
                  style={{ ...btnNext, flex: 'unset', width: '100%' }}
                >
                  Continuer →
                </button>
              </div>
            )}

            {/* ÉTAPE 2 — CATÉGORIE */}
            {etape === 2 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Quelle catégorie ?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Choisissez la catégorie la plus adaptée.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                  {categories.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => setCat(c.slug)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: cat === c.slug ? '2px solid var(--primary)' : '1.5px solid var(--border)', borderRadius: 10, background: cat === c.slug ? 'var(--primary-light)' : 'var(--white)', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 22 }}>{c.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setEtape(1)} style={btnBack}>← Retour</button>
                  <button
                    onClick={() => cat && setEtape(3)}
                    style={{ ...btnNext, background: cat ? 'var(--primary)' : 'var(--border)', color: cat ? 'white' : 'var(--text-secondary)', cursor: cat ? 'pointer' : 'not-allowed' }}
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 — DÉTAILS */}
            {etape === 3 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Détails du produit</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Plus les détails sont précis, plus vous vendrez vite.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Titre *</label>
                    <input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex : Air Jordan 1 Retro taille 42" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Marque</label>
                    <input type="text" value={marque} onChange={e => setMarque(e.target.value)} placeholder="Nike, Apple, Zara..." style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Taille</label>
                      <input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder="S, M, L, 42..." style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>État *</label>
                      <select value={etat} onChange={e => setEtat(e.target.value)} style={{ ...inputStyle, background: 'white' }}>
                        <option value="">Sélectionnez</option>
                        <option>Neuf avec étiquette</option>
                        <option>Neuf sans étiquette</option>
                        <option>Très bon état</option>
                        <option>Bon état</option>
                        <option>État correct</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description *</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Décrivez votre article : état, utilisation, raison de la vente..."
                      style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setEtape(2)} style={btnBack}>← Retour</button>
                  <button
                    onClick={() => titre && description && etat && setEtape(4)}
                    style={btnNext}
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 — PRIX */}
            {etape === 4 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Prix et livraison</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Définissez votre prix et la ville.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prix ($) *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>$</span>
                      <input
                        type="number"
                        value={prix}
                        onChange={e => setPrix(e.target.value)}
                        placeholder="0"
                        min="1"
                        required
                        style={{ ...inputStyle, paddingLeft: 30 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ville *</label>
                    <select value={ville} onChange={e => setVille(e.target.value)} style={{ ...inputStyle, background: 'white' }}>
                      <option>Lubumbashi</option>
                      <option>Kinshasa</option>
                      <option>Kolwezi</option>
                      <option>Likasi</option>
                      <option>Goma</option>
                      <option>Bukavu</option>
                    </select>
                  </div>

                  {/* RÉSUMÉ */}
                  {previews.length > 0 && (
                    <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Résumé de votre annonce</p>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <img src={previews[0]} alt="Preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{titre || 'Sans titre'}</p>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{cat} · {etat}</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{prix ? prix + '$' : 'Prix non défini'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setEtape(3)} style={btnBack}>← Retour</button>
                  <button
                    onClick={publier}
                    disabled={loading || !prix}
                    style={{ ...btnNext, background: loading || !prix ? 'var(--border)' : 'var(--primary)', cursor: loading || !prix ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? 'Publication en cours...' : 'Publier mon annonce'}
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
