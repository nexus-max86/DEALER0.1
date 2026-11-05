'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Icone from './Icone'
import {
  dejaInstallee, ecouterInvite, estAndroid, estIphone, inviteDisponible, lancerInstallation,
  memoriserRefus, navigateurIntegre, nouveauCompteAProposer, oublierNouveauCompte,
} from '@/lib/installation'

type Mode = 'android' | 'iphone' | 'guide'

// Pages où l'on ne dérange pas la personne (connexion, admin, conversation, guide déjà ouvert)
function pageExclue(chemin: string) {
  return chemin.startsWith('/auth') || chemin.startsWith('/admin') || chemin.startsWith('/messages/') || chemin.startsWith('/installer')
}

// Juste après la création du compte : propose d'installer DEALER sur l'écran d'accueil (une seule fois)
export default function BienvenueInstallation() {
  const chemin = usePathname() || '/'
  const [mode, setMode] = useState<Mode | null>(null)
  const [installation, setInstallation] = useState(false)

  useEffect(() => {
    if (!nouveauCompteAProposer() || pageExclue(chemin)) return
    if (dejaInstallee()) { oublierNouveauCompte(); return }

    function choisir() {
      if (!nouveauCompteAProposer()) return
      let m: Mode | null = null
      if (inviteDisponible()) m = 'android'
      else if (navigateurIntegre()) m = 'guide'
      else if (estIphone()) m = 'iphone'
      else if (estAndroid()) m = 'guide'
      if (!m) return
      oublierNouveauCompte() // affichée une seule fois
      setMode(m)
    }

    // Laisse au navigateur le temps d'autoriser l'installation en un geste (Android)
    const arreter = ecouterInvite(choisir)
    const minuteur = window.setTimeout(() => {
      choisir()
      if (nouveauCompteAProposer()) oublierNouveauCompte() // ordinateur sans installation possible
    }, 2500)
    return () => { arreter(); window.clearTimeout(minuteur) }
  }, [chemin])

  if (!mode) return null

  function fermer() {
    memoriserRefus()
    setMode(null)
  }

  async function installer() {
    setInstallation(true)
    const r = await lancerInstallation()
    setInstallation(false)
    if (r === 'dismissed') memoriserRefus()
    if (r === 'indisponible') { setMode('guide'); return }
    setMode(null)
  }

  return (
    <div className="bienvenue-fond" role="dialog" aria-modal="true" aria-labelledby="bienvenue-titre">
      <div className="bienvenue">
        <img src="/icons/icon-192.png" alt="" width={68} height={68} className="bienvenue-icone" />
        <p className="bienvenue-ok"><Icone nom="verifie" taille={16} /> Ton compte est créé</p>
        <h2 id="bienvenue-titre">Installe DEALER sur ton téléphone</h2>
        <p className="bienvenue-texte">Retrouve DEALER en un geste sur ton écran d’accueil, pour publier et répondre aux acheteurs plus vite. C’est gratuit et ça prend quelques secondes.</p>

        {mode === 'android' && (
          <button type="button" className="bouton bouton-principal bienvenue-bouton" onClick={installer} disabled={installation}>
            <Icone nom="installer" taille={20} /> {installation ? 'Installation…' : 'Installer DEALER'}
          </button>
        )}

        {mode === 'iphone' && (
          <>
            <ol className="bienvenue-etapes">
              <li><span>1</span> Touche <Icone nom="partagerIos" taille={17} style={{ display: 'inline', verticalAlign: '-3px', color: 'var(--primary)' }} titre="Partager" /> <b>Partager</b> en bas de Safari</li>
              <li><span>2</span> Choisis <b>« Sur l’écran d’accueil »</b></li>
              <li><span>3</span> Touche <b>« Ajouter »</b></li>
            </ol>
            <a href="/installer" className="bouton bouton-secondaire bienvenue-bouton">Voir le guide en images</a>
          </>
        )}

        {mode === 'guide' && (
          <a href="/installer" className="bouton bouton-principal bienvenue-bouton"><Icone nom="installer" taille={20} /> Voir comment l’installer</a>
        )}

        <button type="button" className="bienvenue-plus-tard" onClick={fermer}>Plus tard</button>
      </div>
    </div>
  )
}
