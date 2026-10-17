import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Galerie from '@/components/Galerie'
import CarteProduit, { type ProduitResume } from '@/components/CarteProduit'
import { clientServeur } from '@/lib/serveur'
import { SITE_URL, categorie, datePublication, numeroWhatsApp, prixAffiche } from '@/lib/catalogue'

type Props = { params: Promise<{ id: string }> }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const chargerProduit = cache(async (id: string) => {
  if (!UUID.test(id)) return null
  const { data } = await clientServeur().from('produits').select('*').eq('id', id).maybeSingle()
  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const p = await chargerProduit(id)
  if (!p) return { title: 'Annonce introuvable' }
  const description = (prixAffiche(p.prix) + ' · ' + (p.ville || 'Lubumbashi') + ' · ' + (p.description || '')).slice(0, 160)
  return {
    title: p.titre,
    description,
    openGraph: { title: p.titre + ' · ' + prixAffiche(p.prix), description, url: SITE_URL + '/product/' + p.id, images: p.images?.length ? [p.images[0]] : undefined },
  }
}

export default async function PageProduit({ params }: Props) {
  const { id } = await params
  const p = await chargerProduit(id)
  if (!p) notFound()

  const db = clientServeur()
  const { data: vendeur } = p.vendeur_id
    ? await db.from('profiles').select('id, prenom, nom, telephone, ville, created_at').eq('id', p.vendeur_id).maybeSingle()
    : { data: null }
  const { data: similaires } = await db.from('produits')
    .select('id, titre, prix, categorie, marque, ville, images, statut')
    .eq('statut', 'actif').eq('categorie', p.categorie).neq('id', p.id)
    .order('created_at', { ascending: false }).limit(4)

  const c = categorie(p.categorie)
  const images: string[] = Array.isArray(p.images) ? p.images : []
  const lien = SITE_URL + '/product/' + p.id
  const numero = numeroWhatsApp(vendeur?.telephone)
  const texte = 'Bonjour, je suis intéressé(e) par votre annonce « ' + p.titre + ' » à ' + prixAffiche(p.prix) + ' sur DEALER : ' + lien
  const nomVendeur = vendeur ? ((vendeur.prenom || 'Vendeur') + (vendeur.nom ? ' ' + String(vendeur.nom)[0].toUpperCase() + '.' : '')) : 'Vendeur'
  const vendu = p.statut === 'vendu'

  const details: [string, string][] = [
    ['Catégorie', c?.label || p.categorie || '—'],
    ['État', p.etat || '—'],
    ['Marque', p.marque || '—'],
    ['Taille', p.taille || '—'],
    ['Ville', p.ville || 'Lubumbashi'],
    ['Publiée', datePublication(p.created_at)],
  ]

  return (
    <>
      <Header />
      <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
        <div className="container" style={{ padding: '20px 0 48px' }}>

          <nav style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="/" style={{ color: 'var(--primary)' }}>Accueil</a>
            <span>›</span>
            {c ? <a href={'/category/' + c.slug} style={{ color: 'var(--primary)' }}>{c.label}</a> : <span>Annonce</span>}
            <span>›</span>
            <span style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titre}</span>
          </nav>

          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
            <Galerie images={images} titre={p.titre} icone={c?.icon || '📦'} />

            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {c && <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>{c.label}</span>}
                {p.etat && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>{p.etat}</span>}
                {vendu && <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>Vendu</span>}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{p.titre}</h1>
              <p style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{prixAffiche(p.prix)}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 22 }}>📍 {p.ville || 'Lubumbashi'} · Publiée {datePublication(p.created_at)}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {vendu ? (
                  <p style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', fontSize: 15, textAlign: 'center' }}>Cet article a déjà été vendu.</p>
                ) : numero ? (
                  <>
                    <a href={'https://wa.me/' + numero + '?text=' + encodeURIComponent(texte)} target="_blank" rel="noopener noreferrer"
                      style={{ background: '#1FA855', color: 'white', fontWeight: 700, padding: '15px 0', borderRadius: 8, fontSize: 16, textAlign: 'center', display: 'block' }}>
                      Contacter sur WhatsApp
                    </a>
                    <a href={'tel:+' + numero} style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)', fontWeight: 700, padding: '13px 0', borderRadius: 8, fontSize: 15, textAlign: 'center', display: 'block' }}>
                      Appeler le vendeur
                    </a>
                  </>
                ) : (
                  <p style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>Le vendeur n’a pas encore ajouté de numéro de contact.</p>
                )}
                <a href={'https://wa.me/?text=' + encodeURIComponent(p.titre + ' · ' + prixAffiche(p.prix) + ' sur DEALER : ' + lien)} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', textDecoration: 'underline' }}>
                  Partager cette annonce
                </a>
              </div>

              {p.description && (
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Description</h2>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{p.description}</p>
                </div>
              )}

              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Détails</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {details.map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{k}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--primary-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{nomVendeur[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{nomVendeur}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {vendeur?.ville || 'Lubumbashi'}{vendeur?.created_at ? ' · Membre depuis ' + new Date(vendeur.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}</p>
                  </div>
                  {vendeur && <a href={'/profile/' + vendeur.id} style={{ fontSize: 13, color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '7px 14px', borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap' }}>Ses annonces</a>}
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.6 }}>
                Conseil : rencontre le vendeur dans un lieu public, vérifie l’article avant de payer et ne paie jamais à l’avance.
              </p>
            </div>
          </div>

          {similaires && similaires.length > 0 && (
            <section style={{ marginTop: 44 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>Dans la même catégorie</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
                {(similaires as ProduitResume[]).map(s => <CarteProduit key={s.id} p={s} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
