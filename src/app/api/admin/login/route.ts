import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { key } = await request.json()
  if (key === process.env.ADMIN_SECRET_KEY) {
    const cookieStore = await cookies()
    cookieStore.set('admin-key', key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
