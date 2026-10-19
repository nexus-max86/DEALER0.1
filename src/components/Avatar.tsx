// Photo de profil, ou initiale du prénom si aucune photo n'a été ajoutée
export default function Avatar({ url, nom, taille = 40 }: { url?: string | null; nom?: string | null; taille?: number }) {
  const initiale = (nom || '?').trim()[0]?.toUpperCase() || '?'
  if (url) {
    return <img src={url} alt={nom ? 'Photo de ' + nom : ''} width={taille} height={taille}
      style={{ width: taille, height: taille, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--surface)' }} />
  }
  return (
    <span aria-hidden="true" style={{ width: taille, height: taille, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: Math.round(taille * 0.42), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {initiale}
    </span>
  )
}
