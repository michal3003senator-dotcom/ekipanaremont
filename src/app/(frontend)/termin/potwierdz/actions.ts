'use server'

import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { firmForLink } from '@/lib/panel/availability-link'

/** Potwierdzenie przyciskiem na stronie (POST) – skanery linków w poczcie nie potwierdzą terminu same. */
export async function confirmFromEmailAction(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '')
  const firm = await firmForLink(token)
  if (!firm) redirect(`/termin/potwierdz/${encodeURIComponent(token)}`)
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'firms',
    id: firm.id,
    data: {
      availability: { date: firm.availability!.date },
      mailLog: { availabilityReminderAt: null, availabilityExpiredAt: null },
    },
    context: { confirmAvailability: true },
    overrideAccess: true,
  })
  redirect('/termin/potwierdz/gotowe')
}
