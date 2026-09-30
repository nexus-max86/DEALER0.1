'use client'
import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const total = 4

  async function publier() {
    setLoading(true)
    setErreur('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErreur('Tu dois être connecté pour publier une annonce.')
      setLoading(false)
      return
    }
    const { error } = await supabase.from('produits').insert({
      titre, description, prix: parseFloat(prix),
      categorie: cat, marque, taille, etat, ville,
      vendeur_id: user.id, statut: 'actif',
    })
    if (error) {
      setErreur('Erreur lors de la publication. Réessaie.')
    } else {
      window.location.href = '/merci'
    }
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Étape {etape} sur {total}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{Math.round((etape/total)*100)}% complété</p>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 4, width: (etape/total*100) + '%', transition: 'width 0.3s' }} />
            </div>
          </div>

          {erreur && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>❌ {erreur}</div>}

          <div className="card" style={{ padding: 32 }}>
            {etape === 1 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Ajoutez vos photos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Les articles avec photos se vendent 3x plus vite.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                  <div style={{ gridColumn: '1 / -1', border: '2px dashed var(--primary)', borderRadius: 10, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--primary-light)' }}>
                    <span style={{ fontSize: 36 }}>📷</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>Photo principale</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Cliquez pour ajouter</p>
                  </div>
                  {[1,2,3].map(i => <div key={i} style={{ border: '2px dashed var(--border)', borderRadius: 10, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 22, color: 'var(--text-secondary)' }}>+</div>)}
                </div>
                <button onClick={() => setEtape(2)} style={{ background: 'var(--primary)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 8, fontSize: 15, border: 'none', cursor: 'pointer', width: '100%' }}>Continuer →</button>
              </div>
            )}

            {etape === 2 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Quelle catégorie ?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Choisissez la catégorie la plus adaptée.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                  {categories.map(c => (
                    <button key={c.slug} onClick={() => setCat(c.slug)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: cat === c.slug ? '2px solid var(--primary)' : '1.5px solid var(--border)', borderRadius: 10, background: cat === c.slug ? 'var(--primary-light)' : 'var(--white)', cursor: 'pointer' }}>
                      <span style={{ fontSize: 22 }}>{c.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setEtape(1)} style={{ flex: 1, padding: '13px 0', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>← Retour</button>
                  <button onClick={() => cat && setEtape(3)} style={{ flex: 2, padding: '14px 0', borderRadius: 8, border: 'none', background: cat ? 'var(--primary)' : 'var(--border)', color: cat ? 'white' : 'var(--text-secondary)', cursor: cat ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15 }}>Continuer →</button>
                </div>
              </div>
            )}

            {etape === 3 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Détails du produit</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Plus c'est détaillé, plus vous vendrez vite.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Titre *</label><input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex : Air Jordan 1 Retro taille 42" required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Marque</label><input type="text" value={marque} onChange={e => setMarque(e.target.value)} placeholder="Nike, Apple, Zara..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Taille</label><input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder="S, M, L, 42..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>État *</label>
                      <select value={etat} onChange={e => setEtat(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'white' }}>
                        <option value="">Sélectionnez</option>
                        <option>Neuf avec étiquette</option>
                        <option>Neuf sans étiquette</option>
                        <option>Très bon état</option>
                        <option>Bon état</option>
                        <option>État correct</option>
                      </select>
                    </div>
                  </div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description *</label><textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre article : état, utilisation, raison de la vente..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setEtape(2)} style={{ flex: 1, padding: '13px 0', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>← Retour</button>
                  <button onClick={() => titre && description && etat && setEtape(4)} style={{ flex: 2, padding: '14px 0', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Continuer →</button>
                </div>
              </div>
            )}

            {etape === 4 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Prix et livraison</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Définissez votre prix et la ville.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prix ($) *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>$</span>
                      <input type="number" value={prix} onChange={e => setPrix(e.target.value)} placeholder="0" min="1" required style={{ width: '100%', padding: '10px 14px 10px 30px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ville *</label>
                    <select value={ville} onChange={e => setVille(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'white' }}>
                      <option>Lubumbashi</option>
                      <option>Kinshasa</option>
                      <option>Kolwezi</option>
                      <option>Likasi</option>
                      <option>Goma</option>
                      <option>Bukavu</option>
                    </select>
                  </div>
                  <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '14px 18px' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>✨ Options de livraison</p>
                    <p style={{ fontSize: 12, color: 'var(--primary-dark)', marginTop: 4 }}>Remise en main propre, livraison à domicile, coursier — à préciser dans la description.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setEtape(3)} style={{ flex: 1, padding: '13px 0', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>← Retour</button>
                  <button onClick={publier} disabled={loading || !prix} style={{ flex: 2, padding: '14px 0', borderRadius: 8, border: 'none', background: loading || !prix ? 'var(--border)' : 'var(--primary)', color: 'white', cursor: loading || !prix ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 15 }}>
                    {loading ? 'Publication...' : '🚀 Publier l'annonce'}
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
