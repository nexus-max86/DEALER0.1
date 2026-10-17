import { createClient } from '@supabase/supabase-js'

// Client Supabase pour les pages rendues côté serveur (lecture publique, sans session)
export function clientServeur() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
