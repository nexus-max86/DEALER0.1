'use client'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function PageProduit() {
  const similaires = [
    { id: 6, title: 'Nike Air Max 90', price: '75$', brand: 'Nike', icon: '👟' },
    { id: 3, title: 'Adidas Stan Smith', price: '55$', brand: 'Adidas', icon: '👟' },
    { id: 4, title: 'Puma Suede Classic', price: '45$', brand: 'Puma', icon: '👟' },
    { id: 5, title: 'New Balance 574', price: '60$', brand: 'New Balance', icon: '👟' },
  ]

  return (
    <>
      <Header />
      <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
        <div className="container" style={{ padding: '24px 16px' }}>

          <nav style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/" style={{ color: 'var(--primary)' }}>Accueil</a>
            <span>›</span>
            <a href="/category/chaussures" style={{ color: 'var(--primary)' }}>Chaussures</a>
            <span>›</span>
            <span>Air Jordan 1</span>
          </nav>

          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

            {/* GALERIE */}
            <div>
              <div style={{ background: 'var(--surface)', borderRadius: 12, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', marginBottom: 12, position: 'relative' }}>
                <span style={{ fontSize: 120 }} role="img" aria-label="Air Jordan 1">👟</span>
                <button
                  onClick={() => {}}
                  style={{ position: 'absolute', top: 16, right: 16, background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: 18 }}
                >🤍</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: 'var(--surface)', borderRadius: 8, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 24 }}>👟</div>
                ))}
              </div>
            </div>

            {/* DETAILS */}
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>Chaussures</span>
                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>Tres bon etat</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>Air Jordan 1 Retro High OG</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Jordan · Taille 42 · Noir/Rouge</p>
              <p style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>85$</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>📍 Lubumbashi · Publie il y a 2 heures</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                <a href="/checkout" style={{ background: 'var(--primary)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 8, fontSize: 15, textAlign: 'center', display: 'block' }}>Acheter maintenant</a>
                <a href="/messages/1" style={{ background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)', fontWeight: 700, padding: '13px 0', borderRadius: 8, fontSize: 15, textAlign: 'center', display: 'block' }}>💬 Contacter le vendeur</a>
                <button onClick={() => alert('Bientot disponible')} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '13px 0', fontSize: 15, cursor: 'pointer', fontWeight: 600, width: '100%' }}>Faire une offre</button>
              </div>

              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['Marque', 'Jordan'], ['Taille', '42 EU'], ['Couleur', 'Noir/Rouge'], ['Etat', 'Tres bon etat'], ['Livraison', 'Disponible'], ['Ville', 'Lubumbashi']].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{k}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Description</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Air Jordan 1 Retro High OG en excellent etat, portees 3 fois. Taille 42 EU, coloris Chicago. Boite originale incluse avec les deux lacets.</p>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--primary-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>D</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>David K.</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>★ 4.8 · 23 ventes · Membre 2026</p>
                  </div>
                  <a href="/profile/david" style={{ fontSize: 13, color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '7px 14px', borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap' }}>Voir profil</a>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>✓ Verifie</span>
                  <span style={{ fontSize: 12, background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>⚡ Repond vite</span>
                  <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>🏆 Top vendeur</span>
                </div>
              </div>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button onClick={() => alert('Signalement envoye')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Signaler cette annonce</button>
              </div>
            </div>
          </div>

          {/* SIMILAIRES */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Articles similaires</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {similaires.map(p => (
                <a key={p.id} href={'/product/' + p.id} className="similar-card" style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', color: 'var(--text)', background: 'var(--white)' }}>
                  <div style={{ background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40 }}>{p.icon}</span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.brand}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{p.title}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{p.price}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
