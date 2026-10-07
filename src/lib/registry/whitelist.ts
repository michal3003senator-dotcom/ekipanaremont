import { z } from 'zod'

import { todayInWarsaw } from '@/lib/format/date'

import type { Fetch, RegistryRecord } from './types'

const BASE = 'https://wl-api.mf.gov.pl/api/search/nip'

/** Odpowiedź API Wykazu podatników VAT (MF): `result.subject` albo `null`, gdy brak w wykazie. */
const response = z.object({
  result: z.object({
    subject: z
      .object({
        name: z.string(),
        nip: z.string(),
        statusVat: z.string().nullish(),
        regon: z.string().nullish(),
        krs: z.string().nullish(),
        workingAddress: z.string().nullish(),
        residenceAddress: z.string().nullish(),
      })
      .nullable(),
  }),
})

/** Biała lista VAT. Nie zawiera firm zwolnionych podmiotowo z rejestracji VAT (SPEC 3.3). */
export async function whitelistLookup(
  nip: string,
  fetchImpl: Fetch,
): Promise<RegistryRecord | null> {
  const url = `${BASE}/${nip}?date=${todayInWarsaw()}`
  const res = await fetchImpl(url, {
    signal: AbortSignal.timeout(8000),
    headers: { accept: 'application/json' },
  })
  if (res.status === 400 || res.status === 404) return null
  if (!res.ok) throw new Error(`Biała lista: HTTP ${res.status}`)
  const { subject } = response.parse(await res.json()).result
  if (!subject) return null
  return {
    source: 'vat',
    nip,
    name: subject.name,
    address: subject.workingAddress ?? subject.residenceAddress ?? null,
    active: subject.statusVat === 'Czynny' || subject.statusVat === 'Zwolniony',
    regon: subject.regon ?? null,
    krs: subject.krs ?? null,
    checkedAt: new Date().toISOString(),
  }
}
