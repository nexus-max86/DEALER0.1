'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function Account() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [annonces, setAnnonces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const icones: Record<string, string> = {
    chaussures: '👟', vetements: '👕', telephones: '📱',
    beaute: '💄', electronique: '💻', automobile: '🚗',
    maison: '🏠', sport: '⚽', autre: '📦',
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) { setProfil(p); setPrenom(p.prenom || ''); setNom(p.nom || ''); setTelephone(p.telephone || ''); setBio(p.bio || '') }
      const { data: a } = await supabase.from('produits').select('*').eq('vendeur_id', user.id).order('created_at', { ascending: false })
      setAnnonces(a || [])
      setLoading(false)
    }
    load()
  }, [])

  async function sauvegarder() {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, prenom, nom, telephone, bio, ville: 'Lubumbashi' })
    setMessage('Profil mis à jour !')
    setEditing(false)
    setProfil({ ...profil, prenom, nom, telephone, bio })
    setTimeout(() => setMessage(''), 3000)
    setSaving(false)
  }

  async function deconnecter() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function supprimerAnnonce(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return
    await supabase.from('produits').delete().eq('id', id)
    setAnnonces(annonces.filter(a => a.id !== id))
  }

  async function marquerVendu(id: string, statut: string) {
    const newStatut = statut === 'vendu' ? 'actif' : 'vendu'
    await supabase.from('produits').update({ statut: newStatut }).eq('id', id)
    setAnnonces(annonces.map(a => a.id === id ? { ...a, statut: newStatut } : a))
  }

  const nomComplet = profil ? (profil.prenom || '') + ' ' + (profil.nom || '') : 'Mon compte'
  const initiale = nomComplet.trim()[0]?.toUpperCase() || '?'
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' } as React.CSSProperties

  if (loading) return <><Header /><main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><p style={{ color: 'var(--text-secondary)' }}>Chargement...</p></main></>

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {message && <div style={{ background: '#DCFCE7', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>✅ {message}</div>}

          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, background: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 28, flexShrink: 0 }}>{initiale}</div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>{nomComplet.trim() || 'Mon compte'}</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {profil?.ville || 'Lubumbashi'}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => setEditing(!editing)} style={{ background: editing ? 'var(--surface)' : 'var(--primary)', color: editing ? 'var(--text)' : 'white', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  {editing ? 'Annuler' : 'Modifier'}
                </button>
                <button onClick={deconnecter} style={{ background: 'none', color: '#DC2626', border: '1.5px solid #FCA5A5', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Déconnexion
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: editing ? '1px solid var(--border)' : 'none', marginBottom: editing ? 20 : 0 }}>
              <div style={{ textAlign: 'center' }}><p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{annonces.length}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Annonces</p></div>
              <div style={{ textAlign: 'center' }}><p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{annonces.filter(a => a.statut === 'vendu').length}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ventes</p></div>
              <div style={{ textAlign: 'center' }}><p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{profil?.note || '—'}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Note</p></div>
            </div>

            {editing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prénom</label><input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nom</label><input type="text" value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} /></div>
                </div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Téléphone</label><input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+243 000 000 000" style={inputStyle} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Bio</label><textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Parlez-vous en quelques mots..." style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} /></div>
                <button onClick={sauvegarder} disabled={saving} style={{ background: 'var(--primary)', color: 'white', fontWeight: 700, padding: '13px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 15 }}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Mes annonces ({annonces.length})</h2>
            <a href="/sell" style={{ background: 'var(--primary)', color: 'white', padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>+ Nouvelle</a>
          </div>

          {annonces.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Aucune annonce</p>
              <a href="/sell" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Publier une annonce</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {annonces.map((a: any) => (
                <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', opacity: a.statut === 'vendu' ? 0.7 : 1 }}>
                  <div style={{ width: 56, height: 56, background: 'var(--surface)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {a.images?.[0] ? <img src={a.images[0]} alt={a.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>{icones[a.categorie] || '📦'}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titre}</p>
                      {a.statut === 'vendu' && <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>VENDU</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{a.categorie} · {a.ville}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>{a.prix}$</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <a href={'/product/' + a.id} style={{ fontSize: 12, color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '5px 10px', borderRadius: 6, fontWeight: 600, textAlign: 'center' }}>Voir</a>
                    <button onClick={() => marquerVendu(a.id, a.statut)} style={{ fontSize: 12, color: a.statut === 'vendu' ? 'var(--text-secondary)' : '#166534', border: '1.5px solid', borderColor: a.statut === 'vendu' ? 'var(--border)' : '#86EFAC', padding: '5px 10px', borderRadius: 6, fontWeight: 600, background: 'none', cursor: 'pointer' }}>
                      {a.statut === 'vendu' ? 'Réactiver' : 'Marquer vendu'}
                    </button>
                    <button onClick={() => supprimerAnnonce(a.id)} style={{ fontSize: 12, color: '#DC2626', border: '1.5px solid #FCA5A5', padding: '5px 10px', borderRadius: 6, fontWeight: 600, background: 'none', cursor: 'pointer' }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
