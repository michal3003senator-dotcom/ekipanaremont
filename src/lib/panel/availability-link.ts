import config from '@payload-config'
import { getPayload } from 'payload'
import { z } from 'zod'

import { availabilityLinkSubject } from '@/jobs/firms'
import { verifyLink } from '@/lib/auth/links'
import { todayInWarsaw } from '@/lib/format/date'

/** Sprawdza link z e-maila i zwraca firmę, jeśli termin nadal czeka na to potwierdzenie. */
export async function firmForLink(token: string) {
  if (!z.string().max(500).safeParse(token).success) return null
  const subject = verifyLink(token, 'confirm-availability')
  const firmId = subject?.split(':')[0]
  if (!subject || !firmId) return null
  const payload = await getPayload({ config })
  const firm = await payload.findByID({
    collection: 'firms',
    id: firmId,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
  })
  // Jednorazowość: po potwierdzeniu `confirmedAt` się zmienia i stary link przestaje pasować.
  if (!firm || availabilityLinkSubject(firm) !== subject) return null
  if (!firm.availability?.date || firm.availability.date < todayInWarsaw()) return null
  return firm
}
