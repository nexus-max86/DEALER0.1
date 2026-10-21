'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase, assurerProfil } from '@/lib/supabase'
import { useUtilisateur } from '@/lib/useCompte'
import { redimensionner } from '@/lib/images'
import { OPERATEURS, LIMITE_GRATUITE, badgesDe, dateLongue, prixAffiche, type CodeOperateur } from '@/lib/catalogue'
import Icone from '@/components/Icone'

type Offre = { code: string; badge: 'pro' | 'verifie'; periode: 'mois' | 'an'; montant: number; libelle: string }
type Numeros = { beneficiaire?: string } & Partial<Record<CodeOperateur, string>>
type Paiement = { id: string; offre: string; montant: number; reference: string; statut: 'en_attente' | 'valide' | 'refuse'; motif_refus: string | null; created_at: string }

const AVANTAGES = {
  pro: {
    titre: 'Vendeur Pro',
    accroche: 'Pour les boutiques et les revendeurs',
    icone: 'etoile',
    couleur: '#8A4513',
    fond: '#F8E6D6',
    liste: [
      'Badge « Pro » sur ton profil et tes annonces',
      'Annonces illimitées (gratuit : ' + LIMITE_GRATUITE + ' annonces actives)',
      'Le nom de ta boutique affiché à la place de ton nom',
    ],
  },
  verifie: {
    titre: 'Vendeur vérifié',
    accroche: 'Pour inspirer confiance aux acheteurs',
    icone: 'bouclier',
    couleur: '#166534',
    fond: '#DCFCE7',
    liste: [
      'Badge « Vérifié » sur ton profil et tes annonces',
      'Ta pièce d’identité est contrôlée par l’équipe DEALER',
      'Les acheteurs te contactent plus facilement',
    ],
  },
} as const

export default function Offres() {
  const { user, pret } = useUtilisateur()
  const [offres, setOffres] = useState<Offre[]>([])
  const [numeros, setNumeros] = useState<Numeros>({})
  const [profil, setProfil] = useState<{ pro_jusqua: string | null; verifie_jusqua: string | null } | null>(null)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [periode, setPeriode] = useState<'mois' | 'an'>('mois')
  const [choix, setChoix] = useState<Offre | null>(null)
  const [operateur, setOperateur] = useState<CodeOperateur | ''>('')
  const [numeroPayeur, setNumeroPayeur] = useState('')
  const [transaction, setTransaction] = useState('')
  const [piece, setPiece] = useState<File | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [confirme, setConfirme] = useState<Paiement | null>(null)

  useEffect(() => {
    supabase.from('offres').select('code, badge, periode, montant, libelle').order('ordre').then(({ data }) => setOffres((data as Offre[]) || []))
    supabase.from('parametres').select('valeur').eq('cle', 'paiement').maybeSingle().then(({ data }) => setNumeros((data?.valeur as Numeros) || {}))
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('pro_jusqua, verifie_jusqua').eq('id', user.id).maybeSingle().then(({ data }) => setProfil(data))
    supabase.from('paiements').select('id, offre, montant, reference, statut, motif_refus, created_at').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setPaiements((data as Paiement[]) || []))
  }, [user, confirme])

  const operateursDispo = OPERATEURS.filter(o => (numeros[o.code] || '').trim())
  const badges = badgesDe(profil)
  const parBadge = useMemo(() => ({
    pro: offres.find(o => o.badge === 'pro' && o.periode === periode),
    verifie: offres.find(o => o.badge === 'verifie' && o.periode === periode),
  }), [offres, periode])
  const libelleOffre = (code: string) => offres.find(o => o.code === code)?.libelle || code

  function economie(badge: 'pro' | 'verifie') {
    const mois = offres.find(o => o.badge === badge && o.periode === 'mois')
    const an = offres.find(o => o.badge === badge && o.periode === 'an')
    if (!mois || !an) return null
    const gain = mois.montant * 12 - an.montant
    return gain > 0 ? prixAffiche(gain) : null
  }

  function choisir(o: Offre | undefined) {
    if (!o) return
    if (!user) { window.location.href = '/auth?next=/offres'; return }
    setChoix(o); setErreur(''); setConfirme(null)
    if (!operateur && operateursDispo.length === 1) setOperateur(operateursDispo[0].code)
    setTimeout(() => document.getElementById('paiement')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !choix) return
    const numero = numeroPayeur.replace(/[^\d+]/g, '')
    if (!operateur) { setErreur('Choisis l’opérateur avec lequel tu as payé.'); return }
    if (numero.length < 9) { setErreur('Indique le numéro qui a envoyé l’argent.'); return }
    if (choix.badge === 'verifie' && !piece) { setErreur('Ajoute une photo de ta pièce d’identité.'); return }
    setEnvoi(true); setErreur('')
    try {
      await assurerProfil(user).catch(() => {})
      let chemin: string | null = null
      if (choix.badge === 'verifie' && piece) {
        const blob = await redimensionner(piece, 1600)
        chemin = user.id + '/' + Date.now() + '.jpg'
        const { error } = await supabase.storage.from('verifications').upload(chemin, blob, { contentType: 'image/jpeg' })
        if (error) throw new Error('piece')
      }
      const { data, error } = await supabase.from('paiements')
        .insert({ offre: choix.code, operateur, numero_payeur: numero, transaction_id: transaction.trim() || null, piece_identite: chemin })
        .select('id, offre, montant, reference, statut, motif_refus, created_at').single()
      if (error || !data) throw new Error(error?.message || 'paiement')
      setConfirme(data as Paiement)
      setChoix(null); setTransaction(''); setPiece(null)
      setTimeout(() => document.getElementById('paiement')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err) {
      const m = err instanceof Error ? err.message : ''
      setErreur(m === 'piece' ? 'La photo de la pièce d’identité n’a pas pu être envoyée. Choisis une photo JPG ou PNG.'
        : m.includes('3 paiements') ? 'Tu as déjà 3 paiements en attente : attends leur validation.'
        : 'Envoi impossible. Vérifie ta connexion, puis réessaie.')
    }
    setEnvoi(false)
  }

  return (
    <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '24px 16px 96px' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <h1 className="titre-section" style={{ fontSize: 28 }}>Vends plus avec les badges DEALER</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 6, marginBottom: 18, lineHeight: 1.6 }}>
          Publier reste gratuit. Les badges rendent tes annonces plus visibles et plus rassurantes. Paiement par mobile money.
        </p>

        {pret && user && (badges.pro || badges.verifie) && (
          <div className="carte" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
            {badges.pro && <span><strong>Vendeur Pro</strong> actif jusqu’au {dateLongue(profil?.pro_jusqua)}</span>}
            {badges.verifie && <span><strong>Vendeur vérifié</strong> actif jusqu’au {dateLongue(profil?.verifie_jusqua)}</span>}
            <span style={{ color: 'var(--text-secondary)' }}>Un nouveau paiement prolonge ton badge.</span>
          </div>
        )}

        <div className="choix-periode" role="group" aria-label="Durée">
          <button type="button" aria-pressed={periode === 'mois'} onClick={() => setPeriode('mois')}>1 mois</button>
          <button type="button" aria-pressed={periode === 'an'} onClick={() => setPeriode('an')}>1 an <span className="pastille-eco">2 mois offerts</span></button>
        </div>

        <div className="grille-offres">
          {(['pro', 'verifie'] as const).map(b => {
            const a = AVANTAGES[b]
            const o = parBadge[b]
            const actif = b === 'pro' ? badges.pro : badges.verifie
            return (
              <section key={b} className="carte offre" style={choix?.badge === b ? { borderColor: a.couleur, boxShadow: '0 0 0 2px ' + a.fond } : undefined}>
                <span className="stat-icone" style={{ background: a.fond, color: a.couleur, width: 44, height: 44, borderRadius: 12 }}><Icone nom={a.icone} taille={22} /></span>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{a.titre}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{a.accroche}</p>
                <p style={{ margin: '14px 0 2px' }}>
                  <span style={{ fontSize: 34, fontWeight: 800 }}>{o ? prixAffiche(o.montant) : '…'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}> / {periode === 'mois' ? 'mois' : 'an'}</span>
                </p>
                <p style={{ fontSize: 13, color: 'var(--cuivre)', fontWeight: 700, minHeight: 20 }}>
                  {periode === 'an' && economie(b) ? 'Tu économises ' + economie(b) : ''}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 18px', display: 'grid', gap: 8 }}>
                  {a.liste.map(l => (
                    <li key={l} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.45 }}>
                      <Icone nom="verifie" taille={18} epaisseur={2.4} style={{ color: a.couleur, marginTop: 1 }} /> {l}
                    </li>
                  ))}
                </ul>
                <button type="button" className="bouton bouton-principal bouton-large" disabled={!o} onClick={() => choisir(o)}>
                  {actif ? 'Prolonger' : 'Choisir'} · {o ? prixAffiche(o.montant) : ''}
                </button>
              </section>
            )
          })}
        </div>

        <div id="paiement" style={{ scrollMarginTop: 80 }} />

        {confirme && (
          <section className="carte" style={{ padding: 22, marginTop: 20, borderColor: '#86EFAC', background: '#F0FDF4' }} role="status">
            <h2 style={{ fontSize: 19, fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center', color: '#166534' }}><Icone nom="verifie" taille={22} epaisseur={2.4} /> Paiement envoyé pour validation</h2>
            <p style={{ marginTop: 8, lineHeight: 1.6 }}>
              {libelleOffre(confirme.offre)} · {prixAffiche(confirme.montant)} · réf. <strong>{confirme.reference}</strong><br />
              L’équipe DEALER vérifie ton paiement, en général sous 24 h. Tu reçois une notification dès que ton badge est activé.
            </p>
          </section>
        )}

        {choix && (
          <section className="carte" style={{ padding: 22, marginTop: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800 }}>Payer {prixAffiche(choix.montant)} · {choix.libelle}</h2>

            {operateursDispo.length === 0 ? (
              <p style={{ marginTop: 10, color: 'var(--text-secondary)' }}>Le paiement par mobile money arrive très bientôt. Reviens dans quelques jours.</p>
            ) : (
              <>
                <p className="etiquette-champ" style={{ marginTop: 14 }}>1. Envoie {prixAffiche(choix.montant)} sur l’un de ces numéros{numeros.beneficiaire ? ' (au nom de ' + numeros.beneficiaire + ')' : ''}</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {operateursDispo.map(o => (
                    <div key={o.code} className="ligne-numero">
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: o.couleur, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{o.label}</span>
                      <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{numeros[o.code]}</strong>
                      <button type="button" className="lien-discret" onClick={() => navigator.clipboard?.writeText(numeros[o.code] || '')}>Copier</button>
                    </div>
                  ))}
                </div>

                <form onSubmit={envoyer} style={{ marginTop: 18, display: 'grid', gap: 14 }}>
                  <p className="etiquette-champ" style={{ margin: 0 }}>2. Dis-nous comment tu as payé</p>
                  <div>
                    <label className="etiquette-champ" htmlFor="operateur">Opérateur utilisé</label>
                    <select id="operateur" className="champ" value={operateur} onChange={e => setOperateur(e.target.value as CodeOperateur)}>
                      <option value="">Choisir…</option>
                      {operateursDispo.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="etiquette-champ" htmlFor="numero-payeur">Numéro qui a envoyé l’argent</label>
                    <input id="numero-payeur" className="champ" inputMode="tel" placeholder="+243 97 000 0000" value={numeroPayeur} onChange={e => setNumeroPayeur(e.target.value)} />
                  </div>
                  <div>
                    <label className="etiquette-champ" htmlFor="transaction">Numéro de transaction <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(facultatif, dans le SMS de confirmation)</span></label>
                    <input id="transaction" className="champ" maxLength={60} value={transaction} onChange={e => setTransaction(e.target.value)} />
                  </div>
                  {choix.badge === 'verifie' && (
                    <div>
                      <label className="etiquette-champ" htmlFor="piece">Photo de ta pièce d’identité (carte d’électeur, passeport ou permis)</label>
                      <input id="piece" type="file" accept="image/jpeg,image/png,image/webp" className="champ" onChange={e => setPiece(e.target.files?.[0] || null)} />
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', gap: 6 }}>
                        <Icone nom="bouclier" taille={14} /> Visible seulement par l’équipe DEALER, supprimée après la vérification.
                      </p>
                    </div>
                  )}
                  {erreur && <p role="alert" style={{ color: '#991B1B', fontSize: 14 }}>{erreur}</p>}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button type="submit" className="bouton bouton-principal" disabled={envoi}>{envoi ? 'Envoi…' : 'J’ai payé, envoyer'}</button>
                    <button type="button" className="bouton bouton-neutre" onClick={() => setChoix(null)}>Annuler</button>
                  </div>
                </form>
              </>
            )}
          </section>
        )}

        {paiements.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Mes paiements</h2>
            <div className="carte" style={{ padding: '4px 16px' }}>
              {paiements.map(p => (
                <div key={p.id} className="admin-ligne">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="admin-titre">{libelleOffre(p.offre)} · {prixAffiche(p.montant)}</p>
                    <p className="admin-meta">Réf. {p.reference} · {dateLongue(p.created_at)}{p.statut === 'refuse' && p.motif_refus ? ' · ' + p.motif_refus : ''}</p>
                  </div>
                  <span className="admin-statut" style={p.statut === 'valide' ? { background: '#DCFCE7', color: '#166534' } : p.statut === 'refuse' ? { background: '#FEE2E2', color: '#991B1B' } : { background: '#FEF3C7', color: '#92400E' }}>
                    {p.statut === 'valide' ? 'Validé' : p.statut === 'refuse' ? 'Refusé' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
