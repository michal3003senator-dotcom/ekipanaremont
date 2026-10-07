'use client'

import { useEffect } from 'react'

import { recordViewAction } from '@/app/(frontend)/(serwis)/firma/[slug]/actions'

/**
 * Liczy wyświetlenie profilu raz na sesję karty. Działa dopiero w przeglądarce,
 * więc prefetch linków i roboty bez JavaScriptu nie zawyżają statystyk.
 */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    if (navigator.webdriver) return
    const key = `viewed:${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // Bez dostępu do sessionStorage (tryb prywatny, blokada) – liczymy każde wejście.
    }
    void recordViewAction(slug)
  }, [slug])
  return null
}
