import { getAvailability } from '@/components/features/availability-tiles/model'
import { searchFirms } from '@/lib/search/firms'
import { publicContext } from '@/lib/search/context'
import { loadFirmSummaries } from '@/lib/search/summary'
import { OG_SIZE, ogImage } from '@/lib/seo/og'

export const alt = 'Ekipa na Termin – firmy remontowe z wolnym terminem'
export const size = OG_SIZE
export const contentType = 'image/png'
// Kafle pokazują dzisiejszy najbliższy termin – odświeżane co godzinę, nie zamrożone w buildzie.
export const revalidate = 3600

/** Kafle pokazują prawdziwy najbliższy termin z serwisu (bez zmyślonych danych). */
export default async function Image() {
  const { payload, today, expiryDays } = await publicContext()
  const { ids } = await searchFirms(payload, { today, expiryDays, withinDays: 30, limit: 1 })
  const [first] = await loadFirmSummaries(payload, ids, today, expiryDays)
  return ogImage({
    eyebrow: 'Ekipa na Termin · województwo łódzkie',
    title: 'Fachowiec z wolnym terminem, nie za pół roku.',
    subtitle: 'Terminy, realizacje i opinie firm remontowych.',
    today,
    availability: getAvailability(today, first?.availableFrom ?? null),
    label: 'Najbliższy wolny termin w serwisie',
  })
}
