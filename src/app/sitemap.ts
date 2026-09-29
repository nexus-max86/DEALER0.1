import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://dealer-luba.vercel.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://dealer-luba.vercel.app/sell', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://dealer-luba.vercel.app/auth', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://dealer-luba.vercel.app/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://dealer-luba.vercel.app/confidentialite', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://dealer-luba.vercel.app/rgpd', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
