'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { OPERATEURS, prixAffiche } from '@/lib/catalogue'
import Icone from '@/components/Icone'

type Paiement = {
  id: string; user_id: string; offre: string; montant: number; reference: string; operateur: string
  numero_payeur: string; transaction_id: string | null; piece_identite: string | null
  statut: 'en_attente' | 'valide' | 'refuse'; motif_refus: string | null; created_at: string; traite_le: string | null
}
type Personne = { nom: string; email: string | null }

const dateHeure = (iso: string | null) => iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
const nomOperateur = (code: string) => OPERATEURS.find(o => o.code === code)?.label || code

// Paiements mobile money déclarés par les vendeurs : l'admin vérifie sur son téléphone puis valide.
export default function AdminPaiements({ personnes, onTraite, annoncer, signalerErreur }: {
  personnes: Map<string, Personne>
  onTraite: () => void
  annoncer: (texte: string) => void
  signalerErreur: (texte: string) => void
}) {
  const [enAttente, setEnAttente] = useState<Paiement[]>([])
  const [traites, setTraites] = useState<Paiement[]>([])
  const [libelles, setLibelles] = useState<Record<string, string>>({})
  const [enCours, setEnCours] = useState<string | null>(null)

  const charger = useCallback(async () => {
    const champs = 'id, user_id, offre, montant, reference, operateur, numero_payeur, transaction_id, piece_identite, statut, motif_refus, created_at, traite_le'
    const [a, t, o] = await Promise.all([
      supabase.from('paiements').select(champs).eq('statut', 'en_attente').order('created_at', { ascending: true }),
      supabase.from('paiements').select(champs).neq('statut', 'en_attente').order('traite_le', { ascending: false }).limit(30),
      supabase.from('offres').select('code, libelle'),
    ])
    setEnAttente((a.data as Paiement[]) || [])
    setTraites((t.data as Paiement[]) || [])
    setLibelles(Object.fromEntries(((o.data as { code: string; libelle: string }[]) || []).map(x => [x.code, x.libelle])))
  }, [])

  useEffect(() => { charger() }, [charger])

  async function voirPiece(p: Paiement) {
    if (!p.piece_identite) return
    const { data, error } = await supabase.storage.from('verifications').createSignedUrl(p.piece_identite, 120)
    if (error || !data) { signalerErreur('Pièce d’identité introuvable.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  async function traiter(p: Paiement, accepter: boolean) {
    let motif: string | null = null
    if (accepter) {
      if (!confirm('As-tu bien reçu ' + prixAffiche(p.montant) + ' du ' + p.numero_payeur + ' sur ' + nomOperateur(p.operateur) + ' ?\n\nLe badge sera activé tout de suite.')) return
    } else {
      motif = prompt('Pourquoi refuser ? (le vendeur verra ce message)', 'Nous n’avons pas reçu ton paiement. Vérifie le numéro et réessaie.')
      if (motif === null) return
    }
    setEnCours(p.id)
    const { error } = await supabase.rpc('dealer_admin_traiter_paiement', { p_id: p.id, p_accepter: accepter, p_motif: motif })
    if (error) { setEnCours(null); signalerErreur('Traitement impossible : ' + error.message); return }
    // La pièce d'identité n'est plus utile après la décision : on la supprime
    if (p.piece_identite) await supabase.storage.from('verifications').remove([p.piece_identite]).catch(() => {})
    setEnCours(null)
    annoncer(accepter ? 'Paiement validé : le badge est activé.' : 'Paiement refusé : le vendeur est prévenu.')
    await charger()
    onTraite()
  }

  const qui = (id: string) => personnes.get(id)

  return (
    <>
      <h1 className="titre-section" style={{ marginBottom: 4 }}>Paiements</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
        Vérifie sur ton téléphone que l’argent est bien arrivé, puis valide : le badge s’active tout seul et le vendeur est prévenu.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>À valider ({enAttente.length})</h2>
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {enAttente.length === 0 && <p className="carte" style={{ padding: 18, color: 'var(--text-secondary)' }}>Aucun paiement en attente.</p>}
        {enAttente.map(p => (
          <div key={p.id} className="carte" style={{ padding: 16, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ minWidth: 90 }}>
              <p style={{ fontSize: 24, fontWeight: 800 }}>{prixAffiche(p.montant)}</p>
              <p className="admin-meta">{dateHeure(p.created_at)}</p>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p className="admin-titre">{libelles[p.offre] || p.offre}</p>
              <p className="admin-meta">{qui(p.user_id)?.nom || 'Membre'}{qui(p.user_id)?.email ? ' · ' + qui(p.user_id)?.email : ''}</p>
              <p className="admin-meta"><strong>{nomOperateur(p.operateur)}</strong> depuis le <strong>{p.numero_payeur}</strong>{p.transaction_id ? ' · transaction ' + p.transaction_id : ''} · réf. {p.reference}</p>
            </div>
            <div className="admin-actions">
              {p.piece_identite && <button type="button" className="bouton bouton-neutre admin-petit" onClick={() => voirPiece(p)}><Icone nom="bouclier" taille={16} /> Pièce d’identité</button>}
              <button type="button" className="bouton bouton-principal admin-petit" disabled={enCours === p.id} onClick={() => traiter(p, true)}><Icone nom="verifie" taille={16} /> Valider</button>
              <button type="button" className="bouton bouton-neutre admin-petit" style={{ color: '#B42318' }} disabled={enCours === p.id} onClick={() => traiter(p, false)}>Refuser</button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Derniers paiements traités</h2>
      <div className="carte" style={{ padding: '4px 16px' }}>
        {traites.length === 0 && <p style={{ padding: 18, color: 'var(--text-secondary)' }}>Rien pour l’instant.</p>}
        {traites.map(p => (
          <div key={p.id} className="admin-ligne">
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="admin-titre">{libelles[p.offre] || p.offre} · {prixAffiche(p.montant)}</p>
              <p className="admin-meta">{qui(p.user_id)?.nom || 'Membre'} · {nomOperateur(p.operateur)} {p.numero_payeur} · réf. {p.reference} · {dateHeure(p.traite_le)}{p.motif_refus ? ' · ' + p.motif_refus : ''}</p>
            </div>
            <span className="admin-statut" style={p.statut === 'valide' ? { background: '#DCFCE7', color: '#166534' } : { background: '#FEE2E2', color: '#991B1B' }}>
              {p.statut === 'valide' ? 'Validé' : 'Refusé'}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
