// Jeu d'icônes au trait, homogène sur tout le site (remplace les émojis)
const CHEMINS: Record<string, React.ReactNode> = {
  accueil: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-6h4v6h5V9.5" /></>,
  recherche: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  message: <><path d="M4 5h16v11H8l-4 4z" /><path d="M8 9.5h8" /><path d="M8 12.5h5" /></>,
  utilisateur: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  coeur: <path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  cloche: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  lieu: <><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" /><circle cx="12" cy="9.8" r="2.3" /></>,
  envoyer: <><path d="M4 12 20 4l-5 16-3-7z" /><path d="m12 13 8-9" /></>,
  telephone: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />,
  whatsapp: <><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.7z" /><path d="M9.2 8.8c.2-.6.7-.6 1-.6l.7 1.6-.6.9a5 5 0 0 0 2.6 2.6l.9-.6 1.6.7c0 .3 0 .8-.6 1-1.8.7-5.4-1.8-5.6-5.6z" /></>,
  partager: <><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4.1" /><path d="m8.2 13.2 7.6 4.1" /></>,
  oeil: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  boite: <><path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4z" /><path d="m3.5 7.5 8.5 4 8.5-4" /><path d="M12 11.5v9" /></>,
  etiquette: <><path d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5z" /><circle cx="8" cy="8.5" r="1.5" /></>,
  graphique: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M21 20H3" /></>,
  photo: <><path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  verifie: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  horloge: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  cadeau: <><path d="M4 10h16v10H4z" /><path d="M3 7h18v3H3z" /><path d="M12 7v13" /><path d="M12 7c-2-3.5-5.5-3-5.5-1S9 7 12 7c3 0 5.5-1 5.5-1S14 3.5 12 7z" /></>,
  retour: <><path d="M15 5 8 12l7 7" /></>,
  suite: <><path d="m9 5 7 7-7 7" /></>,
  fermer: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
  sortie: <><path d="M14 4h5v16h-5" /><path d="M10 8 6 12l4 4" /><path d="M6 12h10" /></>,
  crayon: <><path d="m4 20 1-4L16 5l3 3L8 19z" /><path d="m14 7 3 3" /></>,
  poubelle: <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></>,
  filtre: <><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" /></>,
  bouclier: <><path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-4.5" /></>,
}

export type NomIcone = keyof typeof CHEMINS

export default function Icone({ nom, taille = 20, epaisseur = 1.8, style, titre }: {
  nom: string
  taille?: number
  epaisseur?: number
  style?: React.CSSProperties
  titre?: string
}) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={epaisseur}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden={titre ? undefined : true} role={titre ? 'img' : undefined}
      style={{ flexShrink: 0, ...style }}>
      {titre && <title>{titre}</title>}
      {CHEMINS[nom] || null}
    </svg>
  )
}
