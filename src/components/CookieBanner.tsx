'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    try { if (!localStorage.getItem('dealer-cookies')) setVisible(true) } catch { /* stockage indisponible */ }
  }, [])
  if (!visible) return null

  function choisir(choix: 'accepted' | 'refused') {
    try { localStorage.setItem('dealer-cookies', choix) } catch { /* stockage indisponible */ }
    setVisible(false)
  }

  return (
    <div role="dialog" aria-label="Cookies" className="cookie-banner" style={{ position: 'fixed', left: 12, right: 12, zIndex: 200 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', background: '#001820', color: 'white', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', boxShadow: '0 6px 24px rgba(0,0,0,0.25)' }}>
        <p style={{ fontSize: 13, flex: '1 1 220px', lineHeight: 1.4 }}>
          Nous utilisons des cookies pour améliorer ton expérience.{' '}
          <a href="/confidentialite" style={{ color: '#5DC8D1', textDecoration: 'underline' }}>En savoir plus</a>
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => choisir('refused')}
            style={{ padding: '8px 12px', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, background: 'transparent', color: 'white', fontSize: 13, cursor: 'pointer' }}>Refuser</button>
          <button onClick={() => choisir('accepted')}
            style={{ padding: '8px 14px', border: 'none', borderRadius: 8, background: 'var(--primary)', color: 'white', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Accepter</button>
        </div>
      </div>
    </div>
  )
}
