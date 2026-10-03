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

export default function ProfilPublic({ params }: { params: { id: string } }) {
  const [profil, setProfil] = useState<any>(null)
  const [annonces, setAnnonces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', params.id).single()
      setProfil(p)
      const { data: a } = await supabase.from('produits').select('*').eq('vendeur_id', params.id).eq('statut', 'actif').order('created_at', { ascending: false })
      setAnnonces(a || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <><Header /><main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><p style={{ color: 'var(--text-secondary)' }}>Chargement...</p></main></>

  if (!profil) return <><Header /><main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}><p style={{ fontSize: 17, fontWeight: 700 }}>Profil introuvable</p><a href="/" style={{ color: 'var(--primary)' }}>Retour à l'accueil</a></main></>

  const nom = (profil.prenom || '') + ' ' + (profil.nom || '')
  const initiale = nom.trim()[0]?.toUpperCase() || '?'

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', height: 140, position: 'relative' }}>
          <div className="container" style={{ height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: -36, left: 0, width: 80, height: 80, background: 'var(--white)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--primary)', border: '4px solid var(--white)', boxShadow: '0 4px 16px rgba(0,39,48,0.15)' }}>{initiale}</div>
          </div>
        </div>
        <div className="container" style={{ padding: '48px 0 48px' }}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>{nom.trim() || 'Vendeur'}</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {profil.ville || 'Lubumbashi'} · Membre depuis {new Date(profil.created_at).getFullYear()}</p>
                <div style={{ display: 'flex', gap: 28, marginTop: 16 }}>
                  {[[String(annonces.length), 'Annonces'], [String(profil.nb_ventes || 0), 'Ventes'], [String(profil.note || '—'), 'Note']].map(([n, l]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 22, fontWeight: 800 }}>{n}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l}</p>
                    </div>
                  ))}
                </div>
                {profil.bio && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 14, maxWidth: 500, lineHeight: 1.7 }}>{profil.bio}</p>}
              </div>
              <a href={'/messages/' + params.id} style={{ background: 'var(--primary)', color: 'white', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, alignSelf: 'flex-start' }}>💬 Contacter</a>
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Annonces ({annonces.length})</h2>

          {annonces.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Ce vendeur n'a pas encore d'annonces actives.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {annonces.map((a: any) => (
                <a key={a.id} href={'/product/' + a.id} className="product-card"
                  style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)' }}>
                  <div style={{ background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {a.images?.[0] ? <img src={a.images[0]} alt={a.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 52 }}>{icones[a.categorie] || '📦'}</span>}
                  </div>
                  <div style={{ padding: '10px 10px 12px' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titre}</p>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>{a.prix}$</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {a.ville}</p>
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
