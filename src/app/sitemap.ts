import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/catalogue'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: SITE_URL + '/sell', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: SITE_URL + '/auth', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: SITE_URL + '/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: SITE_URL + '/confidentialite', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: SITE_URL + '/rgpd', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
