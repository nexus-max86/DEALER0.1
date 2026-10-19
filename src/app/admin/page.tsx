'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cheminDepuisUrl } from '@/lib/images'
import { STATUTS, statutDe, prixAffiche, categorie, type Statut } from '@/lib/catalogue'
import Icone from '@/components/Icone'
import BadgeStatut from '@/components/BadgeStatut'

// Administration DEALER.
// Double protection : la clé admin (vérifiée par le middleware) ET le compte administrateur
// (vérifié par la base de données : sans lui, aucune modification n'est possible).

type Stats = {
  membres: number; membres_7j: number; non_confirmes: number
  annonces: number; disponibles: number; reservees: number; vendues: number; suspendues: number
  ventes: number; vues: number; messages: number; messages_7j: number
}
type Annonce = {
  id: string; titre: string; prix: number; images: string[] | null; categorie: string | null; ville: string | null
  statut: string | null; quantite: number | null; vendus: number | null; vues: number | null; created_at: string; vendeur_id: string | null
}
type Membre = {
  id: string; email: string | null; prenom: string | null; nom: string | null; ville: string | null; telephone: string | null
  inscrit_le: string; email_confirme: boolean; derniere_connexion: string | null; annonces: number; admin: boolean
}
type Onglet = 'tableau' | 'annonces' | 'membres'
const FILTRES: { id: 'toutes' | Statut; label: string }[] = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'actif', label: 'Disponibles' },
  { id: 'reserve', label: 'Réservées' },
  { id: 'vendu', label: 'Vendues' },
  { id: 'suspendu', label: 'Suspendues' },
]

const dateCourte = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const nomMembre = (m?: Pick<Membre, 'prenom' | 'nom' | 'email'> | null) =>
  m ? (((m.prenom || '') + ' ' + (m.nom || '')).trim() || m.email || 'Membre') : 'Membre'

export default function Admin() {
  const [etat, setEtat] = useState<'chargement' | 'refuse' | 'ok'>('chargement')
  const [emailCompte, setEmailCompte] = useState('')
  const [onglet, setOnglet] = useState<Onglet>('tableau')
  const [stats, setStats] = useState<Stats | null>(null)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [membres, setMembres] = useState<Membre[]>([])
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState<'toutes' | Statut>('toutes')
  const [enCours, setEnCours] = useState<string | null>(null)
  const [info, setInfo] = useState('')
  const [erreur, setErreur] = useState('')

  const charger = useCallback(async () => {
    const [s, a, m] = await Promise.all([
      supabase.rpc('dealer_admin_stats'),
      supabase.from('produits').select('id, titre, prix, images, categorie, ville, statut, quantite, vendus, vues, created_at, vendeur_id')
        .order('created_at', { ascending: false }).limit(300),
      supabase.rpc('dealer_admin_membres'),
    ])
    if (s.error || m.error || a.error) { setErreur('Chargement incomplet. Recharge la page.'); return }
    setStats(s.data as Stats)
    setAnnonces((a.data as Annonce[]) || [])
    setMembres((m.data as Membre[]) || [])
  }, [])

  useEffect(() => {
    async function verifier() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/auth?next=/admin'; return }
      setEmailCompte(session.user.email || '')
      const { data: estAdmin } = await supabase.rpc('dealer_est_admin')
      if (estAdmin !== true) { setEtat('refuse'); return }
      setEtat('ok')
      await charger()
    }
    verifier()
  }, [charger])

  function annoncer(texte: string) { setErreur(''); setInfo(texte); setTimeout(() => setInfo(''), 3500) }

  async function changerStatut(a: Annonce, nouveau: 'suspendu' | 'actif') {
    const question = nouveau === 'suspendu'
      ? 'Suspendre « ' + a.titre + ' » ?\n\nElle ne sera plus visible sur le site et le vendeur sera prévenu.'
      : 'Réactiver « ' + a.titre + ' » ?\n\nElle sera de nouveau visible et le vendeur sera prévenu.'
    if (!confirm(question)) return
    setEnCours(a.id); setErreur('')
    const { data, error } = await supabase.from('produits').update({ statut: nouveau }).eq('id', a.id).select('statut').maybeSingle()
    setEnCours(null)
    if (error || !data) { setErreur('Modification refusée par la base. Vérifie que tu es connecté avec le compte administrateur.'); return }
    setAnnonces(prev => prev.map(x => x.id === a.id ? { ...x, statut: data.statut } : x))
    annoncer(nouveau === 'suspendu' ? 'Annonce suspendue. Le vendeur est prévenu.' : 'Annonce réactivée.')
    charger()
  }

  async function supprimer(a: Annonce) {
    if (!confirm('Supprimer définitivement « ' + a.titre + ' » ?\n\nCette action est irréversible.')) return
    setEnCours(a.id); setErreur('')
    const { data, error } = await supabase.from('produits').delete().eq('id', a.id).select('id')
    if (error || !data?.length) { setEnCours(null); setErreur('Suppression refusée par la base. Vérifie que tu es connecté avec le compte administrateur.'); return }
    const chemins = (a.images || []).map(u => cheminDepuisUrl(u, 'produits')).filter(Boolean) as string[]
    if (chemins.length) await supabase.storage.from('produits').remove(chemins).catch(() => {})
    setEnCours(null)
    setAnnonces(prev => prev.filter(x => x.id !== a.id))
    annoncer('Annonce supprimée.')
    charger()
  }

  async function deconnecter() {
    await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => {})
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  async function changerDeCompte() {
    await supabase.auth.signOut()
    window.location.href = '/auth?next=/admin'
  }

  const parId = useMemo(() => new Map(membres.map(m => [m.id, m])), [membres])
  const q = recherche.trim().toLowerCase()

  const annoncesFiltrees = annonces.filter(a => {
    if (filtre !== 'toutes' && statutDe(a.statut) !== filtre) return false
    if (!q) return true
    const vendeur = a.vendeur_id ? parId.get(a.vendeur_id) : null
    return [a.titre, a.ville, categorie(a.categorie)?.label, nomMembre(vendeur), vendeur?.email].some(v => (v || '').toLowerCase().includes(q))
  })
  const membresFiltres = membres.filter(m => !q || [nomMembre(m), m.email, m.ville, m.telephone].some(v => (v || '').toLowerCase().includes(q)))

  if (etat === 'chargement') {
    return <main className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Vérification de l’accès…</p></main>
  }

  if (etat === 'refuse') {
    return (
      <main className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div className="carte" style={{ padding: 28, maxWidth: 440, textAlign: 'center' }}>
          <span className="stat-icone" style={{ background: '#FEE2E2', color: '#991B1B', width: 48, height: 48, borderRadius: 14 }}><Icone nom="bouclier" taille={24} /></span>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: '8px 0' }}>Accès refusé</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Le compte <strong>{emailCompte}</strong> n’a pas les droits d’administration. Connecte-toi avec le compte administrateur.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="bouton bouton-principal" onClick={changerDeCompte}>Changer de compte</button>
            <a href="/" className="bouton bouton-neutre">Retour au site</a>
          </div>
        </div>
      </main>
    )
  }

  const cartes: { icone: Parameters<typeof Icone>[0]['nom']; valeur: number; label: string; aide: string; alerte?: boolean }[] = stats ? [
    { icone: 'utilisateur', valeur: stats.membres, label: 'Membres', aide: '+' + stats.membres_7j + ' cette semaine' },
    { icone: 'etiquette', valeur: stats.annonces, label: 'Annonces', aide: stats.disponibles + ' dispo · ' + stats.reservees + ' réservées · ' + stats.vendues + ' vendues' },
    { icone: 'graphique', valeur: stats.ventes, label: 'Ventes déclarées', aide: 'Articles marqués vendus' },
    { icone: 'oeil', valeur: stats.vues, label: 'Vues', aide: 'Toutes annonces confondues' },
    { icone: 'message', valeur: stats.messages, label: 'Messages', aide: '+' + stats.messages_7j + ' cette semaine' },
    { icone: 'bouclier', valeur: stats.suspendues, label: 'Suspendues', aide: 'Masquées par l’admin' },
    ...(stats.non_confirmes > 0 ? [{ icone: 'horloge' as const, valeur: stats.non_confirmes, label: 'E-mails non confirmés', aide: 'Ces membres ne peuvent pas se connecter tant que « Confirm email » est activé dans Supabase.', alerte: true }] : []),
  ] : []

  return (
    <div className="admin-page">
      <header className="admin-entete">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Icone nom="bouclier" taille={20} /> DEALER · Administration</p>
            <p style={{ fontSize: 12, opacity: 0.75 }}>{emailCompte}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/" className="bouton admin-bouton-clair"><Icone nom="accueil" taille={16} /> Voir le site</a>
            <button type="button" className="bouton admin-bouton-clair" onClick={deconnecter}><Icone nom="sortie" taille={16} /> Se déconnecter</button>
          </div>
        </div>
        <nav className="container admin-onglets" aria-label="Sections">
          {([['tableau', 'Tableau de bord', 'graphique'], ['annonces', 'Annonces', 'etiquette'], ['membres', 'Membres', 'utilisateur']] as const).map(([id, label, icone]) => (
            <button key={id} type="button" aria-current={onglet === id ? 'page' : undefined} onClick={() => { setOnglet(id); setRecherche('') }}>
              <Icone nom={icone} taille={16} /> {label}
              {id === 'annonces' && <span className="admin-compte">{annonces.length}</span>}
              {id === 'membres' && <span className="admin-compte">{membres.length}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="container" style={{ padding: '22px 0 48px' }}>
        {erreur && <p role="alert" className="carte" style={{ padding: '12px 14px', marginBottom: 16, color: '#991B1B', background: '#FEF2F2', borderColor: '#FCA5A5' }}>{erreur}</p>}
        {info && <div role="status" className="toast">{info}</div>}

        {onglet === 'tableau' && (
          <>
            <h1 className="titre-section" style={{ marginBottom: 4 }}>Tableau de bord</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 18 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {!stats ? <p style={{ color: 'var(--text-secondary)' }}>Chargement…</p> : (
              <div className="admin-stats">
                {cartes.map(c => (
                  <div key={c.label} className="carte stat" style={c.alerte ? { borderColor: '#F59E0B', background: '#FFFBEB' } : undefined}>
                    <span className="stat-icone" style={c.alerte ? { background: '#FEF3C7', color: '#92400E' } : undefined}><Icone nom={c.icone} taille={18} /></span>
                    <p className="stat-valeur">{c.valeur.toLocaleString('fr-FR')}</p>
                    <p className="stat-label">{c.label}</p>
                    <p className="stat-aide" style={{ WebkitLineClamp: c.alerte ? 4 : 2 }}>{c.aide}</p>
                  </div>
                ))}
              </div>
            )}
            <section className="carte" style={{ padding: 18, marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800 }}>Dernières annonces</h2>
                <button type="button" className="lien-discret" onClick={() => setOnglet('annonces')}>Tout voir</button>
              </div>
              {annonces.slice(0, 6).map(a => (
                <div key={a.id} className="admin-ligne">
                  <Vignette a={a} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="admin-titre">{a.titre}</p>
                    <p className="admin-meta">{prixAffiche(a.prix)} · {nomMembre(a.vendeur_id ? parId.get(a.vendeur_id) : null)} · {dateCourte(a.created_at)}</p>
                  </div>
                  <BadgeStatut statut={a.statut} quantite={a.quantite} avecStock={false} petit />
                </div>
              ))}
              {annonces.length === 0 && <p style={{ color: 'var(--text-secondary)', padding: '12px 0' }}>Aucune annonce pour l’instant.</p>}
            </section>
          </>
        )}

        {onglet === 'annonces' && (
          <>
            <div className="admin-barre">
              <h1 className="titre-section">Annonces ({annoncesFiltrees.length})</h1>
              <input type="search" className="champ" value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Titre, vendeur, ville…" aria-label="Rechercher une annonce" style={{ maxWidth: 280, fontSize: 15, padding: '10px 12px' }} />
            </div>
            <div className="admin-filtres" role="group" aria-label="Filtrer par statut">
              {FILTRES.map(f => (
                <button key={f.id} type="button" aria-pressed={filtre === f.id} onClick={() => setFiltre(f.id)}>{f.label}</button>
              ))}
            </div>
            <div className="carte" style={{ padding: '4px 16px' }}>
              {annoncesFiltrees.map(a => {
                const statut = statutDe(a.statut)
                const vendeur = a.vendeur_id ? parId.get(a.vendeur_id) : null
                return (
                  <div key={a.id} className="admin-ligne admin-ligne-annonce">
                    <Vignette a={a} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="admin-titre">{a.titre}</p>
                      <p className="admin-meta">
                        {prixAffiche(a.prix)} · {categorie(a.categorie)?.label || a.categorie || '—'} · {a.ville || '—'}
                      </p>
                      <p className="admin-meta">
                        Par {nomMembre(vendeur)}{vendeur?.email ? ' (' + vendeur.email + ')' : ''} · {dateCourte(a.created_at)} · {a.vues ?? 0} vue{(a.vues ?? 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <span className="admin-statut" style={{ background: STATUTS[statut].fond, color: STATUTS[statut].couleur }}>
                        {statut === 'suspendu' ? 'Suspendue' : STATUTS[statut].label}
                      </span>
                      {statut !== 'suspendu' && <a href={'/product/' + a.id} target="_blank" rel="noopener noreferrer" className="bouton bouton-neutre admin-petit">Voir</a>}
                      {statut === 'suspendu'
                        ? <button type="button" className="bouton bouton-secondaire admin-petit" disabled={enCours === a.id} onClick={() => changerStatut(a, 'actif')}>Réactiver</button>
                        : <button type="button" className="bouton bouton-neutre admin-petit" style={{ color: '#92400E' }} disabled={enCours === a.id} onClick={() => changerStatut(a, 'suspendu')}>Suspendre</button>}
                      <button type="button" className="bouton bouton-neutre admin-petit" style={{ color: '#B42318' }} disabled={enCours === a.id} onClick={() => supprimer(a)} aria-label={'Supprimer ' + a.titre}>
                        <Icone nom="poubelle" taille={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
              {annoncesFiltrees.length === 0 && <p style={{ textAlign: 'center', padding: 28, color: 'var(--text-secondary)' }}>Aucune annonce</p>}
            </div>
          </>
        )}

        {onglet === 'membres' && (
          <>
            <div className="admin-barre">
              <h1 className="titre-section">Membres ({membresFiltres.length})</h1>
              <input type="search" className="champ" value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Nom, e-mail, ville…" aria-label="Rechercher un membre" style={{ maxWidth: 280, fontSize: 15, padding: '10px 12px' }} />
            </div>
            <div className="carte" style={{ padding: '4px 16px' }}>
              {membresFiltres.map(m => (
                <div key={m.id} className="admin-ligne">
                  <span className="admin-initiale">{nomMembre(m)[0]?.toUpperCase()}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="admin-titre">
                      {nomMembre(m)}
                      {m.admin && <span className="admin-statut" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginLeft: 8 }}>Admin</span>}
                    </p>
                    <p className="admin-meta">{m.email}{m.telephone ? ' · ' + m.telephone : ''}{m.ville ? ' · ' + m.ville : ''}</p>
                    <p className="admin-meta">Inscrit le {dateCourte(m.inscrit_le)} · Dernière connexion : {dateCourte(m.derniere_connexion)} · {m.annonces} annonce{m.annonces > 1 ? 's' : ''}</p>
                  </div>
                  {!m.email_confirme && <span className="admin-statut" style={{ background: '#FEF3C7', color: '#92400E' }}>E-mail non confirmé</span>}
                  {m.annonces > 0 && <a href={'/profile/' + m.id} target="_blank" rel="noopener noreferrer" className="bouton bouton-neutre admin-petit">Profil</a>}
                </div>
              ))}
              {membresFiltres.length === 0 && <p style={{ textAlign: 'center', padding: 28, color: 'var(--text-secondary)' }}>Aucun membre</p>}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Vignette({ a }: { a: Annonce }) {
  return a.images?.[0]
    ? <img src={a.images[0]} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
    : <span style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icone nom="boite" taille={22} /></span>
}
