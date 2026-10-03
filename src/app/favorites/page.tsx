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

export default function Favorites() {
  const [favoris, setFavoris] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      const { data } = await supabase
        .from('favoris')
        .select('*, produits(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFavoris(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function retirerFavori(favoriId: string) {
    await supabase.from('favoris').delete().eq('id', favoriId)
    setFavoris(favoris.filter(f => f.id !== favoriId))
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Mes favoris</h1>
          {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>Chargement...</p>}
          {!loading && favoris.length === 0 && (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🤍</p>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Aucun favori</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Appuyez sur le cœur d'un article pour le sauvegarder ici.</p>
              <a href="/" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Explorer les produits</a>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {favoris.map((f: any) => {
              const p = f.produits
              if (!p) return null
              return (
                <div key={f.id} style={{ position: 'relative' }}>
                  <a href={'/product/' + p.id} style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)' }}>
                    <div style={{ background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 52 }}>{icones[p.categorie] || '📦'}</span>}
                    </div>
                    <div style={{ padding: '10px 10px 12px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titre}</p>
                      <p style={{ fontSize: 16, fontWeight: 700 }}>{p.prix}$</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {p.ville}</p>
                    </div>
                  </a>
                  <button
                    onClick={() => retirerFavori(f.id)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >❤️</button>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
