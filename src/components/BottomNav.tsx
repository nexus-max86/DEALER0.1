'use client'
import { usePathname } from 'next/navigation'
import Icone from './Icone'
import { useUtilisateur, useNonLus } from '@/lib/useCompte'

export default function BottomNav() {
  const { user } = useUtilisateur()
  const { messages } = useNonLus(user?.id)
  const chemin = usePathname() || ''
  const liens = [
    { href: '/', icone: 'accueil', label: 'Accueil' },
    { href: '/search', icone: 'recherche', label: 'Recherche' },
    { href: '/sell', icone: 'plus', label: 'Vendre', principal: true },
    { href: '/messages', icone: 'message', label: 'Messages', badge: messages },
    { href: '/account', icone: 'utilisateur', label: user ? 'Compte' : 'Connexion' },
  ]
  return (
    <nav className="mobile-only barre-bas" aria-label="Navigation">
      {liens.map(l => {
        const actif = l.href === '/' ? chemin === '/' : chemin.startsWith(l.href)
        return (
          <a key={l.href} href={l.href} className={'barre-bas-lien' + (actif ? ' actif' : '') + (l.principal ? ' principal' : '')} aria-current={actif ? 'page' : undefined}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              {l.principal
                ? <span className="barre-bas-vendre"><Icone nom="plus" taille={22} epaisseur={2.4} /></span>
                : <Icone nom={l.icone} taille={22} />}
              {l.badge ? <span className="pastille">{l.badge > 9 ? '9+' : l.badge}</span> : null}
            </span>
            {l.label}
          </a>
        )
      })}
    </nav>
  )
}
