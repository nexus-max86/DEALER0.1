'use client'
import { useState } from 'react'

export default function AdminLogin() {
  const [key, setKey] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    if (res.ok) {
      window.location.href = '/admin'
    } else {
      setErreur('Clé incorrecte. Accès refusé.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#001820', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>🔐</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Admin DEALER</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Accès réservé à Nicolas et David</p>
        </div>
        {erreur && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{erreur}</div>}
        <form onSubmit={login}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Clé d&apos;accès admin</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#007782', color: 'white', fontWeight: 700, padding: '13px 0', borderRadius: 8, fontSize: 15, border: 'none', cursor: 'pointer', width: '100%' }}>
            {loading ? 'Connexion...' : 'Accéder au tableau de bord'}
          </button>
        </form>
      </div>
    </main>
  )
}
