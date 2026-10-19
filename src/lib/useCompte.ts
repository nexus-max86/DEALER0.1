'use client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Compte connecté (null si déconnecté), mis à jour à la connexion et à la déconnexion
export function useUtilisateur() {
  const [user, setUser] = useState<User | null>(null)
  const [pret, setPret] = useState(false)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setPret(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); setPret(true) })
    return () => data.subscription.unsubscribe()
  }, [])
  return { user, pret }
}

// Photo et prénom du compte connecté, pour l'en-tête
export function useProfilCourt(userId: string | undefined) {
  const [profil, setProfil] = useState<{ prenom: string | null; avatar_url: string | null } | null>(null)
  useEffect(() => {
    if (!userId) { setProfil(null); return }
    const charger = () => supabase.from('profiles').select('prenom, avatar_url').eq('id', userId).maybeSingle().then(({ data }) => setProfil(data))
    charger()
    window.addEventListener('dealer:profil', charger)
    return () => window.removeEventListener('dealer:profil', charger)
  }, [userId])
  return profil
}

// Nombre de messages et de notifications non lus, en temps réel
export function useNonLus(userId: string | undefined) {
  const [messages, setMessages] = useState(0)
  const [notifications, setNotifications] = useState(0)
  useEffect(() => {
    if (!userId) { setMessages(0); setNotifications(0); return }
    let actif = true
    async function charger() {
      const [m, n] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('destinataire_id', userId).eq('lu', false),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('lu', false),
      ])
      if (!actif) return
      setMessages(m.count || 0)
      setNotifications(n.count || 0)
    }
    charger()
    const canal = supabase.channel('non-lus-' + userId + '-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: 'destinataire_id=eq.' + userId }, () => { charger() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + userId }, () => { charger() })
      .subscribe()
    window.addEventListener('dealer:non-lus', charger)
    return () => {
      actif = false
      supabase.removeChannel(canal)
      window.removeEventListener('dealer:non-lus', charger)
    }
  }, [userId])
  return { messages, notifications }
}

// À appeler après avoir lu des messages ou des notifications, pour rafraîchir les compteurs
export function rafraichirNonLus() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('dealer:non-lus'))
}
