'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { OPERATEURS } from '@/lib/catalogue'

type Offre = { code: string; libelle: string; montant: number }
type Numeros = Record<string, string>

// Numéros mobile money de DEALER (affichés sur la page des badges) et prix des offres
export default function AdminReglages({ annoncer, signalerErreur }: { annoncer: (t: string) => void; signalerErreur: (t: string) => void }) {
  const [numeros, setNumeros] = useState<Numeros>({ beneficiaire: '', mpesa: '', orange: '', airtel: '', afrimoney: '' })
  const [offres, setOffres] = useState<Offre[]>([])
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    supabase.from('parametres').select('valeur').eq('cle', 'paiement').maybeSingle()
      .then(({ data }) => { if (data?.valeur) setNumeros(n => ({ ...n, ...(data.valeur as Numeros) })) })
    supabase.from('offres').select('code, libelle, montant').order('ordre').then(({ data }) => setOffres((data as Offre[]) || []))
  }, [])

  async function enregistrerNumeros(e: React.FormEvent) {
    e.preventDefault()
    setEnvoi(true)
    const valeur = Object.fromEntries(Object.entries(numeros).map(([k, v]) => [k, v.trim()]))
    const { data, error } = await supabase.from('parametres').update({ valeur, maj_le: new Date().toISOString() }).eq('cle', 'paiement').select('cle')
    setEnvoi(false)
    if (error || !data?.length) { signalerErreur('Numéros non enregistrés.'); return }
    annoncer('Numéros de paiement enregistrés.')
  }

  async function enregistrerPrix(e: React.FormEvent) {
    e.preventDefault()
    if (offres.some(o => !(Number(o.montant) > 0))) { signalerErreur('Chaque prix doit être supérieur à 0.'); return }
    setEnvoi(true)
    const resultats = await Promise.all(offres.map(o => supabase.from('offres').update({ montant: Number(o.montant) }).eq('code', o.code).select('code')))
    setEnvoi(false)
    if (resultats.some(r => r.error || !r.data?.length)) { signalerErreur('Prix non enregistrés.'); return }
    annoncer('Prix enregistrés.')
  }

  return (
    <>
      <h1 className="titre-section" style={{ marginBottom: 16 }}>Réglages</h1>

      <form onSubmit={enregistrerNumeros} className="carte" style={{ padding: 18, display: 'grid', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>Numéros mobile money de DEALER</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Les vendeurs envoient l’argent des badges sur ces numéros. Laisse vide un opérateur que tu n’utilises pas : il ne sera pas proposé.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label className="etiquette-champ" htmlFor="num-benef">Nom du bénéficiaire</label><input id="num-benef" className="champ" value={numeros.beneficiaire || ''} onChange={e => setNumeros({ ...numeros, beneficiaire: e.target.value })} placeholder="Nom affiché par l’opérateur" /></div>
          {OPERATEURS.map(o => (
            <div key={o.code}><label className="etiquette-champ" htmlFor={'num-' + o.code}>{o.label}</label><input id={'num-' + o.code} className="champ" inputMode="tel" value={numeros[o.code] || ''} onChange={e => setNumeros({ ...numeros, [o.code]: e.target.value })} placeholder="+243 …" /></div>
          ))}
        </div>
        <button type="submit" className="bouton bouton-principal" style={{ justifySelf: 'start' }} disabled={envoi}>Enregistrer les numéros</button>
      </form>

      <form onSubmit={enregistrerPrix} className="carte" style={{ padding: 18, display: 'grid', gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>Prix des badges ($)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {offres.map((o, i) => (
            <div key={o.code}><label className="etiquette-champ" htmlFor={'prix-' + o.code}>{o.libelle}</label>
              <input id={'prix-' + o.code} type="number" min="0.5" step="0.5" inputMode="decimal" className="champ" value={o.montant}
                onChange={e => setOffres(offres.map((x, j) => j === i ? { ...x, montant: e.target.value as unknown as number } : x))} />
            </div>
          ))}
        </div>
        <button type="submit" className="bouton bouton-principal" style={{ justifySelf: 'start' }} disabled={envoi}>Enregistrer les prix</button>
      </form>
    </>
  )
}
