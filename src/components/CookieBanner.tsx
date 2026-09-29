'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { if (!localStorage.getItem('dealer-cookies')) setVisible(true) }, [])
  if (!visible) return null
  return (
    <div style={{ position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 200 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#001820', color: 'white', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14 }}>
          Nous utilisons des cookies pour ameliorer votre experience.{' '}
          <a href="/confidentialite" style={{ color: '#5DC8D1', textDecoration: 'underline' }}>En savoir plus</a>
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { localStorage.setItem('dealer-cookies', 'refused'); setVisible(false) }}
            style={{ flex: 1, padding: '9px 0', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, background: 'transparent', color: 'white', fontSize: 14, cursor: 'pointer' }}
          >Refuser</button>
          <button
            onClick={() => { localStorage.setItem('dealer-cookies', 'accepted'); setVisible(false) }}
            style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, background: 'var(--primary)', color: 'white', fontSize: 14, cursor: 'pointer', fontWeight: 700 }}
          >Accepter</button>
        </div>
      </div>
    </div>
  )
}
