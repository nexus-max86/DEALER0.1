import { categorie, prixAffiche, statutDe, STATUTS } from '@/lib/catalogue'
import Icone from './Icone'

export type ProduitResume = {
  id: string
  titre: string
  prix: number | string
  categorie: string | null
  marque?: string | null
  ville?: string | null
  images?: string[] | null
  statut?: string | null
  quantite?: number | null
}

// Carte d'annonce utilisée sur l'accueil, les catégories, la recherche, les favoris et les profils
export default function CarteProduit({ p }: { p: ProduitResume }) {
  const c = categorie(p.categorie)
  const statut = statutDe(p.statut)
  const s = STATUTS[statut]
  const suspendue = statut === 'suspendu'
  const style: React.CSSProperties = { display: 'block', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)', opacity: suspendue ? 0.7 : undefined }
  const contenu = (
    <>
      <div style={{ position: 'relative', background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {p.images && p.images.length > 0
          ? <img src={p.images[0]} alt={p.titre} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: statut === 'vendu' || suspendue ? 'grayscale(0.6)' : undefined }} />
          : <Icone nom="boite" taille={48} style={{ color: 'var(--text-secondary)' }} />}
        {statut !== 'actif' && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: s.fond, color: s.couleur, fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999 }}>{s.label}</span>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <p style={{ fontSize: 16, fontWeight: 800 }}>{prixAffiche(p.prix)}</p>
        <p style={{ fontSize: 14, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titre}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {[c?.label, p.marque, p.ville].filter(Boolean).join(', ')}
        </p>
      </div>
    </>
  )
  // Une annonce suspendue par l'admin (visible seulement dans les favoris) n'ouvre plus de page
  if (suspendue) return <div className="product-card" style={style}>{contenu}</div>
  return <a href={'/product/' + p.id} className="product-card" style={style}>{contenu}</a>
}
