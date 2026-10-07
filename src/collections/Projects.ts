import type { CollectionConfig } from 'payload'

import { admin, either, firmAccount, moderation, ownFirm, staff, where } from '@/access'
import { assignOwnFirm } from '@/hooks/assignOwner'
import { CALENDAR_MONTH } from '@/lib/validation'

import { options } from './fields'

/** Realizacja firmy (SPEC 4): do 12 zdjęć, publicznie tylko opublikowane. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Realizacja', plural: 'Realizacje' },
  admin: {
    defaultColumns: ['title', 'firm', 'status', 'completedMonth'],
    useAsTitle: 'title',
    group: 'Firmy',
  },
  access: {
    read: either(staff(), ownFirm(), where({ status: { equals: 'published' } })),
    create: either(admin, firmAccount),
    update: either(moderation, ownFirm()),
    delete: either(moderation, ownFirm()),
  },
  hooks: { beforeValidate: [assignOwnFirm()] },
  defaultSort: 'order',
  fields: [
    {
      name: 'firm',
      type: 'relationship',
      relationTo: 'firms',
      label: 'Firma',
      required: true,
      index: true,
    },
    { name: 'title', type: 'text', label: 'Tytuł', required: true, maxLength: 120 },
    { name: 'service', type: 'relationship', relationTo: 'services', label: 'Usługa' },
    { name: 'locality', type: 'relationship', relationTo: 'localities', label: 'Miejscowość' },
    {
      name: 'completedMonth',
      type: 'text',
      label: 'Zakończono (RRRR-MM)',
      validate: (value: unknown) =>
        !value ||
        (typeof value === 'string' && CALENDAR_MONTH.test(value)) ||
        'Podaj miesiąc w formacie RRRR-MM.',
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 12,
      label: 'Zdjęcia',
    },
    { name: 'description', type: 'textarea', label: 'Opis', maxLength: 2000 },
    { name: 'order', type: 'number', label: 'Kolejność', defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: options({
        draft: 'Szkic',
        published: 'Opublikowana',
        hidden: 'Ukryta przez moderację',
      }),
    },
  ],
}
