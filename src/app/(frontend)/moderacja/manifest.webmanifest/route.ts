import { themeColor } from '@/lib/theme'

/** Manifest aplikacji „Moderacja” (PWA): start w kolejce, bez paska przeglądarki. */
export function GET() {
  return Response.json(
    {
      name: 'Moderacja – Ekipa na Termin',
      short_name: 'Moderacja',
      start_url: '/moderacja',
      scope: '/moderacja',
      display: 'standalone',
      background_color: themeColor('jasny'),
      theme_color: themeColor('jasny'),
      lang: 'pl',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    },
    { headers: { 'content-type': 'application/manifest+json' } },
  )
}
