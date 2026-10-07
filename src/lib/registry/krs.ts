import { z } from 'zod'

import type { Fetch, RegistryRecord } from './types'

const BASE = 'https://api-krs.ms.gov.pl/api/krs/OdpisAktualny'

const address = z
  .object({
    ulica: z.string().nullish(),
    nrDomu: z.string().nullish(),
    nrLokalu: z.string().nullish(),
    miejscowosc: z.string().nullish(),
    kodPocztowy: z.string().nullish(),
  })
  .partial()

/** Odpis aktualny z otwartego API KRS (Ministerstwo Sprawiedliwości), szukanie po numerze KRS. */
const response = z.object({
  odpis: z.object({
    dane: z.object({
      dzial1: z.object({
        danePodmiotu: z.object({
          nazwa: z.string(),
          identyfikatory: z
            .object({ nip: z.string().nullish(), regon: z.string().nullish() })
            .partial(),
        }),
        siedzibaIAdres: z.object({ adres: address.nullish() }).partial(),
      }),
    }),
  }),
})

function formatAddress(value: z.infer<typeof address> | null | undefined): string | null {
  if (!value) return null
  const street = [value.ulica, [value.nrDomu, value.nrLokalu].filter(Boolean).join('/')]
    .filter(Boolean)
    .join(' ')
  const city = [value.kodPocztowy, value.miejscowosc].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || null
}

/** KRS nie wyszukuje po NIP – numer KRS bierzemy z Białej listy. Najpierw rejestr przedsiębiorców (P). */
export async function krsLookup(
  krs: string,
  nip: string,
  fetchImpl: Fetch,
): Promise<RegistryRecord | null> {
  for (const register of ['P', 'S']) {
    const res = await fetchImpl(`${BASE}/${krs}?rejestr=${register}&format=json`, {
      signal: AbortSignal.timeout(8000),
    })
    if (res.status === 404) continue
    if (!res.ok) throw new Error(`KRS: HTTP ${res.status}`)
    const { dzial1 } = response.parse(await res.json()).odpis.dane
    return {
      source: 'krs',
      nip,
      name: dzial1.danePodmiotu.nazwa,
      address: formatAddress(dzial1.siedzibaIAdres.adres),
      active: true,
      regon: dzial1.danePodmiotu.identyfikatory.regon ?? null,
      krs,
      checkedAt: new Date().toISOString(),
    }
  }
  return null
}
