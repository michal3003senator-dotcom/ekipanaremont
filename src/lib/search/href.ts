import type { SearchParams } from './params'

// Osobny moduł bez Zod: używany w komponentach klienckich (wyszukiwarka, filtry), schemat zostaje na serwerze.

/** Adres wyników dla parametrów; `patch` nadpisuje wybrane, a zmiana filtrów wraca na 1. stronę. */
export function searchHref(params: SearchParams, patch: Partial<SearchParams> = {}): string {
  const next = { ...params, ...patch }
  if (!('strona' in patch)) delete next.strona
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
    else if (!(key === 'strona' && value === 1)) query.set(key, String(value))
  }
  const text = query.toString()
  return text ? `/szukaj?${text}` : '/szukaj'
}
