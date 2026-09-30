'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

export default function Auth() {
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  async function handleConnexion(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErreur('Email ou mot de passe incorrect.')
    } else {
      setMessage('Connexion réussie ! Redirection...')
      setTimeout(() => window.location.href = '/', 1500)
    }
    setLoading(false)
  }

  async function handleInscription(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setErreur('Erreur : ' + error.message)
    } else if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        prenom,
        nom,
        telephone,
        ville: 'Lubumbashi',
      })
      setMessage('Compte créé ! Vérifie ton email pour confirmer.')
    }
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{mode === 'connexion' ? 'Content de te revoir 👋' : 'Rejoins DEALER 🚀'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{mode === 'connexion' ? 'Connecte-toi pour accéder à ton compte' : 'Crée ton compte gratuitement'}</p>
          </div>
          <div style={{ display: 'flex', background: 'var(--border)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {(['connexion', 'inscription'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErreur(''); setMessage('') }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: mode === m ? 'var(--white)' : 'transparent', color: mode === m ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {m === 'connexion' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>
          {message && <div style={{ background: '#DCFCE7', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>✅ {message}</div>}
          {erreur && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>❌ {erreur}</div>}
          <div className="card" style={{ padding: 32 }}>
            <form onSubmit={mode === 'connexion' ? handleConnexion : handleInscription}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mode === 'inscription' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prénom</label><input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Nicolas" required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nom</label><input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                  </div>
                )}
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                {mode === 'inscription' && <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Téléphone</label><input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+243 000 000 000" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>}
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} /></div>
                <button type="submit" disabled={loading} style={{ background: loading ? 'var(--border)' : 'var(--primary)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 8, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
                  {loading ? 'Chargement...' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
