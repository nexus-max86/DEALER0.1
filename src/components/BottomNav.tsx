export default function BottomNav() {
  return (
    <nav className="mobile-only" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--white)', borderTop: '1px solid var(--border)', display: 'flex', zIndex: 99 }}>
      {[
        { href: '/', icon: '🏠', label: 'Accueil', primary: false },
        { href: '/search', icon: '🔍', label: 'Recherche', primary: false },
        { href: '/sell', icon: '➕', label: 'Vendre', primary: true },
        { href: '/messages', icon: '💬', label: 'Messages', primary: false },
        { href: '/account', icon: '👤', label: 'Profil', primary: false },
      ].map((item) => (
        <a key={item.href} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', gap: 3, color: item.primary ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 10, fontWeight: item.primary ? 700 : 500 }}>
          <span style={{ fontSize: item.primary ? 24 : 20 }}>{item.icon}</span>
          {item.label}
        </a>
      ))}
    </nav>
  )
}
