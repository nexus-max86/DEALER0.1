'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

export default function LaissezAvis({ params }: { params: { vendeurId: string } }) {
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [vendeur, setVendeur] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', params.vendeurId).single()
      .then(({ data }) => setVendeur(data))
  }, [params.vendeurId])

  async function envoyer() {
    if (note === 0) { setErreur('Choisissez une note'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }

    const { error } = await supabase.from('avis').insert({
      auteur_id: user.id,
      vendeur_id: params.vendeurId,
      note,
      commentaire,
    })

    if (error) {
      setErreur("Erreur lors de l'envoi. Réessaie.")
    } else {
      // Mettre à jour la note moyenne du vendeur
      const { data: tousAvis } = await supabase.from('avis').select('note').eq('vendeur_id', params.vendeurId)
      if (tousAvis && tousAvis.length > 0) {
        const moyenne = tousAvis.reduce((s: number, a: any) => s + a.note, 0) / tousAvis.length
        await supabase.from('profiles').update({ note: Math.round(moyenne * 10) / 10, nb_ventes: tousAvis.length }).eq('id', params.vendeurId)
      }
      setDone(true)
    }
    setLoading(false)
  }

  const nom = vendeur ? (vendeur.prenom || '') + ' ' + (vendeur.nom || '') : 'ce vendeur'

  if (done) {
    return (
      <>
        <Header />
        <main style={{ background: 'var(--surface)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 56, marginBottom: 16 }}>⭐</p>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Merci pour votre avis !</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Votre avis aide la communauté DEALER.</p>
            <a href="/" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Retour à l'accueil</a>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Laisser un avis</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Comment s'est passé votre échange avec {nom.trim()} ?</p>

          {erreur && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{erreur}</div>}

          <div className="card" style={{ padding: 28 }}>
            {/* ÉTOILES */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 12 }}>Note *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setNote(n)}
                    style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', opacity: n <= note ? 1 : 0.3, transition: 'opacity 0.15s', padding: 4 }}>
                    ⭐
                  </button>
                ))}
              </div>
              {note > 0 && (
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 8 }}>
                  {['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent !'][note]}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Commentaire</label>
              <textarea
                rows={4}
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                placeholder="Décrivez votre expérience : rapidité, qualité du produit, communication..."
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button onClick={envoyer} disabled={loading || note === 0}
              style={{ background: loading || note === 0 ? 'var(--border)' : 'var(--primary)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 8, fontSize: 15, border: 'none', cursor: loading || note === 0 ? 'not-allowed' : 'pointer', width: '100%' }}>
              {loading ? 'Envoi...' : 'Publier mon avis'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
