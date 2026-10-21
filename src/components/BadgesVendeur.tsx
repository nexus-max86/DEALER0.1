import Icone from './Icone'
import { badgesDe } from '@/lib/catalogue'

// Badges « Pro » et « Vérifié » affichés à côté du nom d'un vendeur
export default function BadgesVendeur({ profil, taille = 'normal' }: {
  profil: { pro_jusqua?: string | null; verifie_jusqua?: string | null } | null | undefined
  taille?: 'petit' | 'normal'
}) {
  const { pro, verifie } = badgesDe(profil)
  if (!pro && !verifie) return null
  const petit = taille === 'petit'
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 999, fontWeight: 800, fontSize: petit ? 11 : 12, padding: petit ? '2px 7px' : '3px 9px', whiteSpace: 'nowrap', lineHeight: 1.3 }
  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', verticalAlign: 'middle' }}>
      {pro && <span style={{ ...base, background: '#F8E6D6', color: '#8A4513' }} title="Vendeur Pro"><Icone nom="etoile" taille={petit ? 12 : 14} epaisseur={2.2} /> Pro</span>}
      {verifie && <span style={{ ...base, background: '#DCFCE7', color: '#166534' }} title="Identité vérifiée par DEALER"><Icone nom="bouclier" taille={petit ? 12 : 14} epaisseur={2.2} /> Vérifié</span>}
    </span>
  )
}
