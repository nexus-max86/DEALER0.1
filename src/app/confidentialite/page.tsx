import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Politique de confidentialite',
  description: 'Comment DEALER protege vos donnees personnelles.',
}

export default function Confidentialite() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 13, color: 'var(--primary)', display: 'inline-block', marginBottom: 24 }}>← Retour</a>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Politique de confidentialite</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32 }}>Derniere mise a jour : janvier 2026</p>
          <div className="card" style={{ padding: 32 }}>
            {[
              ['1. Responsable', 'DEALER, marketplace basee a Lubumbashi, RDC. Contact : support@dealer-luba.com'],
              ['2. Donnees collectees', 'Nom, prenom, email, telephone, et les annonces publiees. Uniquement le necessaire.'],
              ['3. Finalites', 'Gestion du compte, mise en relation acheteurs/vendeurs, amelioration du service.'],
              ['4. Partage', 'Nous ne vendons jamais vos donnees. Partage limite aux prestataires techniques.'],
              ['5. Vos droits', 'Acces, rectification, effacement, portabilite. Exercez-les via support@dealer-luba.com.'],
              ['6. Cookies', 'Cookies essentiels et analytiques (Google Analytics). Refus possible via notre bandeau.'],
              ['7. Contact', 'support@dealer-luba.com — Reponse sous 24 heures.'],
            ].map(([titre, texte], i) => (
              <div key={i} style={{ borderBottom: i < 6 ? '1px solid var(--border)' : 'none', paddingBottom: i < 6 ? 24 : 0, marginBottom: i < 6 ? 24 : 0 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{titre}</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
