import type { Payload } from 'payload'

import { idOf } from '@/access'
import type { FirmPhotoData, FirmSummary } from '@/components/features/firm/types'
import type { CalendarDate } from '@/lib/format/date'
import { availabilityState } from '@/lib/panel/availability'
import type { Firm, Media } from '@/payload-types'
import { mediaSrc } from '@/lib/images'

const REGISTRY: Record<string, FirmSummary['registry']> = { ceidg: 'CEIDG', krs: 'KRS', vat: 'VAT' }

const nameOf = (value: unknown) =>
  value && typeof value === 'object' && 'name' in value
    ? String((value as { name: unknown }).name)
    : null

/** Zdjęcie z Payload w rozmiarze dla karty (960 px) albo nagłówka profilu (1600 px). */
export function mediaPhoto(
  media: unknown,
  size: 'card' | 'large' = 'card',
): FirmPhotoData | undefined {
  if (!media || typeof media !== 'object' || !('url' in media)) return undefined
  const doc = media as Media
  const src = mediaSrc(doc.sizes?.[size]?.url ?? doc.url)
  return src ? { src, alt: doc.alt } : undefined
}

/** Usługi główne firmy (bez podusług) do podpisu na karcie: „Glazurnik, Malarz”. */
export function serviceNames(firm: Pick<Firm, 'services'>, max = 3): string {
  const services = (firm.services ?? []).filter(
    (service) => typeof service === 'object' && service && !service.parent,
  )
  const names = services.map(nameOf).filter((name): name is string => Boolean(name))
  return names.slice(0, max).join(', ') || 'Usługi remontowe'
}

/** Firma z bazy (głębokość 1) → dane karty i nagłówka profilu. Termin tylko aktywny (SPEC 3.5). */
export function toFirmSummary(
  firm: Firm,
  cover: FirmPhotoData | undefined,
  today: CalendarDate,
  expiryDays: number,
): FirmSummary {
  const state = availabilityState(firm.availability, today, expiryDays)
  const active = state.availability.status !== 'none'
  return {
    slug: firm.slug ?? firm.id,
    name: firm.name,
    services: serviceNames(firm),
    locality: nameOf(firm.baseLocality) ?? 'woj. łódzkie',
    areaExtra: Math.max(0, (firm.serviceArea?.length ?? 0) - 1),
    rating: firm.ratingCount ? (firm.ratingAvg ?? null) : null,
    reviews: firm.ratingCount ?? 0,
    registry: firm.registryVerifiedAt ? (REGISTRY[firm.registrySource ?? ''] ?? null) : null,
    availableFrom: active ? state.date : null,
    confirmedOn: active ? state.confirmedOn : undefined,
    photo: cover,
  }
}

/** Karty firm w podanej kolejności (wynik wyszukiwania), z okładką z pierwszej realizacji. */
export async function loadFirmSummaries(
  payload: Payload,
  ids: string[],
  today: CalendarDate,
  expiryDays: number,
): Promise<FirmSummary[]> {
  if (!ids.length) return []
  const guest = { overrideAccess: false } as const
  const [firms, projects] = await Promise.all([
    payload.find({
      collection: 'firms',
      where: { id: { in: ids } },
      depth: 1,
      pagination: false,
      ...guest,
    }),
    payload.find({
      collection: 'projects',
      where: { firm: { in: ids }, status: { equals: 'published' } },
      sort: 'order',
      depth: 1,
      pagination: false,
      ...guest,
    }),
  ])
  const covers = new Map<string, FirmPhotoData>()
  for (const project of projects.docs) {
    const firmId = idOf(project.firm)
    const photo = mediaPhoto(project.images?.[0])
    if (firmId && photo && !covers.has(firmId)) covers.set(firmId, photo)
  }
  const byId = new Map(firms.docs.map((firm) => [firm.id, firm]))
  return ids
    .map((id) => byId.get(id))
    .filter((firm): firm is Firm => Boolean(firm))
    .map((firm) => toFirmSummary(firm, covers.get(firm.id), today, expiryDays))
}
