import config from '@payload-config'
import { getPayload } from 'payload'

import { todayInWarsaw } from '@/lib/format/date'
import { getSettings } from '@/lib/settings'

/** Wspólne dane stron publicznych: Payload, dzisiejsza data (Europe/Warsaw), dni ważności terminu. */
export async function publicContext() {
  const [payload, settings] = await Promise.all([getPayload({ config }), getSettings()])
  return { payload, today: todayInWarsaw(), expiryDays: settings.availabilityExpiryDays ?? 14 }
}
