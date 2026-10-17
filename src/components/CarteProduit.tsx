import { categorie, prixAffiche } from '@/lib/catalogue'

export type ProduitResume = {
  id: string
  titre: string
  prix: number | string
  categorie: string | null
  marque?: string | null
  ville?: string | null
  images?: string[] | null
  statut?: string | null
}

// Carte d'annonce utilisée sur l'accueil, les catégories, la recherche et les profils
export default function CarteProduit({ p }: { p: ProduitResume }) {
  const c = categorie(p.categorie)
  return (
    <a href={'/product/' + p.id} className="product-card"
      style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)' }}>
      <div style={{ position: 'relative', background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {p.images && p.images.length > 0
          ? <img src={p.images[0]} alt={p.titre} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 52 }}>{c?.icon || '📦'}</span>}
        {p.statut === 'vendu' && <span style={{ position: 'absolute', top: 8, left: 8, background: '#166534', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>VENDU</span>}
      </div>
      <div style={{ padding: '10px 10px 12px' }}>
        {c && <span style={{ fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{c.label}</span>}
        <p style={{ fontSize: 14, fontWeight: 500, marginTop: 6, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titre}</p>
        {p.marque && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.marque}</p>}
        <p style={{ fontSize: 16, fontWeight: 700 }}>{prixAffiche(p.prix)}</p>
        {p.ville && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {p.ville}</p>}
      </div>
    </a>
  )
}
