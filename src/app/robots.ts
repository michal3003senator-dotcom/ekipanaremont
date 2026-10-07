import type { MetadataRoute } from 'next'

const site = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

/** Panel firmy, API i panel admina poza indeksem; wyniki z filtrami mają `noindex` na stronie. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/panel', '/api', '/admin', '/opinia'] },
    sitemap: new URL('/sitemap.xml', site).toString(),
  }
}
