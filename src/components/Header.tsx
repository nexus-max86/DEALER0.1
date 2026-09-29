export default function Header() {
  return (
    <header style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
        <a href="/" style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>DEALER</a>
        <div style={{ flex: 1, maxWidth: 520, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}>🔍</span>
          <input
            type="search"
            placeholder="Rechercher sur DEALER"
            style={{ width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 24, background: 'var(--surface)', border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text)', outline: 'none' }}
          />
        </div>
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a href="/favorites" className="header-link" style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, borderRadius: 8, transition: 'color 0.2s' }}>🤍 Favoris</a>
          <a href="/messages" className="header-link" style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, borderRadius: 8, transition: 'color 0.2s' }}>💬 Messages</a>
          <a href="/auth" className="header-link" style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, borderRadius: 8, transition: 'color 0.2s' }}>Mon compte</a>
          <a href="/sell" className="btn-sell" style={{ background: 'var(--primary)', color: 'white', padding: '9px 18px', borderRadius: 24, fontSize: 14, fontWeight: 700, transition: 'background 0.2s' }}>Vendre</a>
        </nav>
      </div>
    </header>
  )
}
