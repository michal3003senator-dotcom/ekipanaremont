import type { CollectionConfig } from 'payload'

import { editorial, either, where } from '@/access'
import { pageBlocks } from '@/blocks'

import { seoField, slugField } from './fields'

/** Strona (SPEC 3.8): regulamin, polityki, O nas, Kontakt. Wersje = archiwum dokumentów prawnych. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Strona', plural: 'Strony' },
  admin: {
    defaultColumns: ['title', 'slug', 'legalVersion', '_status'],
    useAsTitle: 'title',
    group: 'Treści',
  },
  access: {
    read: either(editorial, where({ _status: { equals: 'published' } })),
    readVersions: editorial,
    create: editorial,
    update: editorial,
    delete: editorial,
  },
  versions: { drafts: true, maxPerDoc: 100 },
  fields: [
    { name: 'title', type: 'text', label: 'Tytuł', required: true, maxLength: 120 },
    slugField('title'),
    { name: 'content', type: 'blocks', label: 'Treść', blocks: pageBlocks },
    {
      name: 'legalVersion',
      type: 'text',
      label: 'Wersja dokumentu',
      admin: { position: 'sidebar', description: 'Tylko dokumenty prawne, np. 1.2' },
    },
    { name: 'effectiveFrom', type: 'date', label: 'Obowiązuje od', admin: { position: 'sidebar' } },
    seoField,
  ],
}
