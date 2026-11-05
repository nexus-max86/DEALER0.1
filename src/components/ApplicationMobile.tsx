'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Icone from './Icone'
import { memoriserInvite, lancerInstallation, dejaInstallee, estIphone, type InviteInstallation } from '@/lib/installation'

const CLE_REFUS = 'dealer-installation-refus'
const DUREE_REFUS = 14 * 24 * 3600 * 1000 // « Plus tard » : on ne redemande pas avant 14 jours

// Pages où le bandeau peut apparaître (jamais dans une conversation, à la connexion ou dans l'admin)
function pageAutorisee(chemin: string) {
  return ['/', '/search', '/favorites', '/account'].includes(chemin)
    || ['/category/', '/product/', '/profile/'].some(debut => chemin.startsWith(debut))
}

function refusRecent() {
  try {
    const quand = Number(localStorage.getItem(CLE_REFUS))
    return !!quand && Math.abs(Date.now() - quand) < DUREE_REFUS
  } catch { return false }
}

function cookiesRepondus() {
  try { return !!localStorage.getItem('dealer-cookies') } catch { return true }
}

// Enregistre le service worker et propose d'installer DEALER sur l'écran d'accueil
export default function ApplicationMobile() {
  const chemin = usePathname() || '/'
  const [mode, setMode] = useState<'android' | 'iphone' | null>(null)
  const [pret, setPret] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => { /* navigateur non compatible */ })
    }
    if (dejaInstallee()) return

    function surInvite(e: Event) {
      e.preventDefault()
      memoriserInvite(e as InviteInstallation)
      if (!refusRecent()) setMode('android')
    }
    function installee() { setMode(null); memoriserInvite(null) }
    window.addEventListener('beforeinstallprompt', surInvite)
    window.addEventListener('appinstalled', installee)

    // Sur iPhone, Safari n'a pas de bouton « Installer » : on explique la marche à suivre
    const minuteurIphone = estIphone() && !refusRecent() ? window.setTimeout(() => setMode('iphone'), 6000) : undefined

    // On attend que la personne ait répondu au bandeau des cookies, pour ne pas les empiler
    function verifierCookies() { if (cookiesRepondus()) { setPret(true); window.clearInterval(attente) } }
    const attente = window.setInterval(verifierCookies, 1500)
    const premier = window.setTimeout(verifierCookies, 0)

    return () => {
      window.removeEventListener('beforeinstallprompt', surInvite)
      window.removeEventListener('appinstalled', installee)
      window.clearTimeout(minuteurIphone)
      window.clearInterval(attente)
      window.clearTimeout(premier)
    }
  }, [])

  function plusTard() {
    try { localStorage.setItem(CLE_REFUS, String(Date.now())) } catch { /* stockage indisponible */ }
    setMode(null)
  }

  async function installer() {
    const resultat = await lancerInstallation()
    if (resultat === 'dismissed') plusTard()
    setMode(null)
  }

  if (!mode || !pret || !pageAutorisee(chemin)) return null

  return (
    <div role="dialog" aria-label="Installer DEALER" className="cookie-banner" style={{ position: 'fixed', left: 12, right: 12, zIndex: 190 }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 12px 12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,39,48,0.18)' }}>
        <img src="/icons/icon-192.png" alt="" width={44} height={44} style={{ borderRadius: 11, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Installe DEALER sur ton téléphone</p>
          {mode === 'android' ? (
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>Ouvre DEALER comme une appli, en un geste depuis ton écran d’accueil.</p>
          ) : (
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: 2 }}>
              Touche <Icone nom="partagerIos" taille={15} style={{ display: 'inline', verticalAlign: '-3px', color: 'var(--primary)' }} titre="Partager" /> <b>Partager</b>, puis <b>« Sur l’écran d’accueil »</b>. <a href="/installer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>Voir le guide</a>
            </p>
          )}
        </div>
        {mode === 'android' && (
          <button type="button" onClick={installer} className="bouton bouton-principal" style={{ padding: '9px 14px', fontSize: 14, flexShrink: 0 }}>
            <Icone nom="installer" taille={17} /> Installer
          </button>
        )}
        <button type="button" onClick={plusTard} aria-label="Plus tard" title="Plus tard"
          style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0, display: 'inline-flex' }}>
          <Icone nom="fermer" taille={18} />
        </button>
      </div>
    </div>
  )
}
