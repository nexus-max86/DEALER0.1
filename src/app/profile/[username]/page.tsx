import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'

const produits = [
  { id: 1, title: 'Air Jordan 1 Retro', price: '85$', brand: 'Jordan', size: '42', condition: 'Tres bon etat', city: 'Lubumbashi', icon: '👟' },
  { id: 2, title: 'Nike Air Max 90', price: '75$', brand: 'Nike', size: '43', condition: 'Bon etat', city: 'Lubumbashi', icon: '👟' },
  { id: 3, title: 'Samsung Galaxy A54', price: '280$', brand: 'Samsung', condition: 'Tres bon etat', city: 'Lubumbashi', icon: '📱' },
  { id: 4, title: 'Sac a main cuir', price: '40$', brand: 'H&M', condition: 'Neuf', city: 'Lubumbashi', icon: '👜', status: 'SOLD' },
  { id: 5, title: 'Veste jean slim', price: '35$', brand: 'Levis', size: 'L', condition: 'Bon etat', city: 'Lubumbashi', icon: '👕' },
  { id: 6, title: 'iPhone 13 128Go', price: '450$', brand: 'Apple', condition: 'Bon etat', city: 'Lubumbashi', icon: '📱' },
]

const avis = [
  { nom: 'Marie K.', note: 5, texte: 'Vendeur tres serieux, produit conforme. Je recommande !', date: 'Il y a 3 jours', avatar: 'M' },
  { nom: 'Jean-Pierre M.', note: 5, texte: 'Excellent echange, iPhone en parfait etat.', date: 'Il y a 1 semaine', avatar: 'J' },
  { nom: 'Amina B.', note: 4, texte: 'Bon produit, communication rapide.', date: 'Il y a 2 semaines', avatar: 'A' },
]

export default function Profil() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', height: 140, position: 'relative' }}>
          <div className="container" style={{ height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: -36, left: 0, width: 80, height: 80, background: 'var(--white)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--primary)', border: '4px solid var(--white)', boxShadow: '0 4px 16px rgba(0,39,48,0.15)' }}>D</div>
          </div>
        </div>
        <div className="container" style={{ padding: '48px 0 48px' }}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>David K.</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>📍 Lubumbashi · Membre depuis juin 2026</p>
                <div style={{ display: 'flex', gap: 28, marginTop: 16 }}>
                  {[['23', 'Ventes'], ['4.8★', 'Note'], ['6', 'Annonces']].map(([n, l]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 22, fontWeight: 800 }}>{n}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 14, maxWidth: 500, lineHeight: 1.7 }}>Vendeur serieux a Lubumbashi. Sneakers, telephones et accessoires. Livraison possible.</p>
              </div>
              <a href="/messages/david" style={{ background: 'var(--primary)', color: 'white', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, alignSelf: 'flex-start' }}>💬 Contacter</a>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}>✓ Identite verifiee</span>
              <span style={{ fontSize: 12, background: '#DBEAFE', color: '#1E40AF', padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}>⚡ Repond vite</span>
              <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}>🏆 Top vendeur</span>
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Annonces ({produits.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {produits.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Avis ({avis.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {avis.map((a, i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>{a.avatar}</div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{a.nom}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.date}</span>
                  </div>
                  <p style={{ color: '#F59E0B', fontSize: 14 }}>{'★'.repeat(a.note)}</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>{a.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
