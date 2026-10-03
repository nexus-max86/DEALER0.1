'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  title: string
  price: string
  brand: string
  size?: string
  condition: string
  city: string
  icon: string
  status?: string
}

export default function ProductCard({ product }: { product: Product }) {
  const [isFav, setIsFav] = useState(false)
  const [favId, setFavId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkFav() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('favoris')
        .select('id')
        .eq('user_id', user.id)
        .eq('produit_id', product.id)
        .single()
      if (data) { setIsFav(true); setFavId(data.id) }
    }
    checkFav()
  }, [product.id])

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) { window.location.href = '/auth'; return }
    if (isFav && favId) {
      await supabase.from('favoris').delete().eq('id', favId)
      setIsFav(false); setFavId(null)
    } else {
      const { data } = await supabase.from('favoris').insert({ user_id: userId, produit_id: product.id }).select('id').single()
      if (data) { setIsFav(true); setFavId(data.id) }
    }
  }

  return (
    <a href={'/product/' + product.id} className="product-card"
      style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)', position: 'relative' }}>
      <div style={{ background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 52 }} role="img" aria-label={product.title}>{product.icon}</span>
        {product.status === 'SOLD' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,39,48,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 6 }}>VENDU</span>
          </div>
        )}
        <button onClick={toggleFav}
          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div style={{ padding: '10px 10px 12px' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 2 }}>{product.brand}</p>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{product.condition}</span>
          {product.size && <><span style={{ color: 'var(--border)' }}>·</span><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{product.size}</span></>}
        </div>
        <p style={{ fontSize: 16, fontWeight: 700 }}>{product.price}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {product.city}</p>
      </div>
    </a>
  )
}
