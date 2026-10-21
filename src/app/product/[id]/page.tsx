import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Galerie from '@/components/Galerie'
import CarteProduit, { type ProduitResume } from '@/components/CarteProduit'
import ActionsAnnonce from '@/components/ActionsAnnonce'
import BadgeStatut from '@/components/BadgeStatut'
import Avatar from '@/components/Avatar'
import Icone from '@/components/Icone'
import BadgesVendeur from '@/components/BadgesVendeur'
import { clientServeur } from '@/lib/serveur'
import { SITE_URL, badgesDe, categorie, datePublication, nomCourt, prixAffiche, statutDe } from '@/lib/catalogue'

type Props = { params: Promise<{ id: string }> }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const chargerProduit = cache(async (id: string) => {
  if (!UUID.test(id)) return null
  const { data } = await clientServeur().from('produits').select('*').eq('id', id).maybeSingle()
  // Une annonce suspendue par l'admin n'est plus visible
  return data && data.statut !== 'suspendu' ? data : null
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
    ? await db.from('profiles').select('id, prenom, nom, telephone, ville, created_at, avatar_url, bio, pro_jusqua, verifie_jusqua, boutique_nom').eq('id', p.vendeur_id).maybeSingle()
    : { data: null }
  const { data: similaires } = await db.from('produits')
    .select('id, titre, prix, categorie, marque, ville, images, statut, quantite')
    .in('statut', ['actif', 'reserve']).eq('categorie', p.categorie).neq('id', p.id)
    .order('created_at', { ascending: false }).limit(4)

  const c = categorie(p.categorie)
  const images: string[] = Array.isArray(p.images) ? p.images : []
  const lien = SITE_URL + '/product/' + p.id
  const nomVendeur = vendeur ? (badgesDe(vendeur).pro && vendeur.boutique_nom ? vendeur.boutique_nom : nomCourt(vendeur)) : 'Vendeur'
  const statut = statutDe(p.statut)

  const details: [string, string][] = [
    ['Catégorie', c?.label || p.categorie || '—'],
    ['État', p.etat || '—'],
    ['Marque', p.marque || '—'],
    ['Taille', p.taille || '—'],
    ['Ville', p.ville || 'Lubumbashi'],
    ['Publiée', datePublication(p.created_at)],
    ['Disponibilité', statut === 'actif' ? ((p.quantite ?? 1) > 1 ? (p.quantite + ' en stock') : 'Dernier article') : statut === 'reserve' ? 'Réservé' : 'Vendu'],
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
              <div style={{ marginBottom: 12 }}><BadgeStatut statut={p.statut} quantite={p.quantite} /></div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {c && <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>{c.label}</span>}
                {p.etat && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>{p.etat}</span>}

              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{p.titre}</h1>
              <p style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{prixAffiche(p.prix)}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}><Icone nom="lieu" taille={16} /> {p.ville || 'Lubumbashi'}, publiée {datePublication(p.created_at)}</p>

              <ActionsAnnonce lien={lien} prenomVendeur={vendeur?.prenom || 'le vendeur'} telephoneVendeur={vendeur?.telephone || null}
                produit={{ id: p.id, titre: p.titre, prix: p.prix, vendeur_id: p.vendeur_id, statut: p.statut, quantite: p.quantite, vendus: p.vendus, vues: p.vues }} />
              <a href={'https://wa.me/?text=' + encodeURIComponent(p.titre + ', ' + prixAffiche(p.prix) + ' sur DEALER : ' + lien)} target="_blank" rel="noopener noreferrer"
                className="lien-discret" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, color: 'var(--text-secondary)' }}>
                <Icone nom="partager" taille={16} /> Partager cette annonce
              </a>

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
                  <Avatar url={vendeur?.avatar_url} nom={vendeur?.prenom} taille={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{nomVendeur} <BadgesVendeur profil={vendeur} taille="petit" /></p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{vendeur?.ville || 'Lubumbashi'}{vendeur?.created_at ? ', membre depuis ' + new Date(vendeur.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}</p>
                  </div>
                  {vendeur && <a href={'/profile/' + vendeur.id} className="bouton bouton-secondaire" style={{ fontSize: 13, padding: '7px 12px' }}>Son profil</a>}
                </div>
                {vendeur?.bio && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{vendeur.bio}</p>}
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
