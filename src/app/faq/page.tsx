import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'FAQ - Questions frequentes',
  description: 'Toutes vos questions sur DEALER. Reponse garantie sous 24h.',
}

const faqs = [
  { q: 'Comment creer un compte ?', r: 'Cliquez sur Connexion puis Inscription. Nom, email, mot de passe. Gratuit et instantane.' },
  { q: 'Comment publier une annonce ?', r: 'Apres connexion, cliquez sur Vendre. 4 etapes : photos, categorie, details, prix.' },
  { q: 'Est-ce que DEALER est gratuit ?', r: 'Oui, publier est 100% gratuit. Des options premium arrivent bientot.' },
  { q: 'Comment contacter un vendeur ?', r: 'Sur la page produit, cliquez Contacter ou Faire une offre.' },
  { q: 'DEALER gere-t-il la livraison ?', r: 'DEALER met en relation. La livraison est organisee entre acheteur et vendeur.' },
  { q: 'Comment signaler une annonce ?', r: 'Bouton Signaler sur chaque annonce. Notre equipe traite sous 24h.' },
  { q: 'Mes donnees sont-elles securisees ?', r: 'Oui. Chiffrement complet, pas de vente de donnees. Voir politique de confidentialite.' },
  { q: 'Comment supprimer mon compte ?', r: 'Contactez support@dealer-luba.com. Traitement sous 72h.' },
]

export default function FAQ() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 13, color: 'var(--primary)', display: 'inline-block', marginBottom: 24 }}>← Retour</a>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Questions frequentes</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Reponse garantie sous 24h si vous ne trouvez pas.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((item, i) => (
              <details key={i} className="card" style={{ overflow: 'hidden' }}>
                <summary style={{ padding: '18px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                  {item.q}
                  <span style={{ color: 'var(--primary)', fontSize: 22, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ padding: '12px 20px 18px', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>{item.r}</p>
              </details>
            ))}
          </div>
          <div className="card" style={{ padding: 24, marginTop: 32, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Vous n avez pas trouve votre reponse ?</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Notre equipe repond sous 24 heures.</p>
            <a href="mailto:support@dealer-luba.com" style={{ background: 'var(--primary)', color: 'white', padding: '11px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, display: 'inline-block' }}>Nous contacter</a>
          </div>
        </div>
      </main>
    </>
  )
}
