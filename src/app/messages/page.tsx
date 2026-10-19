'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { heureMessage, nomCourt } from '@/lib/catalogue'
import { useUtilisateur } from '@/lib/useCompte'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Avatar from '@/components/Avatar'
import Icone from '@/components/Icone'

type Message = { id: string; expediteur_id: string; destinataire_id: string; produit_id: string | null; contenu: string; lu: boolean; created_at: string }
type Conversation = { autre: string; dernier: Message; nonLus: number; produitId: string | null }
type ProfilMini = { id: string; prenom: string | null; nom: string | null; avatar_url: string | null }
type ProduitMini = { id: string; titre: string; images: string[] | null }

export default function Messages() {
  const { user, pret } = useUtilisateur()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [profils, setProfils] = useState<Record<string, ProfilMini>>({})
  const [produits, setProduits] = useState<Record<string, ProduitMini>>({})
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    if (!pret) return
    if (!user) { setLoading(false); return }
    const moi = user.id

    async function charger() {
      const { data, error } = await supabase.from('messages')
        .select('id, expediteur_id, destinataire_id, produit_id, contenu, lu, created_at')
        .or('expediteur_id.eq.' + moi + ',destinataire_id.eq.' + moi)
        .order('created_at', { ascending: false }).limit(500)
      if (error) { setErreur('Impossible de charger tes messages. Vérifie ta connexion, puis recharge la page.'); setLoading(false); return }
      const parAutre = new Map<string, Conversation>()
      for (const m of (data as Message[]) || []) {
        const autre = m.expediteur_id === moi ? m.destinataire_id : m.expediteur_id
        const c = parAutre.get(autre)
        if (!c) parAutre.set(autre, { autre, dernier: m, nonLus: 0, produitId: m.produit_id })
        const conv = parAutre.get(autre)!
        if (m.destinataire_id === moi && !m.lu) conv.nonLus++
        if (!conv.produitId && m.produit_id) conv.produitId = m.produit_id
      }
      const liste = [...parAutre.values()]
      setConversations(liste)

      const ids = liste.map(c => c.autre)
      const idsProduits = [...new Set(liste.map(c => c.produitId).filter(Boolean))] as string[]
      const [p, pr] = await Promise.all([
        ids.length ? supabase.from('profiles').select('id, prenom, nom, avatar_url').in('id', ids) : Promise.resolve({ data: [] }),
        idsProduits.length ? supabase.from('produits').select('id, titre, images').in('id', idsProduits) : Promise.resolve({ data: [] }),
      ])
      setProfils(Object.fromEntries(((p.data as ProfilMini[]) || []).map(x => [x.id, x])))
      setProduits(Object.fromEntries(((pr.data as ProduitMini[]) || []).map(x => [x.id, x])))
      setLoading(false)
    }
    charger()

    const canal = supabase.channel('boite-' + moi + '-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'destinataire_id=eq.' + moi }, () => { charger() })
      .subscribe()
    return () => { supabase.removeChannel(canal) }
  }, [pret, user])

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '24px 16px 96px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Messages</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Tes conversations avec les acheteurs et les vendeurs.</p>

          {!pret || loading ? (
            <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Chargement…</p>
          ) : !user ? (
            <div className="carte" style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Connecte-toi pour voir tes messages</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Tes conversations avec les vendeurs et les acheteurs apparaissent ici.</p>
              <a href="/auth?next=/messages" className="bouton bouton-principal">Se connecter</a>
            </div>
          ) : erreur ? (
            <p role="alert" style={{ color: '#991B1B', padding: 24, textAlign: 'center' }}>{erreur}</p>
          ) : conversations.length === 0 ? (
            <div className="carte" style={{ padding: 32, textAlign: 'center' }}>
              <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icone nom="message" taille={26} /></span>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Aucune conversation pour l’instant</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>Pour écrire à un vendeur, ouvre une annonce et touche « Envoyer un message ».</p>
              <a href="/#annonces" className="bouton bouton-principal">Voir les annonces</a>
            </div>
          ) : (
            <div className="carte" style={{ overflow: 'hidden' }}>
              {conversations.map(c => {
                const p = profils[c.autre]
                const pr = c.produitId ? produits[c.produitId] : undefined
                const deMoi = c.dernier.expediteur_id === user.id
                return (
                  <a key={c.autre} href={'/messages/' + c.autre} className="conversation-ligne">
                    <Avatar url={p?.avatar_url} nom={p?.prenom} taille={48} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontWeight: c.nonLus ? 800 : 700, fontSize: 15 }}>{nomCourt(p)}</span>
                        <span style={{ fontSize: 12, color: c.nonLus ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: c.nonLus ? 700 : 500, flexShrink: 0 }}>{heureMessage(c.dernier.created_at)}</span>
                      </span>
                      {pr && <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pr.titre}</span>}
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 14, color: c.nonLus ? 'var(--text)' : 'var(--text-secondary)', fontWeight: c.nonLus ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {deMoi ? 'Toi : ' : ''}{c.dernier.contenu}
                        </span>
                        {c.nonLus > 0 && <span className="compteur">{c.nonLus}</span>}
                      </span>
                    </span>
                    {pr?.images?.[0] && <img src={pr.images[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
