'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Icone from './Icone'

type Pub = { id: string; annonceur: string; titre: string; texte: string | null; image_url: string | null; lien: string | null }

// Encart de publicité locale (gérée dans l'admin). categorie absente = encart général.
export default function Publicite({ categorie, marge = 0 }: { categorie?: string | null; marge?: number }) {
  const [pub, setPub] = useState<Pub | null>(null)

  useEffect(() => {
    let q = supabase.from('publicites').select('id, annonceur, titre, texte, image_url, lien')
    const slug = categorie && /^[a-z0-9-]{1,40}$/.test(categorie) ? categorie : null
    q = slug ? q.or('categorie.eq.' + slug + ',categorie.is.null') : q.is('categorie', null)
    q.limit(20).then(({ data }) => {
      const liste = (data as Pub[]) || []
      if (!liste.length) return
      const choisie = liste[Math.floor(Math.random() * liste.length)]
      setPub(choisie)
      try {
        const cle = 'dealer-pub-' + choisie.id
        if (sessionStorage.getItem(cle)) return
        sessionStorage.setItem(cle, '1')
      } catch { /* stockage indisponible */ }
      supabase.rpc('dealer_compter_pub', { p_id: choisie.id, p_clic: false }).then(() => {})
    })
  }, [categorie])

  if (!pub) return null
  const contenu = (
    <>
      <span className="pub-etiquette">Sponsorisé</span>
      {pub.image_url
        ? <img src={pub.image_url} alt="" loading="lazy" />
        : <span className="stat-icone" style={{ width: 56, height: 56, borderRadius: 14, margin: 0 }}><Icone nom="megaphone" taille={26} /></span>}
      <div style={{ minWidth: 0, paddingRight: 64 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--cuivre)' }}>{pub.annonceur}</p>
        <p style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{pub.titre}</p>
        {pub.texte && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{pub.texte}</p>}
      </div>
    </>
  )
  if (!pub.lien) return <div className="carte pub" style={{ marginBottom: marge }}>{contenu}</div>
  return (
    <a href={pub.lien} target="_blank" rel="noopener noreferrer sponsored" className="carte pub" style={{ marginBottom: marge }}
      onClick={() => { supabase.rpc('dealer_compter_pub', { p_id: pub.id, p_clic: true }).then(() => {}) }}>
      {contenu}
    </a>
  )
}
