import type { Inquiry } from '@/payload-types'

/** Statusy zapytań w panelu (SPEC 3.4). */
export const INQUIRY_STATUS: Record<Inquiry['status'], string> = {
  new: 'Nowe',
  in_contact: 'W kontakcie',
  closed: 'Zamknięte',
  spam: 'Spam',
}
