'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { z } from 'zod'

import { clientIpHash } from '@/lib/auth/request'
import { rateLimit } from '@/lib/rate-limit'
import { bumpStat } from '@/lib/stats'

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(140)

/** Aktywna firma po adresie (reguły dostępu gościa) – tylko id i telefon. */
async function activeFirm(slug: unknown) {
  const parsed = slugSchema.safeParse(slug)
  if (!parsed.success) return null
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'firms',
    where: { slug: { equals: parsed.data } },
    select: { phone: true },
    depth: 0,
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ? { payload, firm: docs[0] } : null
}

/** „Pokaż numer telefonu” (SPEC 3.2): numer nie trafia do HTML strony, każde pokazanie jest liczone. */
export async function revealPhoneAction(
  slug: unknown,
): Promise<{ ok: true; phone: string } | { ok: false; message: string }> {
  const limit = await rateLimit('phone', await clientIpHash())
  if (!limit.ok) return { ok: false, message: 'Za dużo prób. Spróbuj za kilka minut.' }
  const found = await activeFirm(slug)
  if (!found?.firm.phone) return { ok: false, message: 'Ta firma nie podała numeru telefonu.' }
  await bumpStat(found.payload, found.firm.id, 'phoneReveals')
  return { ok: true, phone: found.firm.phone }
}

/** Wyświetlenie profilu: wywoływane z przeglądarki raz na sesję (bez botów i prefetchu). */
export async function recordViewAction(slug: unknown): Promise<void> {
  const limit = await rateLimit('view', await clientIpHash())
  if (!limit.ok) return
  const found = await activeFirm(slug)
  if (found) await bumpStat(found.payload, found.firm.id, 'views')
}
