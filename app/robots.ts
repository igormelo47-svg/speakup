import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    // /baixar é só um redirecionamento por aparelho — indexar ele competiria com as
    // páginas de verdade na busca.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/app', '/reset', '/baixar'] },
    sitemap: 'https://vonai.com.br/sitemap.xml',
  }
}
