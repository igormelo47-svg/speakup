import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    // /baixar é só um redirecionamento por aparelho — indexar ele competiria com as
    // páginas de verdade na busca.
    // "/app" sem barra casa por PREFIXO e bloqueava também /aplicativo-para-aprender-ingles,
    // a página de destino do Google Ads — era a causa da "experiência da página de destino
    // abaixo da média". "$" prende a regra no fim da URL (Google e Bing entendem).
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/app$', '/app/', '/reset', '/baixar'] },
    sitemap: 'https://vonai.com.br/sitemap.xml',
  }
}
