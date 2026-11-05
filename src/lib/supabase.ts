import { createClient, type User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Beaucoup de téléphones et d'ordinateurs ont une heure fausse (mauvais fuseau, heure réglée à la main).
// Supabase fournit l'heure d'expiration de la session selon l'horloge du serveur : avec une horloge
// en avance, le navigateur croit la session expirée, la renouvelle en boucle, Supabase bloque
// (erreur 429) et la personne est déconnectée. On recalcule donc l'expiration avec l'horloge
// de l'appareil : heure d'enregistrement + durée de validité du jeton.
function contenuJeton(jwt: string): { iat?: number; exp?: number } | null {
  try {
    const b = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b.padEnd(Math.ceil(b.length / 4) * 4, '=')))
  } catch { return null }
}

const stockageSession = typeof window === 'undefined' ? undefined : {
  getItem(cle: string) {
    try { return window.localStorage.getItem(cle) } catch { return null }
  },
  removeItem(cle: string) {
    try { window.localStorage.removeItem(cle) } catch { /* stockage indisponible */ }
  },
  setItem(cle: string, valeur: string) {
    let aEcrire = valeur
    try {
      const session = JSON.parse(valeur)
      if (session && typeof session.access_token === 'string' && session.expires_at) {
        const avant = JSON.parse(window.localStorage.getItem(cle) || 'null')
        if (avant && avant.access_token === session.access_token && avant.expires_at) {
          // Même jeton réenregistré : on garde l'expiration déjà calculée
          session.expires_at = avant.expires_at
        } else {
          const jeton = contenuJeton(session.access_token)
          if (jeton?.exp && jeton?.iat && jeton.exp > jeton.iat) {
            session.expires_at = Math.floor(Date.now() / 1000) + (jeton.exp - jeton.iat)
          }
        }
        aEcrire = JSON.stringify(session)
      }
    } catch { /* autre donnée que la session : enregistrée telle quelle */ }
    try { window.localStorage.setItem(cle, aEcrire) } catch { /* stockage indisponible */ }
  },
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { storage: stockageSession },
})

export type Profil = {
  id: string
  prenom: string | null
  nom: string | null
  telephone: string | null
  ville: string | null
}

// Renvoie le profil du compte connecté et le crée s'il manque
// (comptes créés avant la correction, ou création automatique pas encore faite).
export async function assurerProfil(user: User): Promise<Profil> {
  const { data } = await supabase
    .from('profiles')
    .select('id, prenom, nom, telephone, ville')
    .eq('id', user.id)
    .maybeSingle()
  if (data) return data as Profil

  const m = (user.user_metadata || {}) as Record<string, string | undefined>
  const profil: Profil = {
    id: user.id,
    prenom: m.prenom?.trim() || null,
    nom: m.nom?.trim() || null,
    telephone: m.telephone?.trim() || null,
    ville: m.ville?.trim() || 'Lubumbashi',
  }
  const { error } = await supabase.from('profiles').insert(profil)
  // 23505 : le profil vient d'être créé en parallèle, ce n'est pas une erreur
  if (error && error.code !== '23505') throw error
  return profil
}
