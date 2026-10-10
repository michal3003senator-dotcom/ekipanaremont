import { headers } from 'next/headers'

import { hmacFor } from '@/lib/crypto'
import { clientIp } from '@/lib/security/api-guard'

/**
 * Skrót adresu IP klienta (HMAC, cel `ip`) – do limitów i zapisu w bazie. Surowe IP nie jest
 * nigdzie zapisywane ani logowane. Vercel ustawia `x-forwarded-for` (pierwszy adres to klient).
 */
export async function clientIpHash(): Promise<string> {
  return hmacFor('ip', clientIp(await headers()))
}
