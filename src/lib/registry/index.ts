import { isValidNip, normalizeNip } from '@/lib/validation'

import { ceidgLookup } from './ceidg'
import { krsLookup } from './krs'
import type { Fetch, LookupResult } from './types'
import { whitelistLookup } from './whitelist'

export type { LookupResult, RegistryRecord, RegistrySource } from './types'

type Options = { fetch?: Fetch; ceidgToken?: string }

/**
 * Weryfikacja NIP (SPEC 3.3, ADR 0019): suma kontrolna, potem CEIDG, Biała lista VAT i KRS
 * (numer KRS z Białej listy). Awaria jednego rejestru nie przerywa sprawdzania kolejnych.
 */
export async function lookupNip(input: string, options: Options = {}): Promise<LookupResult> {
  const nip = normalizeNip(input)
  if (!isValidNip(nip)) return { status: 'not_found' }
  const fetchImpl = options.fetch ?? fetch
  const ceidgToken = options.ceidgToken ?? process.env.CEIDG_API_TOKEN
  let failures = 0

  if (ceidgToken) {
    try {
      const record = await ceidgLookup(nip, ceidgToken, fetchImpl)
      if (record) return { status: 'found', record }
    } catch {
      failures += 1
    }
  }

  try {
    const record = await whitelistLookup(nip, fetchImpl)
    if (record?.krs) {
      try {
        const full = await krsLookup(record.krs, nip, fetchImpl)
        if (full) return { status: 'found', record: full }
      } catch {
        // KRS niedostępny – zostają dane z Białej listy.
      }
    }
    if (record) return { status: 'found', record }
  } catch {
    failures += 1
  }

  // Gdy któryś rejestr nie odpowiedział, brak wyniku nie dowodzi, że firmy nie ma.
  return failures > 0 ? { status: 'unavailable' } : { status: 'not_found' }
}
