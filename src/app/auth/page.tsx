'use client'
import { useState } from 'react'
import Header from '@/components/Header'

export default function Auth() {
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion')
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{mode === 'connexion' ? 'Content de te revoir 👋' : 'Rejoins DEALER 🚀'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{mode === 'connexion' ? 'Connecte-toi pour acceder a ton compte' : 'Cree ton compte gratuitement'}</p>
          </div>
          <div style={{ display: 'flex', background: 'var(--border)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {(['connexion', 'inscription'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: mode === m ? 'var(--white)' : 'transparent', color: mode === m ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                {m === 'connexion' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>
          <div className="card" style={{ padding: 32 }}>
            <form onSubmit={e => e.preventDefault()}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mode === 'inscription' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prenom</label><input type="text" placeholder="Nicolas" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nom</label><input type="text" placeholder="Dupont" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                  </div>
                )}
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label><input type="email" placeholder="ton@email.com" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                {mode === 'inscription' && <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Telephone</label><input type="tel" placeholder="+243 000 000 000" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>}
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Mot de passe</label><input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                {mode === 'inscription' && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 }}>Je veux :</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[['acheteur', '🛍️ Acheter'], ['vendeur', '🏪 Vendre']].map(([v, l]) => (
                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--border)', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', fontSize: 14 }}>
                          <input type="radio" name="role" defaultChecked={v === 'acheteur'} style={{ accentColor: 'var(--primary)' }} />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {mode === 'connexion' && <div style={{ textAlign: 'right' }}><a href="#" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>Mot de passe oublie ?</a></div>}
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 8, fontSize: 15, border: 'none', cursor: 'pointer', width: '100%' }}>
                  {mode === 'connexion' ? 'Se connecter' : 'Creer mon compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
