'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { heureMessage } from '@/lib/catalogue'
import { useNonLus, rafraichirNonLus } from '@/lib/useCompte'
import Icone from './Icone'

type Notif = { id: string; type: string | null; titre: string | null; contenu: string | null; lien: string | null; lu: boolean; created_at: string }

export default function NotifBell({ userId }: { userId: string }) {
  const { notifications: count } = useNonLus(userId)
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const boite = useRef<HTMLDivElement>(null)

  async function charger() {
    const { data } = await supabase.from('notifications').select('id, type, titre, contenu, lien, lu, created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(15)
    setNotifs((data as Notif[]) || [])
  }

  useEffect(() => { if (open) charger() }, [open, count])

  // Ferme la liste au clic en dehors
  useEffect(() => {
    if (!open) return
    const fermer = (e: MouseEvent) => { if (boite.current && !boite.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fermer)
    return () => document.removeEventListener('mousedown', fermer)
  }, [open])

  async function toutMarquerLu() {
    await supabase.from('notifications').update({ lu: true }).eq('user_id', userId).eq('lu', false)
    setNotifs(notifs.map(n => ({ ...n, lu: true })))
    rafraichirNonLus()
  }

  async function ouvrir(n: Notif) {
    if (!n.lu) await supabase.from('notifications').update({ lu: true }).eq('id', n.id)
    rafraichirNonLus()
    window.location.href = n.lien || '/'
  }

  return (
    <div ref={boite} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)} className="entete-lien" aria-expanded={open}
        aria-label={'Notifications' + (count ? ', ' + count + ' non lues' : '')}>
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <Icone nom="cloche" />
          {count > 0 && <span className="pastille">{count > 9 ? '9+' : count}</span>}
        </span>
        <span className="desktop-only">Alertes</span>
      </button>

      {open && (
        <div className="menu-deroulant" role="dialog" aria-label="Notifications">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Notifications</p>
            {count > 0 && <button type="button" onClick={toutMarquerLu} className="lien-discret">Tout marquer comme lu</button>}
          </div>
          {notifs.length === 0 ? (
            <p style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Aucune notification. Tu seras prévenu ici des nouveaux messages et des changements de disponibilité de tes favoris.
            </p>
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifs.map(n => (
                <button key={n.id} type="button" onClick={() => ouvrir(n)} className="notif-ligne" style={{ background: n.lu ? 'white' : 'var(--primary-light)' }}>
                  <span className="notif-icone" style={{ color: n.type === 'message' ? 'var(--primary)' : 'var(--cuivre)' }}>
                    <Icone nom={n.type === 'message' ? 'message' : n.type === 'moderation' ? 'bouclier' : 'etiquette'} taille={18} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: n.lu ? 500 : 700, color: 'var(--text)' }}>{n.titre}</span>
                    {n.contenu && <span style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.contenu}</span>}
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{heureMessage(n.created_at)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
