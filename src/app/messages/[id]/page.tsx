'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, assurerProfil } from '@/lib/supabase'
import { heureMessage, nomCourt, numeroWhatsApp, prixAffiche } from '@/lib/catalogue'
import { useUtilisateur, rafraichirNonLus } from '@/lib/useCompte'
import Header from '@/components/Header'
import Avatar from '@/components/Avatar'
import Icone from '@/components/Icone'
import BadgeStatut from '@/components/BadgeStatut'

type Message = { id: string; expediteur_id: string; destinataire_id: string; produit_id: string | null; contenu: string; lu: boolean; created_at: string; envoi?: 'en-cours' | 'echec' }
type Profil = { id: string; prenom: string | null; nom: string | null; avatar_url: string | null; telephone: string | null }
type Produit = { id: string; titre: string; prix: number; images: string[] | null; statut: string | null; quantite: number | null; vendeur_id: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REPONSES_RAPIDES = ['Bonjour, est-ce toujours disponible ?', 'Quel est votre dernier prix ?', 'Où peut-on se rencontrer ?']

export default function Conversation() {
  const params = useParams<{ id: string }>()
  const autreId = params?.id || ''
  const { user, pret } = useUtilisateur()
  const [autre, setAutre] = useState<Profil | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [produits, setProduits] = useState<Record<string, Produit>>({})
  const [annonce, setAnnonce] = useState<Produit | null>(null)
  const [texte, setTexte] = useState('')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const fin = useRef<HTMLDivElement>(null)

  const moi = user?.id

  // Chargement de la conversation
  useEffect(() => {
    if (!pret) return
    if (!user) { window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname + window.location.search); return }
    if (!UUID.test(autreId) || autreId === user.id) { window.location.href = '/messages'; return }
    const me = user.id

    async function charger() {
      const annonceId = new URLSearchParams(window.location.search).get('annonce')
      const [p, m] = await Promise.all([
        supabase.from('profiles').select('id, prenom, nom, avatar_url, telephone').eq('id', autreId).maybeSingle(),
        supabase.from('messages').select('id, expediteur_id, destinataire_id, produit_id, contenu, lu, created_at')
          .or(`and(expediteur_id.eq.${me},destinataire_id.eq.${autreId}),and(expediteur_id.eq.${autreId},destinataire_id.eq.${me})`)
          .order('created_at', { ascending: true }).limit(300),
      ])
      if (!p.data) { setErreur('Ce membre n’existe pas ou a supprimé son compte.'); setLoading(false); return }
      setAutre(p.data as Profil)
      const liste = (m.data as Message[]) || []
      setMessages(liste)

      // Annonces citées dans la conversation, et annonce en cours de discussion
      const ids = new Set(liste.map(x => x.produit_id).filter(Boolean) as string[])
      if (annonceId && UUID.test(annonceId)) ids.add(annonceId)
      if (ids.size) {
        const { data } = await supabase.from('produits').select('id, titre, prix, images, statut, quantite, vendeur_id').in('id', [...ids])
        const parId = Object.fromEntries(((data as Produit[]) || []).map(x => [x.id, x]))
        setProduits(parId)
        const derniere = [...liste].reverse().find(x => x.produit_id)?.produit_id
        const choisie = (annonceId && parId[annonceId]) || (derniere && parId[derniere]) || null
        // On ne discute que d'une annonce de l'un des deux membres
        setAnnonce(choisie && (choisie.vendeur_id === autreId || choisie.vendeur_id === me) ? choisie : null)
      }
      setLoading(false)

      // Messages reçus marqués comme lus, ainsi que la notification correspondante
      if (liste.some(x => x.destinataire_id === me && !x.lu)) {
        await supabase.from('messages').update({ lu: true }).eq('destinataire_id', me).eq('expediteur_id', autreId).eq('lu', false)
      }
      await supabase.from('notifications').update({ lu: true }).eq('user_id', me).eq('lien', '/messages/' + autreId).eq('lu', false)
      rafraichirNonLus()
    }
    charger()

    // Nouveaux messages en temps réel
    const canal = supabase.channel('conv-' + me + '-' + autreId + '-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'destinataire_id=eq.' + me }, async payload => {
        const m = payload.new as Message
        if (m.expediteur_id !== autreId) return
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m])
        await supabase.from('messages').update({ lu: true }).eq('id', m.id)
        await supabase.from('notifications').update({ lu: true }).eq('user_id', me).eq('lien', '/messages/' + autreId).eq('lu', false)
        rafraichirNonLus()
      })
      // « Lu » : l'autre membre a ouvert la conversation
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: 'expediteur_id=eq.' + me }, payload => {
        const m = payload.new as Message
        if (m.destinataire_id !== autreId) return
        setMessages(prev => prev.map(x => x.id === m.id ? { ...x, lu: m.lu } : x))
      })
      .subscribe()
    return () => { supabase.removeChannel(canal) }
  }, [pret, user, autreId])

  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }) }, [messages.length])

  async function envoyer(contenu: string) {
    const propre = contenu.trim()
    if (!propre || !user) return
    setErreur('')
    const temporaire: Message = { id: 'tmp-' + Date.now(), expediteur_id: user.id, destinataire_id: autreId, produit_id: annonce?.id || null, contenu: propre, lu: false, created_at: new Date().toISOString(), envoi: 'en-cours' }
    setMessages(prev => [...prev, temporaire])
    setTexte('')
    try { await assurerProfil(user) } catch { /* le profil existe déjà le plus souvent */ }
    const { data, error } = await supabase.from('messages')
      .insert({ expediteur_id: user.id, destinataire_id: autreId, produit_id: annonce?.id || null, contenu: propre })
      .select('id, expediteur_id, destinataire_id, produit_id, contenu, lu, created_at').single()
    if (error || !data) {
      setMessages(prev => prev.map(x => x.id === temporaire.id ? { ...x, envoi: 'echec' } : x))
      setErreur(error?.message?.toLowerCase().includes('fetch') ? 'Message non envoyé : pas de connexion internet.' : 'Message non envoyé. Réessaie dans un instant.')
      setTexte(propre)
      return
    }
    setMessages(prev => prev.map(x => x.id === temporaire.id ? (data as Message) : x))
  }

  function touche(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(min-width: 769px)').matches) {
      e.preventDefault()
      envoyer(texte)
    }
  }

  const numero = numeroWhatsApp(autre?.telephone)
  let produitPrecedent: string | null = null

  return (
    <>
      <Header />
      <main className="conversation">
        <div className="conversation-entete">
          <a href="/messages" className="entete-lien" aria-label="Retour aux messages" style={{ flexDirection: 'row' }}><Icone nom="retour" /></a>
          {autre && (
            <a href={'/profile/' + autre.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <Avatar url={autre.avatar_url} nom={autre.prenom} taille={40} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{nomCourt(autre)}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)' }}>Voir son profil</span>
              </span>
            </a>
          )}
          {numero && (
            <a href={'https://wa.me/' + numero} target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp" style={{ padding: '8px 12px', fontSize: 13 }} title="Continuer sur WhatsApp (facultatif)">
              <Icone nom="whatsapp" taille={18} /> <span className="desktop-only">WhatsApp</span>
            </a>
          )}
        </div>

        {annonce && (
          <a href={'/product/' + annonce.id} className="conversation-annonce">
            {annonce.images?.[0] && <img src={annonce.images[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{annonce.titre}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{prixAffiche(annonce.prix)}</span>
                <BadgeStatut statut={annonce.statut} quantite={annonce.quantite} petit />
              </span>
            </span>
          </a>
        )}

        <div className="conversation-fil" aria-live="polite">
          {loading ? (
            <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Chargement…</p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: 14 }}>Écris ton premier message{autre ? ' à ' + (autre.prenom || 'ce membre') : ''}.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {REPONSES_RAPIDES.map(r => <button key={r} type="button" className="puce" onClick={() => envoyer(r)}>{r}</button>)}
              </div>
            </div>
          ) : messages.map(m => {
            const deMoi = m.expediteur_id === moi
            const changement = m.produit_id && m.produit_id !== produitPrecedent && produits[m.produit_id]
            if (m.produit_id) produitPrecedent = m.produit_id
            return (
              <div key={m.id}>
                {changement && <p className="conversation-separateur">À propos de « {produits[m.produit_id!].titre} »</p>}
                <div className={'bulle ' + (deMoi ? 'bulle-moi' : 'bulle-autre')}>
                  <p style={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{m.contenu}</p>
                  <span className="bulle-heure">
                    {m.envoi === 'en-cours' ? 'Envoi…' : m.envoi === 'echec' ? 'Non envoyé' : heureMessage(m.created_at)}
                    {deMoi && !m.envoi && m.lu ? ' · Lu' : ''}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={fin} />
        </div>

        {erreur && <p role="alert" style={{ color: '#991B1B', fontSize: 14, padding: '6px 16px' }}>{erreur}</p>}

        {autre && (
          <form className="conversation-saisie" onSubmit={e => { e.preventDefault(); envoyer(texte) }}>
            <textarea value={texte} onChange={e => setTexte(e.target.value)} onKeyDown={touche} rows={1} maxLength={2000}
              placeholder="Écris ton message" aria-label="Message" className="champ" style={{ resize: 'none', maxHeight: 140 }} />
            <button type="submit" className="bouton bouton-principal" disabled={!texte.trim()} aria-label="Envoyer" style={{ padding: '12px 14px' }}>
              <Icone nom="envoyer" taille={20} />
            </button>
          </form>
        )}
      </main>
    </>
  )
}
