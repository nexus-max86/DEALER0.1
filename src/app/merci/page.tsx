import type { Metadata } from 'next'
import Header from '@/components/Header'
import { SITE_URL } from '@/lib/catalogue'

export const metadata: Metadata = {
  title: 'Annonce publiée',
  description: 'Ton annonce est en ligne sur DEALER.',
  robots: { index: false },
}

export default async function Merci({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  const valide = id && /^[0-9a-f-]{36}$/i.test(id) ? id : null
  const lien = valide ? SITE_URL + '/product/' + valide : null

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ width: 80, height: 80, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Ton annonce est en ligne !</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Elle est visible dès maintenant par tous les visiteurs de DEALER.</p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Les acheteurs intéressés t’écriront sur WhatsApp. Partage-la pour vendre plus vite.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lien && <a href={'/product/' + valide} style={{ background: 'var(--primary)', color: 'white', padding: '14px 24px', borderRadius: 8, fontWeight: 700 }}>Voir mon annonce</a>}
            {lien && <a href={'https://wa.me/?text=' + encodeURIComponent('Regarde mon annonce sur DEALER : ' + lien)} target="_blank" rel="noopener noreferrer" style={{ background: '#1FA855', color: 'white', padding: '14px 24px', borderRadius: 8, fontWeight: 700 }}>Partager sur WhatsApp</a>}
            <a href="/sell" style={{ border: '1.5px solid var(--border)', color: 'var(--text)', padding: '13px 24px', borderRadius: 8, fontWeight: 600, background: 'white' }}>Publier une autre annonce</a>
            <a href="/account" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginTop: 4 }}>Gérer mes annonces</a>
          </div>
        </div>
      </main>
    </>
  )
}
