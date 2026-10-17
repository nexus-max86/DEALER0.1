'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { categorie, photo } from '@/lib/catalogue'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import CarteProduit, { type ProduitResume } from '@/components/CarteProduit'

export default function Categorie() {
  const params = useParams<{ slug: string }>()
  const slug = decodeURIComponent(params?.slug || '').toLowerCase()
  const c = categorie(slug)
  const [produits, setProduits] = useState<ProduitResume[]>([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [tri, setTri] = useState('recent')

  useEffect(() => {
    if (!slug) return
    async function load() {
      setLoading(true)
      let q = supabase.from('produits').select('id, titre, prix, categorie, marque, ville, images, statut').eq('statut', 'actif').eq('categorie', slug)
      if (tri === 'recent') q = q.order('created_at', { ascending: false })
      else if (tri === 'prix_asc') q = q.order('prix', { ascending: true })
      else if (tri === 'prix_desc') q = q.order('prix', { ascending: false })
      const { data, error } = await q.limit(48)
      setErreur(error ? 'Impossible de charger les annonces. Vérifie ta connexion, puis recharge la page.' : '')
      setProduits((data as ProduitResume[]) || [])
      setLoading(false)
    }
    load()
  }, [slug, tri])

  const label = c?.label || slug

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <section style={{ position: 'relative', height: 170, background: '#0b2a30', overflow: 'hidden' }}>
          {c && <img src={photo(c.photo, 1600, 400)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />}
          <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 20, color: 'white' }}>
            <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>← Accueil</a>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>{label}</h1>
            {!loading && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{produits.length} annonce{produits.length > 1 ? 's' : ''}</p>}
          </div>
        </section>

        <div className="container" style={{ padding: '20px 0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <select value={tri} onChange={e => setTri(e.target.value)} aria-label="Trier"
              style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="recent">Plus récentes</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
            </select>
          </div>

          {loading && <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Chargement…</p>}
          {erreur && <p role="alert" style={{ textAlign: 'center', padding: 24, color: '#991B1B' }}>{erreur}</p>}

          {!loading && !erreur && produits.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Pas encore d’annonce dans « {label} »</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Tu as quelque chose à vendre ? Publie la première annonce.</p>
              <a href="/sell" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Publier une annonce</a>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
            {produits.map(p => <CarteProduit key={p.id} p={p} />)}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
