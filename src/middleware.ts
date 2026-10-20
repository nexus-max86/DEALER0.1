import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Première barrière de /admin : la clé admin (cookie posé par /api/admin/login).
// La seconde barrière est dans la base : seul le compte administrateur peut modifier quoi que ce soit.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    const attendue = process.env.ADMIN_SECRET_KEY
    const adminKey = request.cookies.get('admin-key')?.value
    // Sans clé configurée sur le serveur, l'accès est toujours refusé
    if (!attendue || adminKey !== attendue) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
