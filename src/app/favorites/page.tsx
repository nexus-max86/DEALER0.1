'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Icone from '@/components/Icone'
import CarteProduit, { type ProduitResume } from '@/components/CarteProduit'

type Favori = { id: string; produits: ProduitResume | null }

export default function Favorites() {
  const [favoris, setFavoris] = useState<Favori[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/auth?next=/favorites'; return }
      const { data } = await supabase
        .from('favoris')
        .select('id, produits(id, titre, prix, categorie, marque, ville, images, statut, quantite)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      setFavoris(((data as unknown as Favori[]) || []).filter(f => f.produits))
      setLoading(false)
    }
    load()
  }, [])

  async function retirer(f: Favori) {
    await supabase.from('favoris').delete().eq('id', f.id)
    setFavoris(favoris.filter(x => x.id !== f.id))
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '24px 16px 96px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Mes favoris</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icone nom="cloche" taille={16} /> Tu reçois une alerte quand un de ces articles est réservé, vendu ou de nouveau disponible.
          </p>
          {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>Chargement…</p>}
          {!loading && favoris.length === 0 && (
            <div className="carte" style={{ padding: 40, textAlign: 'center' }}>
              <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icone nom="coeur" taille={26} /></span>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Aucun favori pour l’instant</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Sur une annonce, touche « Ajouter aux favoris » pour la retrouver ici et suivre sa disponibilité.</p>
              <a href="/#annonces" className="bouton bouton-principal">Voir les annonces</a>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
            {favoris.map(f => (
              <div key={f.id} style={{ position: 'relative' }}>
                <CarteProduit p={f.produits!} />
                <button type="button" onClick={() => retirer(f)} aria-label={'Retirer ' + f.produits!.titre + ' des favoris'}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', color: '#D92D20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icone nom="coeur" taille={18} style={{ fill: 'currentColor' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
