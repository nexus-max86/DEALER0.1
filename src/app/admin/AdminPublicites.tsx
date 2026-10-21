'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { redimensionner, cheminDepuisUrl } from '@/lib/images'
import { CATEGORIES, categorie as trouverCategorie, numeroWhatsApp, prixAffiche } from '@/lib/catalogue'
import Icone from '@/components/Icone'

type Pub = {
  id: string; annonceur: string; titre: string; texte: string | null; image_url: string | null; lien: string | null
  categorie: string | null; debut: string; fin: string; actif: boolean; montant: number | null; vues: number; clics: number
}

const aujourdhui = () => new Date().toISOString().slice(0, 10)
const dansJours = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
const dateCourte = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

function etatPub(p: Pub) {
  const j = aujourdhui()
  if (!p.actif) return { label: 'Désactivée', fond: '#E8ECEF', couleur: '#475569' }
  if (j < p.debut) return { label: 'Programmée', fond: '#E0F2FE', couleur: '#075985' }
  if (j > p.fin) return { label: 'Terminée', fond: '#E8ECEF', couleur: '#475569' }
  return { label: 'En cours', fond: '#DCFCE7', couleur: '#166534' }
}

// Un lien web (https://…) ou un numéro WhatsApp, converti en lien wa.me
function lienPropre(saisie: string): string | null | 'invalide' {
  const v = saisie.trim()
  if (!v) return null
  if (/^https:\/\/\S+$/i.test(v)) return v
  const n = numeroWhatsApp(v)
  return n ? 'https://wa.me/' + n : 'invalide'
}

const VIDE = { annonceur: '', titre: '', texte: '', lien: '', categorie: '', debut: '', fin: '', montant: '' }

export default function AdminPublicites({ annoncer, signalerErreur, onChange }: {
  annoncer: (texte: string) => void
  signalerErreur: (texte: string) => void
  onChange: () => void
}) {
  const [pubs, setPubs] = useState<Pub[]>([])
  const [form, setForm] = useState({ ...VIDE, debut: aujourdhui(), fin: dansJours(30) })
  const [image, setImage] = useState<File | null>(null)
  const [envoi, setEnvoi] = useState(false)

  const charger = useCallback(async () => {
    const { data } = await supabase.from('publicites').select('*').order('created_at', { ascending: false })
    setPubs((data as Pub[]) || [])
  }, [])
  useEffect(() => { charger() }, [charger])

  async function creer(e: React.FormEvent) {
    e.preventDefault()
    const lien = lienPropre(form.lien)
    if (form.annonceur.trim().length < 2 || form.titre.trim().length < 2) { signalerErreur('Indique l’annonceur et un titre.'); return }
    if (lien === 'invalide') { signalerErreur('Le lien doit commencer par https:// ou être un numéro WhatsApp.'); return }
    if (form.fin < form.debut) { signalerErreur('La date de fin doit être après la date de début.'); return }
    setEnvoi(true)
    let image_url: string | null = null
    try {
      if (image) {
        const blob = await redimensionner(image, 800)
        const chemin = Date.now() + '.jpg'
        const { error } = await supabase.storage.from('publicites').upload(chemin, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
        if (error) throw new Error(error.message)
        image_url = supabase.storage.from('publicites').getPublicUrl(chemin).data.publicUrl
      }
      const { error } = await supabase.from('publicites').insert({
        annonceur: form.annonceur.trim(), titre: form.titre.trim(), texte: form.texte.trim() || null, lien,
        categorie: form.categorie || null, debut: form.debut, fin: form.fin,
        montant: form.montant ? Number(form.montant) : null, image_url,
      })
      if (error) throw new Error(error.message)
      setForm({ ...VIDE, debut: aujourdhui(), fin: dansJours(30) }); setImage(null)
      annoncer('Publicité créée.')
      await charger(); onChange()
    } catch (err) {
      signalerErreur('Création impossible : ' + (err instanceof Error ? err.message : ''))
    }
    setEnvoi(false)
  }

  async function basculer(p: Pub) {
    const { error } = await supabase.from('publicites').update({ actif: !p.actif }).eq('id', p.id)
    if (error) { signalerErreur('Modification impossible.'); return }
    await charger()
  }

  async function supprimer(p: Pub) {
    if (!confirm('Supprimer la publicité « ' + p.titre + ' » ?')) return
    const { data, error } = await supabase.from('publicites').delete().eq('id', p.id).select('id')
    if (error || !data?.length) { signalerErreur('Suppression impossible.'); return }
    const chemin = cheminDepuisUrl(p.image_url, 'publicites')
    if (chemin) await supabase.storage.from('publicites').remove([chemin]).catch(() => {})
    annoncer('Publicité supprimée.')
    await charger(); onChange()
  }

  const champ = (cle: keyof typeof VIDE) => ({ value: form[cle], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [cle]: e.target.value }) })

  return (
    <>
      <h1 className="titre-section" style={{ marginBottom: 4 }}>Publicités</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
        Un commerce de Lubumbashi te paie pour apparaître sur l’accueil ou dans une catégorie. Une publicité s’affiche entre la date de début et la date de fin.
      </p>

      <form onSubmit={creer} className="carte" style={{ padding: 18, display: 'grid', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>Nouvelle publicité</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label className="etiquette-champ" htmlFor="pub-annonceur">Annonceur *</label><input id="pub-annonceur" className="champ" maxLength={80} placeholder="Ex. : Boutique Mado" {...champ('annonceur')} /></div>
          <div><label className="etiquette-champ" htmlFor="pub-titre">Titre *</label><input id="pub-titre" className="champ" maxLength={80} placeholder="Ex. : -20 % sur les téléphones" {...champ('titre')} /></div>
          <div><label className="etiquette-champ" htmlFor="pub-lien">Lien ou WhatsApp</label><input id="pub-lien" className="champ" placeholder="https://… ou +243 97…" {...champ('lien')} /></div>
          <div><label className="etiquette-champ" htmlFor="pub-cat">Où l’afficher</label>
            <select id="pub-cat" className="champ" {...champ('categorie')}>
              <option value="">Accueil et toutes les catégories</option>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>Catégorie {c.label}</option>)}
            </select>
          </div>
          <div><label className="etiquette-champ" htmlFor="pub-debut">Début</label><input id="pub-debut" type="date" className="champ" {...champ('debut')} /></div>
          <div><label className="etiquette-champ" htmlFor="pub-fin">Fin</label><input id="pub-fin" type="date" className="champ" {...champ('fin')} /></div>
          <div><label className="etiquette-champ" htmlFor="pub-montant">Montant payé ($)</label><input id="pub-montant" type="number" min="0" step="0.01" inputMode="decimal" className="champ" {...champ('montant')} /></div>
          <div><label className="etiquette-champ" htmlFor="pub-image">Image</label><input id="pub-image" type="file" accept="image/jpeg,image/png,image/webp" className="champ" onChange={e => setImage(e.target.files?.[0] || null)} /></div>
        </div>
        <div><label className="etiquette-champ" htmlFor="pub-texte">Texte <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(160 caractères max.)</span></label><textarea id="pub-texte" className="champ" rows={2} maxLength={160} {...champ('texte')} /></div>
        <button type="submit" className="bouton bouton-principal" style={{ justifySelf: 'start' }} disabled={envoi}><Icone nom="megaphone" taille={18} /> {envoi ? 'Création…' : 'Créer la publicité'}</button>
      </form>

      <div className="carte" style={{ padding: '4px 16px' }}>
        {pubs.length === 0 && <p style={{ padding: 18, color: 'var(--text-secondary)' }}>Aucune publicité.</p>}
        {pubs.map(p => {
          const e = etatPub(p)
          return (
            <div key={p.id} className="admin-ligne">
              {p.image_url
                ? <img src={p.image_url} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                : <span className="admin-initiale" style={{ borderRadius: 10, width: 52, height: 52 }}><Icone nom="megaphone" taille={22} /></span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="admin-titre">{p.titre}</p>
                <p className="admin-meta">{p.annonceur} · {p.categorie ? trouverCategorie(p.categorie)?.label || p.categorie : 'Accueil'} · du {dateCourte(p.debut)} au {dateCourte(p.fin)}{p.montant ? ' · ' + prixAffiche(p.montant) : ''}</p>
                <p className="admin-meta">{p.vues} vue{p.vues > 1 ? 's' : ''} · {p.clics} clic{p.clics > 1 ? 's' : ''}</p>
              </div>
              <div className="admin-actions">
                <span className="admin-statut" style={{ background: e.fond, color: e.couleur }}>{e.label}</span>
                <button type="button" className="bouton bouton-neutre admin-petit" onClick={() => basculer(p)}>{p.actif ? 'Désactiver' : 'Activer'}</button>
                <button type="button" className="bouton bouton-neutre admin-petit" style={{ color: '#B42318' }} onClick={() => supprimer(p)} aria-label={'Supprimer ' + p.titre}><Icone nom="poubelle" taille={16} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
