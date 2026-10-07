import type { Payload } from 'payload'
import { cache } from 'react'

import { idOf } from '@/access'
import type { FirmPhotoData, Project } from '@/components/features/firm/types'
import type { CalendarDate, CalendarMonth } from '@/lib/format/date'
import { mediaPhoto, toFirmSummary } from '@/lib/search/summary'
import type { Firm, Locality, Review, Service } from '@/payload-types'

/** Galeria profilu: wszystkie zdjęcia opublikowanych realizacji, najwyżej tyle. */
const GALLERY_LIMIT = 36
const REVIEWS_LIMIT = 20

const guest = { overrideAccess: false } as const

export type ProfileReview = Pick<
  Review,
  'id' | 'rating' | 'title' | 'body' | 'authorDisplayName' | 'firmReply' | 'publishedAt'
>

export type FirmProfile = NonNullable<Awaited<ReturnType<typeof loadProfile>>>

const docs = <T>(values: ReadonlyArray<T | string> | null | undefined) =>
  (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)

/** Usługi główne z podusługami tej firmy: „Remont łazienki: biały montaż, glazura”. */
function groupServices(services: Service[]) {
  const main = services.filter((service) => !service.parent)
  const children = services.filter((service) => service.parent)
  const groups = main.map((service) => ({
    id: service.id,
    name: service.name,
    children: children
      .filter((child) => idOf(child.parent) === service.id)
      .map((child) => child.name),
  }))
  const orphans = children.filter((child) => !main.some((m) => m.id === idOf(child.parent)))
  return [...groups, ...orphans.map((child) => ({ id: child.id, name: child.name, children: [] }))]
}

/** Rozkład ocen 5…1 z liczbą opinii przy każdej gwiazdce. */
function ratingDistribution(ratings: number[]) {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratings.filter((rating) => Math.round(rating) === stars).length,
  }))
}

function galleryOf(
  projects: Array<{
    id: string
    title: string
    completedMonth?: string | null
    locality?: unknown
    images?: unknown[] | null
  }>,
  fallbackLocality: string,
): Project[] {
  return projects
    .flatMap((project) =>
      (project.images ?? []).map((image, index) => {
        const photo = mediaPhoto(image)
        const locality = (project.locality as Locality | null)?.name ?? fallbackLocality
        return photo
          ? {
              id: `${project.id}-${index}`,
              title: project.title,
              locality,
              month: (project.completedMonth ?? '') as CalendarMonth,
              photo: { ...photo, alt: photo.alt || `${project.title}, ${locality}` },
            }
          : null
      }),
    )
    .filter((item): item is Project => item !== null)
    .slice(0, GALLERY_LIMIT)
}

async function loadProfile(
  payload: Payload,
  slug: string,
  today: CalendarDate,
  expiryDays: number,
) {
  // Gość: reguła dostępu przepuszcza tylko profile `active` (SPEC 4).
  const { docs: found } = await payload.find({
    collection: 'firms',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    ...guest,
  })
  const firm: Firm | undefined = found[0]
  if (!firm) return null

  const [projects, reviews, ratings] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: { firm: { equals: firm.id }, status: { equals: 'published' } },
      sort: 'order',
      depth: 1,
      pagination: false,
      ...guest,
    }),
    payload.find({
      collection: 'reviews',
      where: { firm: { equals: firm.id }, status: { equals: 'approved' } },
      sort: '-publishedAt',
      depth: 0,
      limit: REVIEWS_LIMIT,
      ...guest,
    }),
    payload.find({
      collection: 'reviews',
      where: { firm: { equals: firm.id }, status: { equals: 'approved' } },
      select: { rating: true },
      depth: 0,
      pagination: false,
      ...guest,
    }),
  ])

  const base = firm.baseLocality as Locality | null | undefined
  const gallery = galleryOf(projects.docs, base?.name ?? '')
  const cover: FirmPhotoData | undefined =
    mediaPhoto(firm.cover, 'large') ?? mediaPhoto(projects.docs[0]?.images?.[0], 'large')
  const services = docs<Service>(firm.services)

  return {
    id: firm.id,
    summary: toFirmSummary(firm, cover, today, expiryDays),
    shortDescription: firm.shortDescription ?? null,
    about: firm.about ?? null,
    logo: mediaPhoto(firm.logo),
    hasPhone: Boolean(firm.phone),
    website: firm.website ?? null,
    vatInvoice: Boolean(firm.vatInvoice),
    warrantyMonths: firm.warrantyMonths ?? null,
    yearsExperience: firm.yearsExperience ?? null,
    teamSize: firm.teamSize ?? null,
    nip: firm.nip,
    registryVerifiedAt: firm.registryVerifiedAt ?? null,
    baseLocality: base ? { id: base.id, name: base.name, slug: base.slug ?? null } : null,
    serviceArea: docs<Locality>(firm.serviceArea).map((locality) => locality.name),
    services: groupServices(services),
    serviceOptions: services.map((service) => ({ value: service.id, label: service.name })),
    mainServiceIds: services.filter((service) => !service.parent).map((service) => service.id),
    gallery,
    reviews: reviews.docs.map(
      ({ id, rating, title, body, authorDisplayName, firmReply, publishedAt }) => ({
        id,
        rating,
        title,
        body,
        authorDisplayName,
        firmReply,
        publishedAt,
      }),
    ) satisfies ProfileReview[],
    distribution: ratingDistribution(ratings.docs.map((review) => review.rating)),
  }
}

/** Profil publiczny po adresie; `cache` – jedno zapytanie dla metadanych, strony i obrazka OG. */
export const getFirmProfile = cache(loadProfile)
