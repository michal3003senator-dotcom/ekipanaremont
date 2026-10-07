import type { CollectionConfig } from 'payload'

import { anyone, editorial, either, isStaffUser, where } from '@/access'
import { articleBlocks } from '@/blocks'
import { blocksText, readingMinutes } from '@/lib/content/text'

import { seoField, slugField, systemOnly, uniqueSlug } from './fields'

/**
 * Artykuł (SPEC 3.8): bloki, kategorie, szkice, wersje, harmonogram (`publishAt` + zadanie
 * `publishScheduled`, ADR 0022), podgląd na żywo. Publicznie tylko opublikowane.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Artykuł', plural: 'Artykuły' },
  admin: {
    defaultColumns: ['title', 'category', '_status', 'publishAt', 'publishedAt'],
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
  // Autozapis szkicu – podgląd na żywo odświeża się w trakcie pisania (ADR 0023).
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
  hooks: {
    beforeValidate: [uniqueSlug('articles')],
    beforeChange: [
      ({ data, operation, req: { user } }) => {
        const next = { ...data }
        if (operation === 'create' && !next.authorName && isStaffUser(user))
          next.authorName = (user as { name?: string }).name
        if (next._status === 'published' && !next.publishedAt)
          next.publishedAt = new Date().toISOString()
        if (next.content) next.readingMinutes = readingMinutes(blocksText(next.content))
        return next
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Tytuł', required: true, maxLength: 120 },
    slugField('title'),
    { name: 'excerpt', type: 'textarea', label: 'Zajawka', maxLength: 300 },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Zdjęcie główne' },
    { name: 'content', type: 'blocks', label: 'Treść', blocks: articleBlocks },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'articleCategories',
      label: 'Kategoria',
      index: true,
      admin: { position: 'sidebar' },
    },
    { name: 'tags', type: 'text', hasMany: true, label: 'Tagi', admin: { position: 'sidebar' } },
    {
      name: 'authorName',
      type: 'text',
      label: 'Podpis autora',
      maxLength: 80,
      admin: { position: 'sidebar', description: 'Uzupełnia się imieniem redaktora.' },
    },
    {
      name: 'publishAt',
      type: 'date',
      label: 'Opublikuj automatycznie',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Zapisz szkic – artykuł opublikuje się sam (sprawdzamy co godzinę).',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Data publikacji',
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readingMinutes',
      type: 'number',
      label: 'Czas czytania (min)',
      access: systemOnly,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Powiązane usługi',
      admin: { description: 'Artykuł pojawi się na stronach lokalnych tych usług.' },
    },
    seoField,
  ],
}

/** Kategoria artykułów: `/artykuly/kategoria/[slug]`. */
export const ArticleCategories: CollectionConfig = {
  slug: 'articleCategories',
  labels: { singular: 'Kategoria artykułów', plural: 'Kategorie artykułów' },
  admin: { defaultColumns: ['name', 'slug'], useAsTitle: 'name', group: 'Treści' },
  access: { read: anyone, create: editorial, update: editorial, delete: editorial },
  hooks: { beforeValidate: [uniqueSlug('articleCategories')] },
  fields: [
    { name: 'name', type: 'text', label: 'Nazwa', required: true, maxLength: 60 },
    slugField('name'),
    { name: 'description', type: 'textarea', label: 'Opis', maxLength: 300 },
    seoField,
  ],
}
