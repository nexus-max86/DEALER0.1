'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

const icones: Record<string, string> = {
  chaussures: '👟', vetements: '👕', telephones: '📱',
  beaute: '💄', electronique: '💻', automobile: '🚗',
  maison: '🏠', sport: '⚽', autre: '📦',
}

const labels: Record<string, string> = {
  chaussures: 'Chaussures', vetements: 'Vêtements', telephones: 'Téléphones',
  beaute: 'Beauté', electronique: 'Électronique', automobile: 'Automobile',
  maison: 'Maison', sport: 'Sport', autre: 'Autre',
}

export default function Categorie({ params }: { params: { slug: string } }) {
  const [produits, setProduits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tri, setTri] = useState('recent')

  useEffect(() => {
    async function load() {
      let q = supabase.from('produits').select('*').eq('statut', 'actif').ilike('categorie', params.slug)
      if (tri === 'recent') q = q.order('created_at', { ascending: false })
      else if (tri === 'prix_asc') q = q.order('prix', { ascending: true })
      else if (tri === 'prix_desc') q = q.order('prix', { ascending: false })
      const { data } = await q.limit(24)
      setProduits(data || [])
      setLoading(false)
    }
    load()
  }, [params.slug, tri])

  const label = labels[params.slug] || params.slug
  const icone = icones[params.slug] || '📦'

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px' }}>
        <div className="container">
          <a href="/" style={{ fontSize: 13, color: 'var(--primary)', display: 'inline-block', marginBottom: 20 }}>← Retour</a>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 36 }}>{icone}</span>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>{label}</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{produits.length} article{produits.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <select value={tri} onChange={e => setTri(e.target.value)}
              style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="recent">Plus récents</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
            </select>
          </div>

          {loading && <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Chargement...</p>}

          {!loading && produits.length === 0 && (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>{icone}</p>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Aucune annonce dans cette catégorie</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Soyez le premier à vendre dans cette catégorie !</p>
              <a href="/sell" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Publier une annonce</a>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {produits.map((p: any) => (
              <a key={p.id} href={'/product/' + p.id} className="product-card"
                style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)' }}>
                <div style={{ background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 52 }}>{icone}</span>}
                </div>
                <div style={{ padding: '10px 10px 12px' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titre}</p>
                  {p.marque && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.marque}</p>}
                  <p style={{ fontSize: 16, fontWeight: 700 }}>{p.prix}$</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {p.ville}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
