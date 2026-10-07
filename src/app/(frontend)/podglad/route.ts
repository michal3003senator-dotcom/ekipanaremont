import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { getEditorialStaff } from '@/lib/auth/session'
import { SAFE_PATH } from '@/lib/content/paths'

const query = z.object({
  sciezka: z.string().max(300).regex(SAFE_PATH).optional(),
  wyjdz: z.literal('1').optional(),
})

/**
 * Wejście w podgląd na żywo (ADR 0023): tylko redakcja z 2FA włącza tryb szkicu i trafia na stronę.
 * `?wyjdz=1` wyłącza podgląd. Ścieżka tylko w obrębie serwisu (bez przekierowań na zewnątrz).
 */
export async function GET(request: NextRequest) {
  const parsed = query.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return new Response('Nieprawidłowy adres podglądu.', { status: 400 })
  const mode = await draftMode()
  if (parsed.data.wyjdz) {
    mode.disable()
    redirect(parsed.data.sciezka ?? '/')
  }
  if (!(await getEditorialStaff())) {
    return new Response('Podgląd jest dostępny po zalogowaniu do panelu z kodem 2FA.', {
      status: 403,
    })
  }
  mode.enable()
  redirect(parsed.data.sciezka ?? '/')
}
