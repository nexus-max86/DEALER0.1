'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, assurerProfil } from '@/lib/supabase'
import { STATUTS, STATUTS_VENDEUR, LIMITE_GRATUITE, estLimiteAnnonces, statutDe, numeroWhatsApp, prixAffiche, type Statut } from '@/lib/catalogue'
import { useUtilisateur } from '@/lib/useCompte'
import Icone from './Icone'

type Produit = { id: string; titre: string; prix: number; vendeur_id: string | null; statut: string | null; quantite: number | null; vendus: number | null; vues: number | null }

export default function ActionsAnnonce({ produit, telephoneVendeur, prenomVendeur, lien }: { produit: Produit; telephoneVendeur: string | null; prenomVendeur: string; lien: string }) {
  const router = useRouter()
  const { user, pret } = useUtilisateur()
  const [suivi, setSuivi] = useState(false)
  const [texte, setTexte] = useState('Bonjour, est-ce toujours disponible ?')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [statut, setStatut] = useState<Statut>(statutDe(produit.statut))
  const [quantite, setQuantite] = useState(produit.quantite ?? 1)
  const [vendus, setVendus] = useState(produit.vendus ?? 0)
  const [maj, setMaj] = useState('')

  const estVendeur = !!user && user.id === produit.vendeur_id
  const numero = numeroWhatsApp(telephoneVendeur)

  // Une vue comptée par visiteur et par session
  useEffect(() => {
    try {
      const cle = 'dealer-vue-' + produit.id
      if (sessionStorage.getItem(cle)) return
      sessionStorage.setItem(cle, '1')
    } catch { /* stockage indisponible */ }
    supabase.rpc('dealer_compter_vue', { p_produit: produit.id }).then(() => {})
  }, [produit.id])

  useEffect(() => {
    if (!user || estVendeur) return
    supabase.from('favoris').select('id').eq('user_id', user.id).eq('produit_id', produit.id).maybeSingle()
      .then(({ data }) => setSuivi(!!data))
  }, [user, estVendeur, produit.id])

  async function basculerSuivi() {
    if (!user) { window.location.href = '/auth?next=/product/' + produit.id; return }
    setErreur('')
    if (suivi) {
      setSuivi(false)
      await supabase.from('favoris').delete().eq('user_id', user.id).eq('produit_id', produit.id)
    } else {
      setSuivi(true)
      await assurerProfil(user).catch(() => {})
      const { error } = await supabase.from('favoris').insert({ user_id: user.id, produit_id: produit.id })
      if (error && error.code !== '23505') { setSuivi(false); setErreur('Impossible d’ajouter aux favoris. Réessaie.') }
    }
  }

  async function envoyerMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !produit.vendeur_id || !texte.trim()) return
    setEnvoi(true); setErreur('')
    await assurerProfil(user).catch(() => {})
    const { error } = await supabase.from('messages').insert({ expediteur_id: user.id, destinataire_id: produit.vendeur_id, produit_id: produit.id, contenu: texte.trim() })
    if (error) { setErreur('Message non envoyé. Vérifie ta connexion, puis réessaie.'); setEnvoi(false); return }
    window.location.href = '/messages/' + produit.vendeur_id + '?annonce=' + produit.id
  }

  // Actions du vendeur sur sa propre annonce
  async function enregistrer(changements: Partial<Produit>, message: string) {
    setMaj('Enregistrement…')
    const { data, error } = await supabase.from('produits').update(changements).eq('id', produit.id).select('statut, quantite, vendus').single()
    if (error && estLimiteAnnonces(error.message)) { setMaj('Tu as déjà ' + LIMITE_GRATUITE + ' annonces actives : passe Vendeur Pro (page Badges) pour en avoir plus.'); return }
    if (error || !data) { setMaj('Échec de l’enregistrement. Réessaie.'); return }
    setStatut(statutDe(data.statut)); setQuantite(data.quantite); setVendus(data.vendus)
    setMaj(message)
    router.refresh()
  }

  if (!pret) return <div style={{ height: 120 }} />

  if (estVendeur) {
    return (
      <div className="carte" style={{ padding: 18, marginBottom: 18, borderColor: 'var(--primary)' }}>
        <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>C’est ton annonce</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icone nom="oeil" taille={16} /> {produit.vues ?? 0} vue{(produit.vues ?? 0) > 1 ? 's' : ''} · {vendus} vendu{vendus > 1 ? 's' : ''}
        </p>
        <p className="etiquette-champ">Disponibilité</p>
        <div className="choix-statut" role="group" aria-label="Disponibilité">
          {STATUTS_VENDEUR.map(s => (
            <button key={s} type="button" aria-pressed={statut === s} onClick={() => statut !== s && enregistrer({ statut: s, ...(s === 'actif' && quantite === 0 ? { quantite: 1 } : {}) }, 'Disponibilité mise à jour. Les acheteurs intéressés sont prévenus.')}
              style={statut === s ? { background: STATUTS[s].fond, color: STATUTS[s].couleur, borderColor: STATUTS[s].couleur } : undefined}>
              {STATUTS[s].label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <span className="etiquette-champ" style={{ margin: 0 }}>En stock</span>
          <span className="stepper">
            <button type="button" aria-label="Retirer un article du stock" disabled={quantite <= 0} onClick={() => enregistrer({ quantite: quantite - 1 }, 'Stock mis à jour.')}>−</button>
            <span>{quantite}</span>
            <button type="button" aria-label="Ajouter un article au stock" onClick={() => enregistrer({ quantite: quantite + 1 }, 'Stock mis à jour.')}>+</button>
          </span>
        </div>
        {statut !== 'vendu' && quantite > 0 && (
          <button type="button" className="bouton bouton-secondaire bouton-large" style={{ marginTop: 14 }}
            onClick={() => enregistrer({ quantite: quantite - 1, vendus: vendus + 1 }, 'Vente enregistrée.')}>
            <Icone nom="verifie" taille={18} /> J’ai vendu un article
          </button>
        )}
        {maj && <p role="status" style={{ fontSize: 13, color: 'var(--primary)', marginTop: 10 }}>{maj}</p>}
        <a href="/account" className="lien-discret" style={{ display: 'inline-block', marginTop: 12 }}>Voir toutes mes annonces et mes statistiques</a>
      </div>
    )
  }

  const vendu = statut === 'vendu'

  return (
    <div style={{ marginBottom: 18 }}>
      {vendu ? (
        <p className="carte" style={{ padding: '14px 16px', fontSize: 15, marginBottom: 10 }}>Cet article a été vendu. Ajoute-le à tes favoris pour être prévenu s’il revient en stock.</p>
      ) : !user ? (
        <a href={'/auth?next=/product/' + produit.id} className="bouton bouton-principal bouton-large" style={{ marginBottom: 10 }}>
          <Icone nom="message" taille={20} /> Se connecter pour écrire à {prenomVendeur}
        </a>
      ) : (
        <form onSubmit={envoyerMessage} className="carte" style={{ padding: 14, marginBottom: 10 }}>
          <label htmlFor="message-vendeur" className="etiquette-champ">Écrire à {prenomVendeur}</label>
          <textarea id="message-vendeur" className="champ" rows={2} value={texte} onChange={e => setTexte(e.target.value)} maxLength={2000} style={{ resize: 'vertical' }} />
          <button type="submit" disabled={envoi || !texte.trim()} className="bouton bouton-principal bouton-large" style={{ marginTop: 10 }}>
            <Icone nom="envoyer" taille={18} /> {envoi ? 'Envoi…' : 'Envoyer le message'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{prenomVendeur} reçoit une notification sur DEALER.</p>
        </form>
      )}

      <button type="button" onClick={basculerSuivi} aria-pressed={suivi} className={'bouton bouton-large ' + (suivi ? 'bouton-secondaire' : 'bouton-neutre')} style={{ marginBottom: 6 }}>
        <Icone nom="coeur" taille={18} style={suivi ? { fill: 'currentColor' } : undefined} />
        {suivi ? 'Dans tes favoris' : 'Ajouter aux favoris'}
      </button>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Tu seras alerté si l’article est réservé, vendu ou de nouveau disponible.
      </p>

      {numero && !vendu && (
        <a href={'https://wa.me/' + numero + '?text=' + encodeURIComponent('Bonjour, je suis intéressé(e) par votre annonce « ' + produit.titre + ' » à ' + prixAffiche(produit.prix) + ' sur DEALER : ' + lien)}
          target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp bouton-large">
          <Icone nom="whatsapp" taille={18} /> Ou contacter sur WhatsApp
        </a>
      )}
      {erreur && <p role="alert" style={{ color: '#991B1B', fontSize: 14, marginTop: 8 }}>{erreur}</p>}
    </div>
  )
}
