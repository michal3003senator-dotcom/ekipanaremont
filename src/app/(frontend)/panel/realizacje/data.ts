import type { Payload } from 'payload'

import { idOf } from '@/access'
import type { SelectOption } from '@/components/ui/Select'
import type { Media } from '@/payload-types'

import type { Photo } from './PhotoManager'

/** Usługi do listy wyboru: podusługi z nazwą usługi nadrzędnej. */
export async function serviceOptions(payload: Payload): Promise<SelectOption[]> {
  const { docs } = await payload.find({
    collection: 'services',
    depth: 0,
    pagination: false,
    sort: 'name',
    overrideAccess: true,
  })
  const names = new Map(docs.map((doc) => [doc.id, doc.name]))
  return docs
    .map((doc) => {
      const parent = idOf(doc.parent)
      return { value: doc.id, label: parent ? `${names.get(parent)} – ${doc.name}` : doc.name }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
}

export const toPhoto = (media: unknown): Photo | null =>
  media && typeof media === 'object' && 'id' in media
    ? {
        id: (media as Media).id,
        url: (media as Media).sizes?.thumb?.url ?? (media as Media).url ?? null,
        alt: (media as Media).alt,
      }
    : null
