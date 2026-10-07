import type { CollectionConfig } from 'payload'

import { editorial, either, idOf, isStaffUser, where } from '@/access'
import { articleBlocks } from '@/blocks'

import { seoField, slugField } from './fields'

/** Artykuł (SPEC 3.8): bloki, szkice, wersje, harmonogram publikacji. Publicznie tylko opublikowane. */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Artykuł', plural: 'Artykuły' },
  admin: {
    defaultColumns: ['title', 'category', '_status', 'publishedAt'],
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
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 50 },
  hooks: {
    beforeChange: [
      ({ data, operation, req: { user } }) => {
        const next = { ...data }
        if (operation === 'create' && !next.author && isStaffUser(user)) next.author = idOf(user)
        if (next._status === 'published' && !next.publishedAt)
          next.publishedAt = new Date().toISOString()
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
      type: 'text',
      label: 'Kategoria',
      index: true,
      admin: { position: 'sidebar' },
    },
    { name: 'tags', type: 'text', hasMany: true, label: 'Tagi', admin: { position: 'sidebar' } },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'staff',
      label: 'Autor',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Data publikacji',
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Powiązane usługi',
    },
    seoField,
  ],
}
