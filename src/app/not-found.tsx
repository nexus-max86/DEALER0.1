import Header from '@/components/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <p style={{ fontSize: 72, marginBottom: 16 }}>🔍</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Page introuvable</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>La page que tu cherches n existe pas ou a ete deplacee.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 700 }}>Retour a l accueil</a>
            <a href="/faq" style={{ border: '1.5px solid var(--border)', color: 'var(--text)', padding: '12px 24px', borderRadius: 8, fontWeight: 600 }}>Voir la FAQ</a>
          </div>
        </div>
      </main>
    </>
  )
}
