import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/app', '/reset'] },
    sitemap: 'https://vonai.com.br/sitemap.xml',
  }
}
