import { headers } from 'next/headers'

import { hmacFor } from '@/lib/crypto'

/**
 * Skrót adresu IP klienta (HMAC, cel `ip`) – do limitów i zapisu w bazie. Surowe IP nie jest
 * nigdzie zapisywane ani logowane. Vercel ustawia `x-forwarded-for` (pierwszy adres to klient).
 */
export async function clientIpHash(): Promise<string> {
  const list = await headers()
  const ip =
    list.get('x-forwarded-for')?.split(',')[0]?.trim() || list.get('x-real-ip') || 'unknown'
  return hmacFor('ip', ip)
}
