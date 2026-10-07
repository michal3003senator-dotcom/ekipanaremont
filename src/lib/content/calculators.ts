import type { Payload } from 'payload'
import { cache } from 'react'

import type { PublicCalculator } from '@/components/features/calculators/types'
import { readCalculatorParams } from '@/lib/calculators/params'
import { getSettings } from '@/lib/settings'
import type { Calculator, Service } from '@/payload-types'

import type { ContentReader } from './articles'

/** Kalkulator do pokazania: opublikowany (albo szkic w podglądzie) z kompletem parametrów. */
export function toPublicCalculator(doc: Calculator): PublicCalculator | null {
  const params = readCalculatorParams(doc.type, doc as never)
  if (!params) return null
  const service =
    typeof doc.linkedService === 'object' ? (doc.linkedService as Service | null) : null
  return {
    id: doc.id,
    type: doc.type,
    title: doc.title,
    intro: doc.intro ?? null,
    disclaimer: doc.disclaimer ?? null,
    params,
    serviceSlug: service?.slug ?? null,
  } as PublicCalculator
}

/** Moduł włączony flagą `calculators` w ustawieniach (CLAUDE.md: flaga off → 404). */
export const calculatorsEnabled = cache(
  async () => (await getSettings()).featureFlags?.calculators !== false,
)

export async function getCalculator(
  payload: Payload,
  where: { slug: string } | { id: string },
  reader: ContentReader,
): Promise<Calculator | null> {
  const { docs } = await payload.find({
    collection: 'calculators',
    where: 'slug' in where ? { slug: { equals: where.slug } } : { id: { equals: where.id } },
    depth: 1,
    limit: 1,
    ...(reader.draft
      ? { draft: true, overrideAccess: false, user: reader.user }
      : { overrideAccess: false }),
  })
  return docs[0] ?? null
}

export async function listCalculators(payload: Payload) {
  const { docs } = await payload.find({
    collection: 'calculators',
    sort: 'title',
    depth: 1,
    pagination: false,
    overrideAccess: false,
  })
  return docs
    .map((doc) => ({ doc, calculator: toPublicCalculator(doc) }))
    .filter((item) => item.calculator !== null)
}
