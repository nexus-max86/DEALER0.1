'use client'
import { useState, useSyncExternalStore } from 'react'
import Icone from './Icone'
import { dejaInstallee, ecouterInvite, estAndroid, estIphone, inviteDisponible, lancerInstallation, navigateurIntegre } from '@/lib/installation'

type Plateforme = 'android' | 'iphone'

const rien = () => () => {}
function useClient<T>(lire: () => T, serveur: T) {
  return useSyncExternalStore(rien, lire, () => serveur)
}

/* ---------- Mini-écrans illustrant chaque étape ---------- */

function Telephone({ children, bas }: { children: React.ReactNode; bas?: React.ReactNode }) {
  return (
    <div className="gi-tel" aria-hidden="true">
      <div className="gi-ecran">{children}</div>
      {bas}
    </div>
  )
}

function BarreChrome({ menuActif = false }: { menuActif?: boolean }) {
  return (
    <div className="gi-barre">
      <span className="gi-adresse"><Icone nom="bouclier" taille={11} /> dealer-0-1.vercel.app</span>
      <span className={'gi-points' + (menuActif ? ' gi-cible' : '')}>⋮</span>
    </div>
  )
}

function ContenuSite() {
  return (
    <div className="gi-site">
      <div className="gi-site-logo"><span className="logo-marque" /> DEALER</div>
      <div className="gi-ligne l1" /><div className="gi-ligne l2" />
      <div className="gi-tuiles"><i /><i /><i /><i /></div>
    </div>
  )
}

function EcranAccueilTel() {
  return (
    <div className="gi-accueil">
      {Array.from({ length: 4 }).map((_, i) => <i key={'a' + i} />)}
      <span className="gi-appli gi-cible-douce"><img src="/icons/icon-192.png" alt="" /><b>DEALER</b></span>
      {Array.from({ length: 7 }).map((_, i) => <i key={'b' + i} />)}
    </div>
  )
}

const ETAPES_ANDROID = [
  { titre: 'Ouvre DEALER dans Chrome', texte: 'Tape dealer-0-1.vercel.app dans la barre d’adresse tout en haut, ou ouvre le lien qu’on t’a envoyé.',
    visuel: <Telephone><BarreChrome /><ContenuSite /></Telephone> },
  { titre: 'Touche les 3 points ⋮', texte: 'Ils sont en haut à droite de Chrome. Si DEALER affiche déjà un bouton « Installer », touche-le et passe à l’étape 4.',
    visuel: <Telephone><BarreChrome menuActif /><ContenuSite /></Telephone> },
  { titre: 'Choisis « Installer l’application »', texte: 'Selon ton téléphone, ce choix peut s’appeler « Ajouter à l’écran d’accueil ».',
    visuel: (
      <Telephone>
        <BarreChrome menuActif />
        <div className="gi-menu">
          <span>Nouvel onglet</span><span>Favoris</span><span>Historique</span>
          <span className="gi-cible"><Icone nom="installer" taille={13} /> Installer l’application</span>
          <span>Paramètres</span>
        </div>
      </Telephone>
    ) },
  { titre: 'Confirme avec « Installer »', texte: 'Le téléphone te montre l’icône DEALER : touche « Installer ».',
    visuel: (
      <Telephone>
        <ContenuSite />
        <div className="gi-voile" />
        <div className="gi-dialogue">
          <p className="gi-dialogue-titre">Installer l’application ?</p>
          <div className="gi-dialogue-appli"><img src="/icons/icon-192.png" alt="" /> <span><b>DEALER</b><br />dealer-0-1.vercel.app</span></div>
          <div className="gi-dialogue-boutons"><span>Annuler</span><span className="gi-cible gi-plein">Installer</span></div>
        </div>
      </Telephone>
    ) },
  { titre: 'C’est prêt !', texte: 'DEALER est sur ton écran d’accueil. Touche l’icône : il s’ouvre en plein écran, comme une appli.',
    visuel: <Telephone><EcranAccueilTel /></Telephone> },
]

const ETAPES_IPHONE = [
  { titre: 'Ouvre DEALER dans Safari', texte: 'Safari est le navigateur à la boussole bleue. Tape dealer-0-1.vercel.app dans la barre d’adresse.',
    visuel: <Telephone bas={<div className="gi-safari"><span className="gi-adresse">dealer-0-1.vercel.app</span></div>}><ContenuSite /></Telephone> },
  { titre: 'Touche le bouton Partager', texte: 'C’est le carré avec une flèche vers le haut, en bas de l’écran (en haut sur iPad).',
    visuel: (
      <Telephone bas={<div className="gi-safari gi-safari-outils"><span>‹</span><span>›</span><span className="gi-cible"><Icone nom="partagerIos" taille={15} /></span><span>⌑</span><span>⧉</span></div>}>
        <ContenuSite />
      </Telephone>
    ) },
  { titre: 'Touche « Sur l’écran d’accueil »', texte: 'Fais défiler la liste vers le bas si tu ne le vois pas tout de suite.',
    visuel: (
      <Telephone>
        <div className="gi-voile" />
        <div className="gi-feuille">
          <span>Copier</span><span>Ajouter aux favoris</span>
          <span className="gi-cible"><span className="gi-plus">+</span> Sur l’écran d’accueil</span>
          <span>Imprimer</span>
        </div>
      </Telephone>
    ) },
  { titre: 'Touche « Ajouter »', texte: 'En haut à droite. Tu peux garder le nom « DEALER ».',
    visuel: (
      <Telephone>
        <div className="gi-ajout-entete"><span>Annuler</span><b>Écran d’accueil</b><span className="gi-cible gi-texte-bleu">Ajouter</span></div>
        <div className="gi-dialogue-appli gi-ajout"><img src="/icons/icon-192.png" alt="" /> <span><b>DEALER</b><br />dealer-0-1.vercel.app</span></div>
      </Telephone>
    ) },
  { titre: 'C’est prêt !', texte: 'DEALER est sur ton écran d’accueil. Touche l’icône : il s’ouvre en plein écran, comme une appli.',
    visuel: <Telephone><EcranAccueilTel /></Telephone> },
]

export default function GuideInstallation() {
  const detectee = useClient<Plateforme | null>(() => (estIphone() ? 'iphone' : estAndroid() ? 'android' : null), null)
  const installee = useClient(dejaInstallee, false)
  const integre = useClient(navigateurIntegre, null)
  const inviteDispo = useSyncExternalStore(ecouterInvite, () => !!inviteDisponible(), () => false)
  const [choix, setChoix] = useState<Plateforme | null>(null)
  const [info, setInfo] = useState('')
  const plateforme: Plateforme = choix || detectee || 'android'
  const etapes = plateforme === 'android' ? ETAPES_ANDROID : ETAPES_IPHONE

  async function installerMaintenant() {
    const r = await lancerInstallation()
    if (r === 'accepted') setInfo('DEALER s’installe sur ton téléphone. Regarde ton écran d’accueil !')
  }

  async function partager() {
    const url = window.location.origin + '/installer'
    try {
      if (navigator.share) { await navigator.share({ title: 'Installer DEALER', text: 'Installe DEALER sur ton téléphone :', url }); return }
      await navigator.clipboard.writeText(url)
      setInfo('Lien copié : colle-le dans WhatsApp pour le partager.')
    } catch { /* partage annulé */ }
  }

  async function copierLien() {
    try { await navigator.clipboard.writeText(window.location.origin + '/installer'); setInfo('Lien copié. Colle-le dans ' + (estIphone() ? 'Safari' : 'Chrome') + '.') } catch { /* presse-papiers indisponible */ }
  }

  return (
    <main className="gi">
      <div className="gi-entete">
        <img src="/icons/icon-192.png" alt="" width={76} height={76} className="gi-icone" />
        <h1>Installe DEALER sur ton téléphone</h1>
        <p>Gratuit, sans Play Store ni App Store, en moins d’une minute. Ensuite, DEALER s’ouvre comme une appli depuis ton écran d’accueil.</p>
      </div>

      {installee && (
        <div className="carte gi-alerte gi-ok"><Icone nom="verifie" taille={22} /><div><b>DEALER est déjà installé sur cet appareil.</b><br />Tu l’as ouvert depuis ton écran d’accueil : tout est bon.</div></div>
      )}

      {!installee && integre && (
        <div className="carte gi-alerte gi-attention">
          <Icone nom="sortie" taille={22} />
          <div>
            <b>Tu as ouvert DEALER dans {integre}.</b><br />
            Depuis là, l’installation n’est pas possible. Touche <b>⋮</b> ou <b>⋯</b> en haut de l’écran, puis <b>« Ouvrir dans {plateforme === 'iphone' ? 'Safari' : 'Chrome'} »</b> (ou « Ouvrir dans le navigateur »).
            <div><button type="button" className="lien-discret" onClick={copierLien} style={{ marginTop: 8 }}>Copier le lien de cette page</button></div>
          </div>
        </div>
      )}

      {!installee && inviteDispo && (
        <div className="carte gi-rapide">
          <p><b>Ton téléphone peut installer DEALER en un geste.</b></p>
          <button type="button" className="bouton bouton-principal" onClick={installerMaintenant} style={{ width: '100%', padding: '14px 18px', fontSize: 16 }}>
            <Icone nom="installer" taille={20} /> Installer DEALER maintenant
          </button>
          <p className="gi-petit">Ou suis les étapes ci-dessous.</p>
        </div>
      )}

      {info && <p className="gi-info" role="status">{info}</p>}

      <div className="gi-onglets" role="tablist" aria-label="Type de téléphone">
        {(['android', 'iphone'] as Plateforme[]).map(p => (
          <button key={p} type="button" role="tab" aria-selected={plateforme === p} className={plateforme === p ? 'actif' : ''} onClick={() => setChoix(p)}>
            {p === 'android' ? 'Android' : 'iPhone'}
            {detectee === p && <span className="gi-ton">ton téléphone</span>}
          </button>
        ))}
      </div>

      <ol className="gi-etapes">
        {etapes.map((e, i) => (
          <li key={plateforme + i} className="carte gi-etape">
            <div className="gi-visuel">{e.visuel}</div>
            <div className="gi-texte">
              <span className="gi-numero">{i + 1}</span>
              <h2>{e.titre}</h2>
              <p>{e.texte}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="carte gi-aide">
        <h2>Ça ne marche pas ?</h2>
        {plateforme === 'android' ? (
          <ul>
            <li><b>Pas de « Installer l’application » dans le menu ?</b> Vérifie que tu es bien dans <b>Chrome</b> et mets-le à jour depuis le Play Store.</li>
            <li><b>Samsung Internet :</b> touche le menu <b>≡</b> en bas, puis <b>« Ajouter la page à »</b> et <b>« Écran d’accueil »</b>.</li>
            <li><b>Ouvert depuis WhatsApp ou Facebook ?</b> Ouvre d’abord le lien dans Chrome (menu <b>⋮</b> → « Ouvrir dans Chrome »).</li>
          </ul>
        ) : (
          <ul>
            <li><b>Pas de « Sur l’écran d’accueil » ?</b> Vérifie que tu es dans <b>Safari</b>, puis fais défiler toute la liste de partage.</li>
            <li><b>Chrome sur iPhone :</b> touche le bouton Partager à droite de la barre d’adresse, puis « Sur l’écran d’accueil » (iOS 16.4 ou plus récent).</li>
            <li><b>Ouvert depuis WhatsApp ou Facebook ?</b> Touche l’icône boussole ou « Ouvrir dans Safari » en bas de l’écran.</li>
          </ul>
        )}
      </div>

      <div className="gi-avantages">
        <div><Icone nom="horloge" /><b>En un geste</b><span>DEALER s’ouvre directement, sans chercher le lien.</span></div>
        <div><Icone nom="bouclier" /><b>Léger et sûr</b><span>Presque aucune place prise, mises à jour automatiques.</span></div>
        <div><Icone nom="cadeau" /><b>Gratuit</b><span>Rien à payer, ni pour installer ni pour vendre.</span></div>
      </div>

      <div className="gi-partage">
        <p>Aide tes amis à installer DEALER :</p>
        <button type="button" className="bouton bouton-secondaire" onClick={partager}><Icone nom="partager" taille={18} /> Partager ce guide</button>
      </div>
    </main>
  )
}
