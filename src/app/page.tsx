import type { Metadata } from 'next'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  title: 'Accueil - Achetez et vendez à Lubumbashi',
  description: 'Découvrez des milliers de produits près de chez vous à Lubumbashi. Vêtements, chaussures, téléphones, beauté et plus.',
}

const categories = [
  { slug: 'vetements', label: 'Vêtements', icon: '👕' },
  { slug: 'chaussures', label: 'Chaussures', icon: '👟' },
  { slug: 'telephones', label: 'Téléphones', icon: '📱' },
  { slug: 'beaute', label: 'Beauté', icon: '💄' },
  { slug: 'electronique', label: 'Électronique', icon: '💻' },
  { slug: 'maison', label: 'Maison', icon: '🏠' },
  { slug: 'automobile', label: 'Automobile', icon: '🚗' },
  { slug: 'sport', label: 'Sport', icon: '⚽' },
]

const produits = [
  { id: 1, title: 'Air Jordan 1 Retro High OG', price: '85$', brand: 'Jordan', size: '42', condition: 'Très bon état', city: 'Lubumbashi', icon: '👟' },
  { id: 2, title: 'iPhone 13 128Go Noir', price: '450$', brand: 'Apple', condition: 'Bon état', city: 'Lubumbashi', icon: '📱' },
  { id: 3, title: 'Robe soirée longue', price: '25$', brand: 'Zara', size: 'M', condition: 'Neuf', city: 'Lubumbashi', icon: '👗' },
  { id: 4, title: 'Samsung Galaxy A54', price: '280$', brand: 'Samsung', condition: 'Très bon état', city: 'Lubumbashi', icon: '📱' },
  { id: 5, title: 'Sac à main cuir marron', price: '40$', brand: 'H&M', condition: 'Neuf', city: 'Lubumbashi', icon: '👜' },
  { id: 6, title: 'Nike Air Max 90 Blanc', price: '75$', brand: 'Nike', size: '43', condition: 'Bon état', city: 'Lubumbashi', icon: '👟' },
  { id: 7, title: 'Crème hydratante visage', price: '12$', brand: 'Nivea', condition: 'Neuf', city: 'Lubumbashi', icon: '💄' },
  { id: 8, title: 'Veste en jean slim fit', price: '35$', brand: 'Levi's', size: 'L', condition: 'Bon état', city: 'Lubumbashi', icon: '👕' },
]

const avis = [
  { nom: 'Marie K.', avatar: 'M', note: 5, texte: 'J'ai trouvé mon vendeur en moins de 5 minutes. Livraison rapide et produit conforme. Je recommande DEALER !', date: 'Il y a 2 jours' },
  { nom: 'Jean-Pierre M.', avatar: 'J', note: 5, texte: 'En tant que vendeur, j'ai vendu mon téléphone en 24h. La plateforme est simple et les acheteurs sont sérieux.', date: 'Il y a 1 semaine' },
  { nom: 'Amina B.', avatar: 'A', note: 5, texte: 'Enfin une marketplace sérieuse à Lubumbashi. Les vendeurs sont vérifiés et le support répond rapidement.', date: 'Il y a 2 semaines' },
]

export default function Home() {
  return (
    <>
      <Header />
      <main>

        <section style={{ background: 'var(--primary-light)', borderBottom: '1px solid var(--border)', padding: '48px 16px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>La marketplace du Katanga</p>
            <h1 style={{ fontSize: 38, fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, marginBottom: 16 }}>Achète et vends<br />à Lubumbashi</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' }}>Des milliers de produits près de chez toi. Vêtements, chaussures, téléphones et bien plus.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/sell" style={{ background: 'var(--primary)', color: 'white', padding: '13px 28px', borderRadius: 24, fontSize: 15, fontWeight: 700 }}>Vendre maintenant</a>
              <a href="/search" style={{ background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '13px 28px', borderRadius: 24, fontSize: 15, fontWeight: 600 }}>Explorer les produits</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 40 }}>
              {[['500+', 'Vendeurs actifs'], ['2 000+', 'Produits'], ['24h', 'Réponse garantie']].map(([n, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{n}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { icon: '⚡', titre: 'Réponse en 24h', texte: 'Support disponible tous les jours' },
              { icon: '✅', titre: 'Vendeurs vérifiés', texte: 'Chaque vendeur est contrôlé' },
              { icon: '🔒', titre: 'Sécurisé', texte: 'Vos données sont protégées' },
              { icon: '📍', titre: '100% local', texte: 'Lubumbashi et environs' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{item.titre}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.texte}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '36px 16px' }}>
          <div className="container">
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Explorer par catégorie</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {categories.map((cat) => (
                <a key={cat.slug} href={'/category/' + cat.slug} className="cat-card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--white)', color: 'var(--text)', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 28 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'center' }}>{cat.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '0 16px 44px' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Nouveaux articles</h2>
              <a href="/search" style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>Voir tout →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {produits.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--primary-light)', padding: '48px 16px', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Comment DEALER aide nos vendeurs</h2>
            <div className="card" style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 64, height: 64, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white', flexShrink: 0 }}>D</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>David K. — Vendeur de sneakers</h3>
                  <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, marginBottom: 12 }}>Lubumbashi, Haut-Katanga</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, fontStyle: 'italic' }}>"Avant DEALER, je vendais via WhatsApp uniquement. Depuis que j'utilise la plateforme, j'ai vendu 23 paires en 3 mois. Ma boutique est visible 24h/24."</p>
                  <div style={{ display: 'flex', gap: 28, marginTop: 20 }}>
                    {[['23', 'Ventes en 3 mois'], ['4.8★', 'Note moyenne'], ['3x', 'Plus de visibilité']].map(([n, l]) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{n}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '48px 16px' }}>
          <div className="container">
            <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Ce que disent nos utilisateurs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {avis.map((a, i) => (
                <div key={i} className="card" style={{ padding: 24 }}>
                  <p style={{ color: '#F59E0B', fontSize: 16, marginBottom: 14 }}>{'★'.repeat(a.note)}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 20 }}>"{a.texte}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{a.avatar}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{a.nom}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--surface)', padding: '48px 16px', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Questions fréquentes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { q: 'Comment vendre sur DEALER ?', r: 'Créez un compte gratuit, cliquez sur Vendre, ajoutez vos photos et publiez. Vos acheteurs vous contactent directement.' },
                { q: 'Est-ce que DEALER est gratuit ?', r: 'Oui, publier une annonce est 100% gratuit.' },
                { q: 'Comment contacter un vendeur ?', r: 'Cliquez sur Contacter sur la page produit. Vous pouvez aussi faire une offre de prix.' },
                { q: 'Mes données sont-elles sécurisées ?', r: 'Oui. Toutes vos données sont chiffrées. Nous ne vendons jamais vos informations.' },
                { q: 'Comment signaler un problème ?', r: 'Notre équipe répond sous 24 heures via support@dealer-luba.com.' },
              ].map((item, i) => (
                <details key={i} className="card" style={{ overflow: 'hidden' }}>
                  <summary style={{ padding: '16px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
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

        <section style={{ background: 'var(--primary)', padding: '56px 16px', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 12 }}>Prêt à commencer ?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: 16 }}>Rejoins des centaines de vendeurs à Lubumbashi.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/auth" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, padding: '14px 32px', borderRadius: 24, fontSize: 15 }}>Créer mon compte gratuitement</a>
              <a href="/faq" style={{ border: '2px solid rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, padding: '14px 32px', borderRadius: 24, fontSize: 15 }}>En savoir plus</a>
            </div>
          </div>
        </section>

        <footer style={{ background: '#001820', color: 'rgba(255,255,255,0.6)', padding: '48px 16px 24px' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 40 }}>
              <div>
                <p style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>DEALER</p>
                <p style={{ fontSize: 13, lineHeight: 1.7 }}>La marketplace de référence à Lubumbashi. Achetez et vendez en toute confiance.</p>
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Navigation</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['/', 'Accueil'], ['/sell', 'Vendre'], ['/auth', 'Mon compte']].map(([h, l]) => (
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
