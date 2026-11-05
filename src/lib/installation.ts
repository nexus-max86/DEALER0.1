// Installation de DEALER sur l'écran d'accueil (PWA) : état partagé entre le bandeau et la page /installer

// Événement « beforeinstallprompt » (Android / Chrome) : pas encore typé par TypeScript
export type InviteInstallation = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let invite: InviteInstallation | null = null
const EVENEMENT = 'dealer:installable'

// Appelé par le bandeau quand le navigateur autorise l'installation
export function memoriserInvite(e: InviteInstallation | null) {
  invite = e
  window.dispatchEvent(new Event(EVENEMENT))
}

export function inviteDisponible() {
  return invite
}

export function ecouterInvite(rappel: () => void) {
  window.addEventListener(EVENEMENT, rappel)
  return () => window.removeEventListener(EVENEMENT, rappel)
}

// Ouvre la fenêtre d'installation du navigateur (Android / Chrome / Edge)
export async function lancerInstallation(): Promise<'accepted' | 'dismissed' | 'indisponible'> {
  const e = invite
  if (!e) return 'indisponible'
  await e.prompt()
  const { outcome } = await e.userChoice
  memoriserInvite(null)
  return outcome
}

export function dejaInstallee() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function estIphone() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

export function estAndroid() {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
}

// Navigateur intégré à une application (on ne peut pas installer depuis là)
export function navigateurIntegre(): 'Facebook' | 'Instagram' | 'WhatsApp' | 'une application' | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return 'Facebook'
  if (/Instagram/.test(ua)) return 'Instagram'
  if (/WhatsApp/i.test(ua)) return 'WhatsApp'
  if (/Android/.test(ua) && /; wv\)/.test(ua)) return 'une application'
  return null
}
