import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Merci !',
  description: 'Votre message a bien ete recu. Reponse sous 24 heures.',
}

export default function Merci() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 80, height: 80, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✅</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Merci !</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Ton message a bien ete recu. Notre equipe te repond sous <strong>24 heures</strong>.</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32 }}>Verifie aussi tes spams.</p>
          <a href="/" style={{ background: 'var(--primary)', color: 'white', padding: '13px 28px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Retour a l accueil</a>
        </div>
      </main>
    </>
  )
}
