'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin() {
  const [stats, setStats] = useState({ users: 0, annonces: 0, actives: 0, vendues: 0, messages: 0 })
  const [annonces, setAnnonces] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [onglet, setOnglet] = useState<'dashboard' | 'annonces' | 'users'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [
      { count: nbUsers },
      { count: nbAnnonces },
      { count: nbActives },
      { count: nbVendues },
      { count: nbMessages },
      { data: dernieresAnnonces },
      { data: derniersUsers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('produits').select('*', { count: 'exact', head: true }),
      supabase.from('produits').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
      supabase.from('produits').select('*', { count: 'exact', head: true }).eq('statut', 'vendu'),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('produits').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    setStats({ users: nbUsers||0, annonces: nbAnnonces||0, actives: nbActives||0, vendues: nbVendues||0, messages: nbMessages||0 })
    setAnnonces(dernieresAnnonces || [])
    setUsers(derniersUsers || [])
    setLoading(false)
  }

  async function supprimerAnnonce(id: string) {
    if (!confirm('Supprimer cette annonce définitivement ?')) return
    await supabase.from('produits').delete().eq('id', id)
    setAnnonces(prev => prev.filter(a => a.id !== id))
  }

  async function toggleStatut(id: string, statut: string) {
    const newStatut = statut === 'actif' ? 'suspendu' : 'actif'
    await supabase.from('produits').update({ statut: newStatut }).eq('id', id)
    setAnnonces(prev => prev.map(a => a.id === id ? { ...a, statut: newStatut } : a))
  }

  function deconnexion() {
    document.cookie = 'admin-key=; max-age=0; path=/'
    window.location.href = '/admin/login'
  }

  const annoncesFiltrees = annonces.filter(a =>
    (a.titre||'').toLowerCase().includes(search.toLowerCase()) ||
    (a.ville||'').toLowerCase().includes(search.toLowerCase()) ||
    (a.categorie||'').toLowerCase().includes(search.toLowerCase())
  )

  const usersFiltres = users.filter(u =>
    ((u.prenom||'') + ' ' + (u.nom||'')).toLowerCase().includes(search.toLowerCase()) ||
    (u.ville||'').toLowerCase().includes(search.toLowerCase())
  )

  const statCards = [
    { label: 'Utilisateurs inscrits', value: stats.users, icon: '👥', color: '#3B82F6' },
    { label: 'Annonces totales', value: stats.annonces, icon: '📦', color: '#8B5CF6' },
    { label: 'Annonces actives', value: stats.actives, icon: '✅', color: '#10B981' },
    { label: 'Articles vendus', value: stats.vendues, icon: '🏆', color: '#F59E0B' },
    { label: 'Messages échangés', value: stats.messages, icon: '💬', color: '#007782' },
  ]

  const onglets = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
    { id: 'annonces' as const, label: 'Annonces', icon: '📦' },
    { id: 'users' as const, label: 'Utilisateurs', icon: '👥' },
  ]

  const sideStyle: React.CSSProperties = { width: 220, background: '#001820', color: 'white', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }
  const navBtnStyle = (active: boolean): React.CSSProperties => ({ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: active ? 'rgba(93,200,209,0.15)' : 'transparent', color: active ? '#5DC8D1' : 'rgba(255,255,255,0.6)', fontWeight: active ? 700 : 400, fontSize: 14, cursor: 'pointer', marginBottom: 4, textAlign: 'left' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <aside style={sideStyle}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#5DC8D1' }}>DEALER</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Administration</p>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {onglets.map(o => (
            <button key={o.id} onClick={() => { setOnglet(o.id); setSearch('') }} style={navBtnStyle(onglet === o.id)}>
              <span>{o.icon}</span> {o.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 12 }}>← Voir le site</a>
          <button onClick={deconnexion} style={{ fontSize: 13, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, padding: 32, background: '#F8FAFC', overflow: 'auto' }}>

        {onglet === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#0F172A' }}>Tableau de bord</h1>
            <p style={{ color: '#64748B', marginBottom: 28, fontSize: 14 }}>
              Bonjour 👋 — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {loading ? <p style={{ color: '#64748B' }}>Chargement...</p> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {statCards.map((s, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                      <p style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>{s.value}</p>
                      <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #E2E8F0' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>5 dernières annonces</h2>
                  {annonces.slice(0, 5).map((a: any) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ width: 40, height: 40, background: '#F1F5F9', borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {a.images?.[0] ? <img src={a.images[0]} alt={a.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>📦</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titre}</p>
                        <p style={{ fontSize: 12, color: '#64748B' }}>{a.categorie} · {a.ville} · {a.prix}$</p>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: a.statut === 'actif' ? '#DCFCE7' : a.statut === 'vendu' ? '#DBEAFE' : '#FEE2E2', color: a.statut === 'actif' ? '#166534' : a.statut === 'vendu' ? '#1E40AF' : '#991B1B' }}>
                        {a.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {onglet === 'annonces' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>Annonces ({annoncesFiltrees.length})</h1>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ padding: '9px 16px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', width: 220 }} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Produit', 'Catégorie', 'Prix', 'Ville', 'Statut', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 11, borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {annoncesFiltrees.map((a: any) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                            {a.images?.[0] ? <img src={a.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                          </div>
                          <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{a.titre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#64748B' }}>{a.categorie}</td>
                      <td style={{ padding: '11px 14px', fontWeight: 600 }}>{a.prix}$</td>
                      <td style={{ padding: '11px 14px', color: '#64748B' }}>{a.ville}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600, background: a.statut === 'actif' ? '#DCFCE7' : a.statut === 'vendu' ? '#DBEAFE' : '#FEE2E2', color: a.statut === 'actif' ? '#166534' : a.statut === 'vendu' ? '#1E40AF' : '#991B1B' }}>
                          {a.statut}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#94A3B8', fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <a href={'/product/' + a.id} target="_blank" style={{ fontSize: 11, color: '#007782', border: '1px solid #007782', padding: '3px 7px', borderRadius: 5, fontWeight: 600, textDecoration: 'none' }}>Voir</a>
                          <button onClick={() => toggleStatut(a.id, a.statut)} style={{ fontSize: 11, color: '#D97706', border: '1px solid #FCD34D', padding: '3px 7px', borderRadius: 5, fontWeight: 600, background: 'none', cursor: 'pointer' }}>
                            {a.statut === 'actif' ? 'Suspendre' : 'Réactiver'}
                          </button>
                          <button onClick={() => supprimerAnnonce(a.id)} style={{ fontSize: 11, color: '#DC2626', border: '1px solid #FCA5A5', padding: '3px 7px', borderRadius: 5, fontWeight: 600, background: 'none', cursor: 'pointer' }}>Suppr.</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {annoncesFiltrees.length === 0 && <p style={{ textAlign: 'center', padding: 32, color: '#64748B' }}>Aucune annonce</p>}
            </div>
          </div>
        )}

        {onglet === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>Utilisateurs ({usersFiltres.length})</h1>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ padding: '9px 16px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', width: 220 }} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Utilisateur', 'Ville', 'Téléphone', 'Note', 'Ventes', 'Inscrit le'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 11, borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersFiltres.map((u: any) => {
                    const nom = ((u.prenom||'') + ' ' + (u.nom||'')).trim() || 'Sans nom'
                    const initiale = nom[0]?.toUpperCase() || '?'
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, background: '#E0F5F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007782', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initiale}</div>
                            <span style={{ fontWeight: 500 }}>{nom}</span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px', color: '#64748B' }}>{u.ville||'—'}</td>
                        <td style={{ padding: '11px 14px', color: '#64748B' }}>{u.telephone||'—'}</td>
                        <td style={{ padding: '11px 14px' }}>{u.note ? '⭐ '+u.note : '—'}</td>
                        <td style={{ padding: '11px 14px' }}>{u.nb_ventes||0}</td>
                        <td style={{ padding: '11px 14px', color: '#94A3B8', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {usersFiltres.length === 0 && <p style={{ textAlign: 'center', padding: 32, color: '#64748B' }}>Aucun utilisateur</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
