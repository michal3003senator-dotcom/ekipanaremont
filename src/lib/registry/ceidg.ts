import { z } from 'zod'

import type { Fetch, RegistryRecord } from './types'

const BASE = 'https://dane.biznes.gov.pl/api/ceidg/v3/firmy'

/**
 * Odpowiedź CEIDG API v3 (`/firmy?nip=`). Schemat zgodny z dokumentacją dla posiadaczy tokenu;
 * pola opcjonalne, żeby zmiana po stronie rejestru nie blokowała rejestracji (wtedy weryfikacja ręczna).
 */
const response = z.object({
  firmy: z
    .array(
      z.object({
        nazwa: z.string(),
        status: z.string().nullish(),
        adresDzialalnosci: z
          .object({
            ulica: z.string().nullish(),
            budynek: z.string().nullish(),
            lokal: z.string().nullish(),
            miasto: z.string().nullish(),
            kod: z.string().nullish(),
          })
          .partial()
          .nullish(),
        wlasciciel: z.object({ regon: z.string().nullish() }).partial().nullish(),
      }),
    )
    .default([]),
})

/** CEIDG (jednoosobowe działalności). Bez tokenu `CEIDG_API_TOKEN` źródło jest pomijane. */
export async function ceidgLookup(
  nip: string,
  token: string,
  fetchImpl: Fetch,
): Promise<RegistryRecord | null> {
  const res = await fetchImpl(`${BASE}?nip=${nip}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  })
  if (res.status === 204 || res.status === 404) return null
  if (!res.ok) throw new Error(`CEIDG: HTTP ${res.status}`)
  const [firm] = response.parse(await res.json()).firmy
  if (!firm) return null
  const a = firm.adresDzialalnosci
  const street = [a?.ulica, [a?.budynek, a?.lokal].filter(Boolean).join('/')]
    .filter(Boolean)
    .join(' ')
  const city = [a?.kod, a?.miasto].filter(Boolean).join(' ')
  return {
    source: 'ceidg',
    nip,
    name: firm.nazwa,
    address: [street, city].filter(Boolean).join(', ') || null,
    active: (firm.status ?? '').toUpperCase() === 'AKTYWNY',
    regon: firm.wlasciciel?.regon ?? null,
    krs: null,
    checkedAt: new Date().toISOString(),
  }
}
