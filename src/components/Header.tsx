'use client'
import { useState } from 'react'
import NotifBell from './NotifBell'
import Icone from './Icone'
import Avatar from './Avatar'
import { useUtilisateur, useNonLus, useProfilCourt } from '@/lib/useCompte'

function Pastille({ n }: { n: number }) {
  if (!n) return null
  return <span className="pastille">{n > 9 ? '9+' : n}</span>
}

export default function Header() {
  const [query, setQuery] = useState('')
  const { user } = useUtilisateur()
  const { messages } = useNonLus(user?.id)
  const profil = useProfilCourt(user?.id)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    window.location.href = '/search?q=' + encodeURIComponent(query)
  }

  return (
    <header className="entete">
      <div className="container entete-ligne">
        <a href="/" className="logo" aria-label="DEALER, accueil">
          <span className="logo-marque" aria-hidden="true" />
          DEALER
        </a>
        <form onSubmit={handleSearch} role="search" className="entete-recherche">
          <Icone nom="recherche" taille={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un article, une marque" aria-label="Rechercher" />
        </form>
        <nav className="entete-nav" aria-label="Navigation principale">
          <a href="/messages" className="entete-lien desktop-only" aria-label={'Messages' + (messages ? ', ' + messages + ' non lus' : '')}>
            <span style={{ position: 'relative', display: 'inline-flex' }}><Icone nom="message" /><Pastille n={messages} /></span>
            <span>Messages</span>
          </a>
          <a href="/favorites" className="entete-lien desktop-only">
            <Icone nom="coeur" />
            <span>Favoris</span>
          </a>
          {user && <NotifBell userId={user.id} />}
          <a href="/account" className="entete-lien desktop-only" aria-label="Mon compte">
            {user ? <Avatar url={profil?.avatar_url} nom={profil?.prenom || user.email} taille={26} /> : <Icone nom="utilisateur" />}
            <span>{user ? 'Mon compte' : 'Se connecter'}</span>
          </a>
          <a href="/sell" className="bouton bouton-principal desktop-only" style={{ padding: '9px 16px' }}>
            <Icone nom="plus" taille={18} epaisseur={2.2} />
            Vendre
          </a>
        </nav>
      </div>
    </header>
  )
}
