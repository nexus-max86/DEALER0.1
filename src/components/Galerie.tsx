'use client'
import { useState } from 'react'

export default function Galerie({ images, titre, icone }: { images: string[]; titre: string; icone: string }) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 12, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', fontSize: 96 }}>
        <span role="img" aria-label={titre}>{icone}</span>
      </div>
    )
  }

  return (
    <div>
      <div style={{ background: '#0b1b1f', borderRadius: 12, aspectRatio: '1', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 10 }}>
        <img src={images[active]} alt={titre + ' (photo ' + (active + 1) + ')'} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
      {images.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => setActive(i)} aria-label={'Voir la photo ' + (i + 1)}
              style={{ padding: 0, aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: i === active ? '2px solid var(--primary)' : '1px solid var(--border)', background: 'var(--surface)' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
