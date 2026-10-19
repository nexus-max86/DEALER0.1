import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'FAQ - Questions fréquentes',
  description: 'Toutes vos questions sur DEALER. Réponse garantie sous 24h.',
}

const faqs = [
  { q: 'Comment créer un compte ?', r: 'Touchez « Mon compte » puis « Je crée mon compte ». Prénom, email et mot de passe (6 caractères minimum) suffisent. C’est gratuit.' },
  { q: 'Comment publier une annonce ?', r: 'Après connexion, touchez « Vendre ». 4 étapes : photos, catégorie, détails, puis prix et quantité. L’annonce est en ligne immédiatement.' },
  { q: 'Est-ce que DEALER est gratuit ?', r: 'Oui, publier est 100% gratuit. Des options premium arrivent bientôt.' },
  { q: 'Comment contacter un vendeur ?', r: 'Sur la page de l’annonce, écrivez votre message et touchez « Envoyer le message ». Le vendeur reçoit une notification et vous répond dans « Messages ». WhatsApp est proposé en option si le vendeur a ajouté son numéro.' },
  { q: 'Comment savoir si un article est toujours disponible ?', r: 'Chaque annonce affiche « Disponible », « Réservé » ou « Vendu », et le stock restant. Ajoutez l’article à vos favoris pour recevoir une alerte quand sa disponibilité change.' },
  { q: 'DEALER gère-t-il la livraison ?', r: 'DEALER met en relation. La livraison est organisée entre acheteur et vendeur.' },
  { q: 'Comment signaler une annonce ?', r: 'Écrivez à support@dealer-luba.com en indiquant le lien de l’annonce.' },
  { q: 'Mes données sont-elles sécurisées ?', r: 'Votre mot de passe est protégé et vos données ne sont pas vendues. Votre numéro WhatsApp est facultatif ; si vous l’ajoutez, il est proposé sur vos annonces. Voir la politique de confidentialité.' },
  { q: 'Comment supprimer mon compte ?', r: 'Contactez support@dealer-luba.com. Traitement sous 72h.' },
]

export default function FAQ() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 13, color: 'var(--primary)', display: 'inline-block', marginBottom: 24 }}>← Retour</a>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Questions fréquentes</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Réponse garantie sous 24h si vous ne trouvez pas.</p>
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
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Vous n'avez pas trouvé votre réponse ?</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Notre équipe répond sous 24 heures.</p>
            <a href="mailto:support@dealer-luba.com" style={{ background: 'var(--primary)', color: 'white', padding: '11px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, display: 'inline-block' }}>Nous contacter</a>
          </div>
        </div>
      </main>
    </>
  )
}
