'use client'
import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, assurerProfil } from '@/lib/supabase'
import { STATUTS, VILLES, prixAffiche, statutDe, nomCourt, type Statut } from '@/lib/catalogue'
import { redimensionner, cheminDepuisUrl } from '@/lib/images'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Avatar from '@/components/Avatar'
import Icone from '@/components/Icone'
import BadgeStatut from '@/components/BadgeStatut'

type Profil = { id: string; prenom: string | null; nom: string | null; telephone: string | null; ville: string | null; bio: string | null; avatar_url: string | null; created_at?: string }
type Annonce = { id: string; titre: string; prix: number; images: string[] | null; categorie: string | null; statut: string | null; quantite: number; vendus: number; vues: number; created_at: string }

const BIO_MAX = 500

export default function Account() {
  const [user, setUser] = useState<User | null>(null)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [messagesRecus, setMessagesRecus] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', ville: 'Lubumbashi', bio: '' })
  const [saving, setSaving] = useState(false)
  const [photoEnvoi, setPhotoEnvoi] = useState(false)
  const [info, setInfo] = useState('')
  const [erreur, setErreur] = useState('')
  const inputPhoto = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/auth?next=/account'; return }
      const u = session.user
      setUser(u)
      await assurerProfil(u).catch(() => {})
      const [p, a, m] = await Promise.all([
        supabase.from('profiles').select('id, prenom, nom, telephone, ville, bio, avatar_url, created_at').eq('id', u.id).maybeSingle(),
        supabase.from('produits').select('id, titre, prix, images, categorie, statut, quantite, vendus, vues, created_at').eq('vendeur_id', u.id).order('created_at', { ascending: false }),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('destinataire_id', u.id),
      ])
      const pr = p.data as Profil | null
      if (pr) {
        setProfil(pr)
        setForm({ prenom: pr.prenom || '', nom: pr.nom || '', telephone: pr.telephone || '', ville: pr.ville || 'Lubumbashi', bio: pr.bio || '' })
      }
      setAnnonces(((a.data as Annonce[]) || []).map(x => ({ ...x, quantite: x.quantite ?? 1, vendus: x.vendus ?? 0, vues: x.vues ?? 0 })))
      setMessagesRecus(m.count || 0)
      setLoading(false)
    }
    load()
  }, [])

  function annoncer(texte: string) { setErreur(''); setInfo(texte); setTimeout(() => setInfo(''), 3500) }

  async function sauvegarder(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.prenom.trim()) { setErreur('Indique au moins ton prénom.'); return }
    setSaving(true); setErreur('')
    const changements = { prenom: form.prenom.trim(), nom: form.nom.trim() || null, telephone: form.telephone.trim() || null, ville: form.ville, bio: form.bio.trim() || null }
    const { error } = await supabase.from('profiles').update(changements).eq('id', user.id)
    setSaving(false)
    if (error) { setErreur('Profil non enregistré. Réessaie dans un instant.'); return }
    setProfil(prev => prev ? { ...prev, ...changements } : prev)
    window.dispatchEvent(new Event('dealer:profil'))
    annoncer('Profil enregistré.')
  }

  async function changerPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier || !user) return
    setPhotoEnvoi(true); setErreur('')
    try {
      const blob = await redimensionner(fichier, 400, true)
      const chemin = user.id + '/' + Date.now() + '.jpg'
      const { error } = await supabase.storage.from('avatars').upload(chemin, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
      if (error) throw new Error(error.message)
      const url = supabase.storage.from('avatars').getPublicUrl(chemin).data.publicUrl
      const { error: e2 } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      if (e2) throw new Error(e2.message)
      const ancien = cheminDepuisUrl(profil?.avatar_url, 'avatars')
      if (ancien) await supabase.storage.from('avatars').remove([ancien]).catch(() => {})
      setProfil(prev => prev ? { ...prev, avatar_url: url } : prev)
      window.dispatchEvent(new Event('dealer:profil'))
      annoncer('Photo de profil mise à jour.')
    } catch {
      setErreur('Photo non enregistrée. Choisis une photo JPG ou PNG, puis réessaie.')
    }
    setPhotoEnvoi(false)
  }

  async function retirerPhoto() {
    if (!user || !profil?.avatar_url) return
    const ancien = cheminDepuisUrl(profil.avatar_url, 'avatars')
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
    if (ancien) await supabase.storage.from('avatars').remove([ancien]).catch(() => {})
    setProfil({ ...profil, avatar_url: null })
    window.dispatchEvent(new Event('dealer:profil'))
  }

  async function majAnnonce(a: Annonce, changements: Partial<Annonce>, message: string) {
    const { data, error } = await supabase.from('produits').update(changements).eq('id', a.id).select('statut, quantite, vendus').single()
    if (error || !data) { setErreur('Modification non enregistrée. Réessaie.'); return }
    setAnnonces(prev => prev.map(x => x.id === a.id ? { ...x, statut: data.statut, quantite: data.quantite, vendus: data.vendus } : x))
    annoncer(message)
  }

  async function supprimerAnnonce(a: Annonce) {
    if (!confirm('Supprimer définitivement « ' + a.titre + ' » ?')) return
    const { error } = await supabase.from('produits').delete().eq('id', a.id)
    if (error) { setErreur('Suppression impossible. Réessaie.'); return }
    const chemins = (a.images || []).map(u => cheminDepuisUrl(u, 'produits')).filter(Boolean) as string[]
    if (chemins.length) await supabase.storage.from('produits').remove(chemins).catch(() => {})
    setAnnonces(prev => prev.filter(x => x.id !== a.id))
    annoncer('Annonce supprimée.')
  }

  async function deconnecter() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <><Header /><main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><p style={{ color: 'var(--text-secondary)' }}>Chargement…</p></main></>

  const enVente = annonces.filter(a => statutDe(a.statut) === 'actif').length
  const reservees = annonces.filter(a => statutDe(a.statut) === 'reserve').length
  const enStock = annonces.filter(a => statutDe(a.statut) !== 'vendu').reduce((t, a) => t + (a.quantite || 0), 0)
  const ventes = annonces.reduce((t, a) => t + (a.vendus || 0) + (statutDe(a.statut) === 'vendu' && !a.vendus ? 1 : 0), 0)
  const vues = annonces.reduce((t, a) => t + (a.vues || 0), 0)
  const plusVue = [...annonces].sort((x, y) => (y.vues || 0) - (x.vues || 0))[0]

  const statistiques: { icone: string; valeur: number; label: string; aide: string }[] = [
    { icone: 'etiquette', valeur: enVente, label: 'En vente', aide: reservees ? reservees + ' réservée' + (reservees > 1 ? 's' : '') + ' en plus' : 'Annonces disponibles' },
    { icone: 'boite', valeur: enStock, label: 'Articles en stock', aide: 'Disponibles et réservés' },
    { icone: 'verifie', valeur: ventes, label: 'Ventes', aide: 'Articles marqués vendus' },
    { icone: 'oeil', valeur: vues, label: 'Vues', aide: plusVue && plusVue.vues ? 'La plus vue : ' + plusVue.titre : 'Visites de tes annonces' },
    { icone: 'message', valeur: messagesRecus, label: 'Messages reçus', aide: 'Depuis ton inscription' },
  ]

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '24px 16px 96px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {info && <div role="status" className="toast">{info}</div>}
          {erreur && <div role="alert" style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500 }}>{erreur}</div>}

          {/* Identité */}
          <section className="carte" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Avatar url={profil?.avatar_url} nom={profil?.prenom || user?.email} taille={84} />
              <button type="button" onClick={() => inputPhoto.current?.click()} disabled={photoEnvoi} aria-label="Changer la photo de profil" className="avatar-bouton">
                <Icone nom="photo" taille={16} />
              </button>
              <input ref={inputPhoto} type="file" accept="image/*" onChange={changerPhoto} style={{ display: 'none' }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>{profil ? nomCourt(profil) : 'Mon compte'}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2, overflowWrap: 'anywhere' }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                <button type="button" className="lien-discret" onClick={() => inputPhoto.current?.click()} disabled={photoEnvoi}>{photoEnvoi ? 'Envoi de la photo…' : profil?.avatar_url ? 'Changer la photo' : 'Ajouter une photo de profil'}</button>
                {profil?.avatar_url && <button type="button" className="lien-discret" style={{ color: 'var(--text-secondary)' }} onClick={retirerPhoto}>Retirer la photo</button>}
                {user && <a href={'/profile/' + user.id} className="lien-discret">Voir mon profil public</a>}
              </div>
            </div>
            <button type="button" onClick={deconnecter} className="bouton bouton-neutre" style={{ fontSize: 14, padding: '9px 14px' }}>
              <Icone nom="sortie" taille={18} /> Se déconnecter
            </button>
          </section>

          {/* Statistiques */}
          <section>
            <h2 className="titre-section" style={{ fontSize: 19, marginBottom: 12 }}>Mes statistiques</h2>
            <div className="grille-stats">
              {statistiques.map(s => (
                <div key={s.label} className="carte stat">
                  <span className="stat-icone"><Icone nom={s.icone} taille={18} /></span>
                  <p className="stat-valeur">{s.valeur.toLocaleString('fr-FR')}</p>
                  <p className="stat-label">{s.label}</p>
                  <p className="stat-aide">{s.aide}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Annonces */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
              <h2 className="titre-section" style={{ fontSize: 19 }}>Mes annonces ({annonces.length})</h2>
              <a href="/sell" className="bouton bouton-principal" style={{ padding: '9px 14px', fontSize: 14 }}><Icone nom="plus" taille={18} /> Nouvelle annonce</a>
            </div>
            {annonces.length === 0 ? (
              <div className="carte" style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Tu n’as pas encore d’annonce</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>Publie ton premier article : il apparaît sur l’accueil tout de suite.</p>
                <a href="/sell" className="bouton bouton-principal">Publier une annonce</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {annonces.map(a => {
                  const statut = statutDe(a.statut)
                  return (
                    <div key={a.id} className="carte annonce-gestion">
                      <a href={'/product/' + a.id} style={{ flexShrink: 0 }}>
                        {a.images?.[0]
                          ? <img src={a.images[0]} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', display: 'block' }} />
                          : <span style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icone nom="boite" /></span>}
                      </a>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a href={'/product/' + a.id} style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titre}</a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800 }}>{prixAffiche(a.prix)}</span>
                          <BadgeStatut statut={a.statut} quantite={a.quantite} petit />
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icone nom="oeil" taille={14} /> {a.vues} vue{a.vues > 1 ? 's' : ''}</span>
                          <span>{a.vendus} vendu{a.vendus > 1 ? 's' : ''}</span>
                        </p>
                      </div>
                      <div className="annonce-actions">
                        <div className="choix-statut" role="group" aria-label={'Disponibilité de ' + a.titre}>
                          {(Object.keys(STATUTS) as Statut[]).map(s => (
                            <button key={s} type="button" aria-pressed={statut === s}
                              onClick={() => statut !== s && majAnnonce(a, { statut: s, ...(s === 'actif' && a.quantite === 0 ? { quantite: 1 } : {}) }, 'Disponibilité mise à jour : ' + STATUTS[s].label.toLowerCase() + '.')}
                              style={statut === s ? { background: STATUTS[s].fond, color: STATUTS[s].couleur, borderColor: STATUTS[s].couleur } : undefined}>
                              {STATUTS[s].label}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                          <span className="stepper" aria-label="Stock">
                            <button type="button" aria-label="Retirer un article du stock" disabled={a.quantite <= 0} onClick={() => majAnnonce(a, { quantite: a.quantite - 1 }, 'Stock mis à jour.')}>−</button>
                            <span>{a.quantite}</span>
                            <button type="button" aria-label="Ajouter un article au stock" onClick={() => majAnnonce(a, { quantite: a.quantite + 1 }, 'Stock mis à jour.')}>+</button>
                          </span>
                          {statut !== 'vendu' && a.quantite > 0 && (
                            <button type="button" className="bouton bouton-secondaire" style={{ padding: '7px 10px', fontSize: 13 }}
                              onClick={() => majAnnonce(a, { quantite: a.quantite - 1, vendus: a.vendus + 1 }, 'Vente enregistrée.')}>
                              Vendu +1
                            </button>
                          )}
                          <button type="button" aria-label={'Supprimer ' + a.titre} className="bouton bouton-neutre" style={{ padding: '7px 9px', color: '#B42318' }} onClick={() => supprimerAnnonce(a)}>
                            <Icone nom="poubelle" taille={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Profil */}
          <section className="carte" style={{ padding: 22 }}>
            <h2 className="titre-section" style={{ fontSize: 19, marginBottom: 4 }}>Mon profil</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Ces informations apparaissent sur tes annonces et ton profil public.</p>
            <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div><label htmlFor="prenom" className="etiquette-champ">Prénom</label><input id="prenom" className="champ" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} autoComplete="given-name" /></div>
                <div><label htmlFor="nom" className="etiquette-champ">Nom <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(seule l’initiale est affichée)</span></label><input id="nom" className="champ" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} autoComplete="family-name" /></div>
                <div><label htmlFor="tel" className="etiquette-champ">Numéro WhatsApp <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(facultatif)</span></label><input id="tel" type="tel" inputMode="tel" className="champ" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="+243 97 000 0000" autoComplete="tel" /></div>
                <div><label htmlFor="ville" className="etiquette-champ">Ville</label><select id="ville" className="champ" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
              </div>
              <div>
                <label htmlFor="bio" className="etiquette-champ">À propos de toi <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(facultatif)</span></label>
                <textarea id="bio" className="champ" rows={4} maxLength={BIO_MAX} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Ce que tu vends, où tu te trouves à Lubumbashi, tes horaires pour les rendez-vous…" style={{ resize: 'vertical' }} />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 4 }}>{form.bio.length} / {BIO_MAX}</p>
              </div>
              <button type="submit" disabled={saving} className="bouton bouton-principal" style={{ alignSelf: 'flex-start' }}>{saving ? 'Enregistrement…' : 'Enregistrer le profil'}</button>
            </form>
          </section>

          <section style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/messages" className="bouton bouton-neutre"><Icone nom="message" taille={18} /> Mes messages</a>
            <a href="/favorites" className="bouton bouton-neutre"><Icone nom="coeur" taille={18} /> Mes favoris</a>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
