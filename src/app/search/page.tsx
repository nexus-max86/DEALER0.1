'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

const categories = ['Toutes', 'Chaussures', 'Vêtements', 'Téléphones', 'Beauté', 'Électronique', 'Automobile', 'Maison', 'Sport', 'Autre']
const etats = ['Tous', 'Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état', 'Bon état', 'État correct']
const villes = ['Toutes', 'Lubumbashi', 'Kinshasa', 'Kolwezi', 'Likasi', 'Goma', 'Bukavu']

const icones: Record<string, string> = {
  chaussures: '👟', vetements: '👕', telephones: '📱',
  beaute: '💄', electronique: '💻', automobile: '🚗',
  maison: '🏠', sport: '⚽', autre: '📦',
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Toutes')
  const [etat, setEtat] = useState('Tous')
  const [ville, setVille] = useState('Toutes')
  const [prixMin, setPrixMin] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [tri, setTri] = useState('recent')
  const [resultats, setResultats] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showFiltres, setShowFiltres] = useState(false)
  const [total, setTotal] = useState(0)

  const chercher = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('produits')
      .select('*', { count: 'exact' })
      .eq('statut', 'actif')

    if (query.trim()) {
      q = q.or('titre.ilike.%' + query + '%,description.ilike.%' + query + '%,marque.ilike.%' + query + '%')
    }
    if (categorie !== 'Toutes') {
      q = q.ilike('categorie', categorie.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    }
    if (etat !== 'Tous') q = q.eq('etat', etat)
    if (ville !== 'Toutes') q = q.eq('ville', ville)
    if (prixMin) q = q.gte('prix', parseFloat(prixMin))
    if (prixMax) q = q.lte('prix', parseFloat(prixMax))

    if (tri === 'recent') q = q.order('created_at', { ascending: false })
    else if (tri === 'prix_asc') q = q.order('prix', { ascending: true })
    else if (tri === 'prix_desc') q = q.order('prix', { ascending: false })

    q = q.limit(24)

    const { data, count } = await q
    setResultats(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [query, categorie, etat, ville, prixMin, prixMax, tri])

  useEffect(() => {
    chercher()
  }, [chercher])

  // Lire le paramètre q dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) setQuery(q)
  }, [])

  function resetFiltres() {
    setCategorie('Toutes')
    setEtat('Tous')
    setVille('Toutes')
    setPrixMin('')
    setPrixMax('')
    setTri('recent')
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <div className="container" style={{ padding: '24px 16px' }}>

          {/* BARRE DE RECHERCHE */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}>🔍</span>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                style={{ ...inputStyle, paddingLeft: 42, borderRadius: 24, padding: '12px 16px 12px 42px' }}
              />
            </div>
            <button
              onClick={() => setShowFiltres(!showFiltres)}
              style={{ background: showFiltres ? 'var(--primary)' : 'var(--white)', color: showFiltres ? 'white' : 'var(--text)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '0 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ⚙️ Filtres
            </button>
          </div>

          {/* FILTRES */}
          {showFiltres && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Catégorie</label>
                  <select value={categorie} onChange={e => setCategorie(e.target.value)} style={inputStyle}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>État</label>
                  <select value={etat} onChange={e => setEtat(e.target.value)} style={inputStyle}>
                    {etats.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ville</label>
                  <select value={ville} onChange={e => setVille(e.target.value)} style={inputStyle}>
                    {villes.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Trier par</label>
                  <select value={tri} onChange={e => setTri(e.target.value)} style={inputStyle}>
                    <option value="recent">Plus récents</option>
                    <option value="prix_asc">Prix croissant</option>
                    <option value="prix_desc">Prix décroissant</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prix min ($)</label>
                  <input type="number" value={prixMin} onChange={e => setPrixMin(e.target.value)} placeholder="0" min="0" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prix max ($)</label>
                  <input type="number" value={prixMax} onChange={e => setPrixMax(e.target.value)} placeholder="9999" min="0" style={inputStyle} />
                </div>
              </div>
              <button
                onClick={resetFiltres}
                style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* CATÉGORIES RAPIDES */}
          <div style={{ display: 'flex', gap: 8, overflow: 'auto', marginBottom: 20, paddingBottom: 4 }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategorie(c)}
                style={{ whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 24, border: '1.5px solid', borderColor: categorie === c ? 'var(--primary)' : 'var(--border)', background: categorie === c ? 'var(--primary-light)' : 'var(--white)', color: categorie === c ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: categorie === c ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* RÉSULTATS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {loading ? 'Recherche...' : total + ' résultat' + (total > 1 ? 's' : '') + (query ? ' pour "' + query + '"' : '')}
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ color: 'var(--text-secondary)' }}>Recherche en cours...</p>
            </div>
          )}

          {!loading && resultats.length === 0 && (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Aucun résultat</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Essayez avec d'autres mots-clés ou modifiez vos filtres.</p>
              <button onClick={resetFiltres} style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                Effacer les filtres
              </button>
            </div>
          )}

          {!loading && resultats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {resultats.map((p: any) => (
                <a
                  key={p.id}
                  href={'/product/' + p.id}
                  className="product-card"
                  style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)' }}
                >
                  <div style={{ background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 52 }}>{icones[p.categorie] || '📦'}</span>
                    )}
                  </div>
                  <div style={{ padding: '10px 10px 12px' }}>
                    <span style={{ fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{p.categorie}</span>
                    <p style={{ fontSize: 14, fontWeight: 500, marginTop: 6, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titre}</p>
                    {p.marque && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.marque}</p>}
                    <p style={{ fontSize: 16, fontWeight: 700 }}>{p.prix}$</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {p.ville}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

        </div>
      </main>
      <BottomNav />
    </>
  )
}
