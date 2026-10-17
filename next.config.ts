import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // anciennes pages de démonstration
      { source: '/vendre', destination: '/sell', permanent: false },
      { source: '/produit/:id', destination: '/product/:id', permanent: false },
      { source: '/boutique/:id', destination: '/profile/:id', permanent: false },
    ]
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]}]
  },
}
export default nextConfig
