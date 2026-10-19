import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Avatar from '@/components/Avatar'
import Icone from '@/components/Icone'
import CarteProduit, { type ProduitResume } from '@/components/CarteProduit'
import { clientServeur } from '@/lib/serveur'
import { nomCourt, numeroWhatsApp } from '@/lib/catalogue'

type Props = { params: Promise<{ id: string }> }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function charger(id: string) {
  if (!UUID.test(id)) return null
  const db = clientServeur()
  const { data: profil } = await db.from('profiles').select('id, prenom, nom, ville, bio, avatar_url, telephone, created_at').eq('id', id).maybeSingle()
  if (!profil) return null
  const { data: annonces } = await db.from('produits')
    .select('id, titre, prix, categorie, marque, ville, images, statut, quantite, vendus')
    .eq('vendeur_id', id).order('created_at', { ascending: false }).limit(60)
  return { profil, annonces: (annonces || []) as (ProduitResume & { vendus?: number | null })[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const d = await charger(id)
  if (!d) return { title: 'Profil introuvable' }
  return { title: nomCourt(d.profil) + ', vendeur à ' + (d.profil.ville || 'Lubumbashi'), description: d.profil.bio || undefined }
}

export default async function ProfilPublic({ params }: Props) {
  const { id } = await params
  const d = await charger(id)
  if (!d) notFound()
  const { profil, annonces } = d
  const enVente = annonces.filter(a => a.statut === 'actif' || a.statut === 'reserve')
  const ventes = annonces.reduce((t, a) => t + (a.vendus || 0) + (a.statut === 'vendu' && !a.vendus ? 1 : 0), 0)
  const numero = numeroWhatsApp(profil.telephone)
  const depuis = profil.created_at ? new Date(profil.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '24px 16px 96px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <section className="carte" style={{ padding: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 24 }}>
            <Avatar url={profil.avatar_url} nom={profil.prenom} taille={96} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>{nomCourt(profil)}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icone nom="lieu" taille={16} /> {profil.ville || 'Lubumbashi'}{depuis ? ', membre depuis ' + depuis : ''}
              </p>
              <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
                <div><p style={{ fontSize: 22, fontWeight: 800 }}>{enVente.length}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>en vente</p></div>
                <div><p style={{ fontSize: 22, fontWeight: 800 }}>{ventes}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>vendu{ventes > 1 ? 's' : ''}</p></div>
              </div>
              {profil.bio && <p style={{ fontSize: 15, color: 'var(--text)', marginTop: 16, lineHeight: 1.65, maxWidth: 620, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{profil.bio}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
              <a href={'/messages/' + profil.id} className="bouton bouton-principal"><Icone nom="message" taille={18} /> Envoyer un message</a>
              {numero && <a href={'https://wa.me/' + numero} target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp"><Icone nom="whatsapp" taille={18} /> WhatsApp</a>}
            </div>
          </section>

          <h2 className="titre-section" style={{ fontSize: 19, marginBottom: 14 }}>Ses annonces ({enVente.length})</h2>
          {enVente.length === 0 ? (
            <div className="carte" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
              {profil.prenom || 'Ce membre'} n’a pas d’annonce en vente pour le moment.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
              {enVente.map(a => <CarteProduit key={a.id} p={a} />)}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
