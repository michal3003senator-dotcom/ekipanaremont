'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { clientIpHash } from '@/lib/auth/request'
import { type LocalityOption, searchLocalities } from '@/lib/localities'
import { rateLimit } from '@/lib/rate-limit'

/** Podpowiedzi miejscowości w wyszukiwarce (publiczne dane TERYT, limit na skrót IP). */
export async function suggestLocalitiesAction(query: unknown): Promise<LocalityOption[]> {
  if (typeof query !== 'string' || query.trim().length < 2) return []
  const limit = await rateLimit('suggest', await clientIpHash())
  if (!limit.ok) return []
  const payload = await getPayload({ config })
  return searchLocalities(payload, query.slice(0, 60), { limit: 8, value: 'slug' })
}
