import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/** Global `settings` (flagi, dni, wersje dokumentów) – raz na żądanie, odczyt systemowy. */
export const getSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
})
