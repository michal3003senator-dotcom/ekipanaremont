import { availabilityLabel, getAvailability } from '@/components/features/availability-tiles/model'
import { getFirmProfile } from '@/lib/firm/profile'
import { publicContext } from '@/lib/search/context'
import { OG_SIZE, ogImage } from '@/lib/seo/og'

export const alt = 'Profil firmy remontowej z najbliższym wolnym terminem'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { payload, today, expiryDays } = await publicContext()
  const profile = await getFirmProfile(payload, slug, today, expiryDays)
  const availability = getAvailability(today, profile?.summary.availableFrom ?? null)
  return ogImage({
    eyebrow: 'Ekipa na Termin',
    title: profile?.summary.name ?? 'Firma remontowa',
    subtitle: profile ? `${profile.summary.services} · ${profile.summary.locality}` : '',
    today,
    availability,
    label: availabilityLabel(availability),
  })
}
