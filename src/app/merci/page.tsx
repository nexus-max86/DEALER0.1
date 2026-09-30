import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Merci !',
  description: 'Votre message a bien été reçu. Réponse sous 24 heures.',
}

export default function Merci() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 80, height: 80, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✅</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Merci !</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Ton annonce a bien été publiée. Elle est maintenant visible par tous les acheteurs de Lubumbashi.</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32 }}>Tu recevras des messages d'acheteurs intéressés directement.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/sell" style={{ background: 'var(--primary)', color: 'white', padding: '13px 24px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Publier une autre annonce</a>
            <a href="/" style={{ border: '1.5px solid var(--border)', color: 'var(--text)', padding: '13px 24px', borderRadius: 8, fontWeight: 600, display: 'inline-block' }}>Retour à l'accueil</a>
          </div>
        </div>
      </main>
    </>
  )
}
