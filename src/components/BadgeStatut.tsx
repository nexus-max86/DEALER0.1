import { STATUTS, statutDe, libelleStock } from '@/lib/catalogue'

// Pastille « Disponible / Réservé / Vendu », avec le stock quand l'article est disponible
export default function BadgeStatut({ statut, quantite, avecStock = true, petit = false }: { statut?: string | null; quantite?: number | null; avecStock?: boolean; petit?: boolean }) {
  const s = STATUTS[statutDe(statut)]
  const stock = avecStock ? libelleStock(quantite, statut) : null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.fond, color: s.couleur, fontSize: petit ? 11 : 12, fontWeight: 700, padding: petit ? '2px 8px' : '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: s.couleur }} />
      <span>{s.label}{stock ? <span style={{ fontWeight: 500 }}>, {stock.toLowerCase()}</span> : null}</span>
    </span>
  )
}
