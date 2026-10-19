import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { timingSafeEqual } from 'node:crypto'

// Comparaison à temps constant, pour ne rien laisser deviner de la clé
function cleValide(saisie: unknown): saisie is string {
  const attendue = process.env.ADMIN_SECRET_KEY
  if (!attendue || typeof saisie !== 'string') return false
  const a = Buffer.from(saisie)
  const b = Buffer.from(attendue)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const { key } = await request.json().catch(() => ({ key: null }))
  if (cleValide(key)) {
    const cookieStore = await cookies()
    cookieStore.set('admin-key', key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Déconnexion : le cookie est « httpOnly », seul le serveur peut l'effacer
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-key')
  return NextResponse.json({ success: true })
}
