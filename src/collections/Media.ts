import type { CollectionConfig } from 'payload'

import { ACTIVE_FIRM, all, either, moderation, ownFirm, staff, where } from '@/access'
import { community } from '@/access/community'
import { assignOwnFirm } from '@/hooks/assignOwner'

const TEN_MB = 10 * 1024 * 1024

/**
 * Pliki (SPEC 4, CLAUDE.md): tylko obrazy rozpoznane po zawartości, limit rozmiaru, ponowne kodowanie
 * przez sharp do WebP (bez EXIF). Zdjęcia zapytań widzi tylko firma-adresat i administrator,
 * zdjęcia forum i giełdy – tylko członkowie, zdjęcia ukrytej firmy – nikt publicznie.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Plik', plural: 'Pliki' },
  admin: {
    defaultColumns: ['filename', 'purpose', 'firm'],
    useAsTitle: 'filename',
    group: 'Treści',
  },
  access: {
    read: either(
      staff('admin'),
      ownFirm(),
      all(moderation, where({ purpose: { not_equals: 'inquiry' } })),
      // Publicznie: zdjęcia aktywnych firm i artykułów; forum i giełda – tylko dla członków.
      where({
        and: [
          { purpose: { in: ['project', 'logo', 'cover', 'article'] } },
          { or: [{ firm: { exists: false } }, ACTIVE_FIRM] },
        ],
      }),
      all(community('forum'), where({ purpose: { equals: 'forum' } })),
      all(community('marketplace'), where({ purpose: { equals: 'listing' } })),
    ),
    create: either(staff(), ({ req: { user } }) => user?.collection === 'firmAccounts'),
    update: either(moderation, staff('editor'), ownFirm()),
    delete: either(moderation, ownFirm()),
  },
  hooks: { beforeValidate: [assignOwnFirm()] },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumb', width: 480, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'large', width: 1600, formatOptions: { format: 'webp', options: { quality: 82 } } },
    ],
    focalPoint: true,
    filesRequiredOnCreate: true,
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Opis zdjęcia (dla niewidomych)', required: true },
    {
      name: 'purpose',
      type: 'select',
      label: 'Przeznaczenie',
      required: true,
      defaultValue: 'project',
      index: true,
      options: [
        { value: 'project', label: 'Realizacja' },
        { value: 'logo', label: 'Logo' },
        { value: 'cover', label: 'Zdjęcie główne' },
        { value: 'forum', label: 'Forum' },
        { value: 'listing', label: 'Giełda' },
        { value: 'article', label: 'Artykuł' },
        { value: 'inquiry', label: 'Zapytanie' },
      ],
    },
    { name: 'firm', type: 'relationship', relationTo: 'firms', label: 'Firma', index: true },
  ],
}

export const MAX_UPLOAD_BYTES = TEN_MB
