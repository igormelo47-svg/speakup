import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://vonai.com.br'
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/aplicativo-para-aprender-ingles`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/teste-de-nivel-de-ingles`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/planos`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/professor-de-ingles-com-ia`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/erros-de-ingles-do-brasileiro`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/cadastro`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/suporte`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/termos`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacidade`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/excluir-conta`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
