import type { Metadata } from 'next'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import CarteProduit, { type ProduitResume } from '@/components/CarteProduit'
import { clientServeur } from '@/lib/serveur'
import { CATEGORIES, PHOTO_ACCUEIL, PHOTOS_ETAPES, photo } from '@/lib/catalogue'

export const metadata: Metadata = {
  title: 'Accueil · Achète et vends à Lubumbashi',
  description: 'Publie ton article en 2 minutes avec tes photos. Les acheteurs de Lubumbashi te contactent directement sur WhatsApp.',
}

// Les nouvelles annonces apparaissent immédiatement
export const dynamic = 'force-dynamic'

const faqItems = [
  { q: 'Comment vendre sur DEALER ?', r: 'Crée ton compte gratuit, touche « Vendre », ajoute les photos de ton article, son prix et ton numéro WhatsApp, puis publie. Ça prend 2 minutes.' },
  { q: 'Est-ce que DEALER est gratuit ?', r: 'Oui. Créer un compte et publier une annonce sont gratuits.' },
  { q: 'Comment contacter un vendeur ?', r: 'Ouvre l’annonce et touche « Contacter sur WhatsApp » : un message est préparé avec le lien de l’annonce.' },
  { q: 'Comment acheter sans risque ?', r: 'Rencontre le vendeur dans un lieu public, vérifie l’article avant de payer et ne paie jamais à l’avance.' },
  { q: 'Qui voit mon numéro ?', r: 'Ton numéro WhatsApp est affiché sur tes annonces pour que les acheteurs puissent t’écrire. Tu peux le changer à tout moment dans « Mon compte ».' },
]

async function getProduits(): Promise<ProduitResume[]> {
  const { data } = await clientServeur()
    .from('produits')
    .select('id, titre, prix, categorie, marque, ville, images, statut')
    .eq('statut', 'actif')
    .order('created_at', { ascending: false })
    .limit(12)
  return (data as ProduitResume[]) || []
}

export default async function Home() {
  const produits = await getProduits()

  return (
    <>
      <Header />
      <main>

        {/* ACCUEIL : vraie photo de Lubumbashi */}
        <section style={{ position: 'relative', minHeight: 440, display: 'flex', alignItems: 'center', background: '#06262b', overflow: 'hidden' }}>
          <img src={photo(PHOTO_ACCUEIL.id, 1800)} alt="Une rue de Lubumbashi" fetchPriority="high"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,30,36,0.92) 0%, rgba(0,39,48,0.72) 55%, rgba(0,39,48,0.35) 100%)' }} />
          <div className="container" style={{ position: 'relative', padding: '56px 0', color: 'white' }}>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#7FD6DD', marginBottom: 14 }}>La marketplace de Lubumbashi</p>
            <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 16, maxWidth: 620 }}>Achète et vends<br />près de chez toi</h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 520, color: 'rgba(255,255,255,0.88)', marginBottom: 30 }}>
              Publie ton article en 2 minutes avec tes photos. Les acheteurs t’écrivent directement sur WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/sell" style={{ background: 'white', color: 'var(--primary)', padding: '14px 28px', borderRadius: 24, fontSize: 16, fontWeight: 800 }}>Vendre un article</a>
              <a href="#annonces" style={{ border: '1.5px solid rgba(255,255,255,0.7)', color: 'white', padding: '13px 26px', borderRadius: 24, fontSize: 15, fontWeight: 600 }}>Voir les annonces</a>
            </div>
          </div>
          <p style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{PHOTO_ACCUEIL.credit}</p>
        </section>

        {/* POINTS FORTS */}
        <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { icon: '🎁', titre: 'Gratuit', texte: 'Compte et annonces sans frais' },
              { icon: '⏱️', titre: 'Annonce en 2 minutes', texte: 'Photos, prix, c’est en ligne' },
              { icon: '💬', titre: 'Contact direct', texte: 'Les acheteurs t’écrivent sur WhatsApp' },
              { icon: '📍', titre: 'Près de chez toi', texte: 'Lubumbashi et environs' },
            ].map(item => (
              <div key={item.titre} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 12px' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>{item.titre}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.texte}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES EN PHOTOS */}
        <section style={{ padding: '36px 0' }}>
          <div className="container">
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Explorer par catégorie</h2>
            <div className="grille-categories">
              {CATEGORIES.filter(cat => cat.slug !== 'autre').map(cat => (
                <a key={cat.slug} href={'/category/' + cat.slug} className="cat-photo"
                  style={{ position: 'relative', display: 'block', borderRadius: 12, overflow: 'hidden', background: '#0b2a30' }}>
                  <img src={photo(cat.photo, 600, 400)} alt={cat.label} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)' }} />
                  <span style={{ position: 'absolute', left: 12, bottom: 10, color: 'white', fontWeight: 700, fontSize: 16 }}>{cat.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ANNONCES REELLES */}
        <section id="annonces" style={{ padding: '0 0 44px' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Dernières annonces</h2>
              {produits.length > 0 && <a href="/search" style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Tout voir →</a>}
            </div>

            {produits.length === 0 ? (
              <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', overflow: 'hidden' }}>
                <img src={photo(PHOTOS_ETAPES.photographier, 800, 500)} alt="Une personne photographie un article avec son téléphone" style={{ width: '100%', height: '100%', minHeight: 200, objectFit: 'cover' }} />
                <div style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Les premières annonces arrivent</p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>Tu as un article à vendre ? Prends-le en photo et publie-le : il apparaîtra ici tout de suite.</p>
                  <a href="/sell" style={{ alignSelf: 'flex-start', background: 'var(--primary)', color: 'white', padding: '13px 26px', borderRadius: 24, fontSize: 15, fontWeight: 700 }}>Publier une annonce</a>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
                {produits.map(p => <CarteProduit key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </section>

        {/* COMMENT CA MARCHE */}
        <section style={{ background: 'var(--primary-light)', padding: '48px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Comment ça marche</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 28 }}>Vendre un article en trois étapes</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[
                { n: '1', titre: 'Prends tes photos', texte: 'Photographie ton article à la lumière du jour, sous plusieurs angles.', img: PHOTOS_ETAPES.photographier, alt: 'Photo d’un article prise avec un téléphone' },
                { n: '2', titre: 'Publie ton annonce', texte: 'Ajoute un titre, le prix et ton numéro WhatsApp. C’est en ligne immédiatement.', img: PHOTOS_ETAPES.publier, alt: 'Une femme publie une annonce sur son téléphone' },
                { n: '3', titre: 'Vends près de chez toi', texte: 'Les acheteurs t’écrivent sur WhatsApp. Vous vous retrouvez pour l’échange.', img: PHOTOS_ETAPES.vendre, alt: 'Un marché animé avec des vendeurs et des acheteurs' },
              ].map(e => (
                <div key={e.n} className="card" style={{ overflow: 'hidden' }}>
                  <img src={photo(e.img, 700, 420)} alt={e.alt} loading="lazy" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>Étape {e.n}</p>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{e.titre}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{e.texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: 'var(--surface)', padding: '48px 16px', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 28 }}>Questions fréquentes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqItems.map(item => (
                <details key={item.q} className="card" style={{ overflow: 'hidden' }}>
                  <summary style={{ padding: '16px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, userSelect: 'none' }}>
                    {item.q}
                    <span style={{ color: 'var(--primary)', fontSize: 20, flexShrink: 0 }}>+</span>
                  </summary>
                  <p style={{ padding: '12px 20px 16px', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>{item.r}</p>
                </details>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <a href="/faq" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>Voir toutes les questions →</a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'var(--primary)', padding: '56px 16px', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 12 }}>Tu as quelque chose à vendre ?</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 30, fontSize: 16 }}>Crée ton compte gratuit et publie ta première annonce aujourd’hui.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/auth?mode=inscription&next=/sell" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, padding: '14px 32px', borderRadius: 24, fontSize: 15 }}>Créer mon compte gratuit</a>
              <a href="/faq" style={{ border: '2px solid rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, padding: '14px 32px', borderRadius: 24, fontSize: 15 }}>En savoir plus</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#001820', color: 'rgba(255,255,255,0.6)', padding: '48px 16px 24px' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 40 }}>
              <div>
                <p style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>DEALER</p>
                <p style={{ fontSize: 13, lineHeight: 1.7 }}>Acheter et vendre entre particuliers à Lubumbashi.</p>
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Navigation</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['/', 'Accueil'], ['/sell', 'Vendre'], ['/search', 'Rechercher'], ['/account', 'Mon compte']].map(([h, l]) => (
                    <a key={h} href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Informations</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['/faq', 'FAQ'], ['/confidentialite', 'Confidentialité'], ['/rgpd', 'RGPD']].map(([h, l]) => (
                    <a key={h} href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Contact</p>
                <p style={{ fontSize: 13 }}>support@dealer-luba.com</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Réponse sous 24h · Lubumbashi, RDC</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 12 }}>© 2026 DEALER. Tous droits réservés.</p>
              <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                <a href="/confidentialite" style={{ color: 'rgba(255,255,255,0.5)' }}>Confidentialité</a>
                <a href="/rgpd" style={{ color: 'rgba(255,255,255,0.5)' }}>RGPD</a>
                <a href="/faq" style={{ color: 'rgba(255,255,255,0.5)' }}>FAQ</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
      <BottomNav />
    </>
  )
}
