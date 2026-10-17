import { createClient, type User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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
