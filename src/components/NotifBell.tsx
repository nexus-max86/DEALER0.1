'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NotifBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setNotifs(data || [])
      setCount((data || []).filter((n: any) => !n.lu).length)
    }
    load()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function marquerLus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ lu: true }).eq('user_id', user.id).eq('lu', false)
    setCount(0)
    setNotifs(notifs.map(n => ({ ...n, lu: true })))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); if (!open && count > 0) marquerLus() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 10px', position: 'relative', fontSize: 18 }}
      >
        🔔
        {count > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 4, background: '#DC2626', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', width: 300, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>Notifications</p>
          </div>
          {notifs.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
              Aucune notification
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifs.map((n: any) => (
                <a key={n.id} href={n.lien || '#'}
                  style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.lu ? 'white' : 'var(--primary-light)', color: 'var(--text)', textDecoration: 'none' }}>
                  <p style={{ fontSize: 13, fontWeight: n.lu ? 400 : 700 }}>{n.titre}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.contenu}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
