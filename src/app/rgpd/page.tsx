import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'RGPD - Vos droits',
  description: 'Vos droits sur vos données personnelles sur DEALER.',
}

export default function RGPD() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 13, color: 'var(--primary)', display: 'inline-block', marginBottom: 24 }}>← Retour</a>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Vos droits RGPD</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Conformément au Règlement Général sur la Protection des Données.</p>
          <div className="card" style={{ padding: 32, marginBottom: 20 }}>
            {[
              ["Droit d\u2019accès", 'Demandez une copie de toutes vos données.'],
              ['Droit de rectification', 'Corrigez vos données dans votre profil ou par email.'],
              ["Droit à l\u2019effacement", 'Demandez la suppression complète. Traitement sous 72h.'],
              ['Droit à la portabilité', 'Recevez vos données en format JSON ou CSV.'],
              ["Droit d\u2019opposition", 'Opposez-vous au traitement à des fins commerciales.'],
              ['Droit à la limitation', 'Demandez la limitation dans certains cas prévus par la loi.'],
            ].map(([titre, texte], i) => (
              <div key={i} style={{ display: 'flex', gap: 16, borderBottom: i < 5 ? '1px solid var(--border)' : 'none', paddingBottom: i < 5 ? 24 : 0, marginBottom: i < 5 ? 24 : 0 }}>
                <div style={{ width: 32, height: 32, background: 'var(--primary-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, flexShrink: 0, fontSize: 13 }}>{i+1}</div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{titre}</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{texte}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--primary-light)', border: '1.5px solid var(--primary)', borderRadius: 10, padding: 20 }}>
            <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Exercer vos droits</p>
            <p style={{ fontSize: 14, color: 'var(--primary-dark)' }}>Envoyez votre demande à <a href="mailto:support@dealer-luba.com" style={{ fontWeight: 600 }}>support@dealer-luba.com</a>. Réponse sous 24 heures.</p>
          </div>
        </div>
      </main>
    </>
  )
}