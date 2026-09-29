'use client'

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
  function handleFav(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <a
      href={'/product/' + product.id}
      className="product-card"
      style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--white)', color: 'var(--text)', position: 'relative' }}
    >
      <div style={{ background: 'var(--surface)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 52 }} role="img" aria-label={product.title}>{product.icon}</span>
        {product.status === 'SOLD' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,39,48,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 6 }}>VENDU</span>
          </div>
        )}
        <button onClick={handleFav} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤍</button>
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
