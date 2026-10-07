import type { CollectionConfig, FieldAccess } from 'payload'

import {
  admin,
  either,
  fieldFor,
  firmIdOf,
  idOf,
  moderation,
  nobody,
  ownFirm,
  verifiedModeration,
  where,
} from '@/access'
import { auditHooks } from '@/hooks/audit'
import { syncRatingAfterChange, syncRatingAfterDelete } from '@/hooks/firmRating'

import { options, systemOnly } from './fields'

const moderationOnly = {
  create: fieldFor(verifiedModeration),
  update: fieldFor(verifiedModeration),
}

/** Odpowiedź pisze tylko firma, której dotyczy opinia (albo moderacja). */
const ownerOrModeration: FieldAccess = ({ req: { user }, doc }) =>
  verifiedModeration(user) || (firmIdOf(user) !== null && firmIdOf(user) === idOf(doc?.firm))

const length = (min: number, max: number) => (value: unknown) =>
  (typeof value === 'string' && value.trim().length >= min && value.length <= max) ||
  `Od ${min} do ${max} znaków.`

/**
 * Opinia (SPEC 3.7): tylko z jednorazowego linku (Server Action), jedna na zapytanie,
 * publikacja po akceptacji moderatora. Firma może tylko odpowiedzieć.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Opinia', plural: 'Opinie' },
  admin: { defaultColumns: ['firm', 'rating', 'status', 'createdAt'], group: 'Moderacja' },
  access: {
    read: either(moderation, ownFirm(), where({ status: { equals: 'approved' } })),
    create: nobody,
    update: either(moderation, ownFirm()),
    delete: admin,
  },
  indexes: [{ fields: ['firm', 'status'] }],
  hooks: {
    afterChange: [...auditHooks.afterChange, syncRatingAfterChange],
    afterDelete: [...auditHooks.afterDelete, syncRatingAfterDelete],
    beforeChange: [
      ({ data, originalDoc }) => {
        const next = { ...data }
        if (data.firmReply !== undefined && data.firmReply !== originalDoc?.firmReply)
          next.firmReplyAt = new Date().toISOString()
        if (data.status === 'approved' && !originalDoc?.publishedAt)
          next.publishedAt = new Date().toISOString()
        return next
      },
    ],
  },
  fields: [
    {
      name: 'firm',
      type: 'relationship',
      relationTo: 'firms',
      label: 'Firma',
      required: true,
      index: true,
      access: systemOnly,
    },
    {
      name: 'inquiry',
      type: 'relationship',
      relationTo: 'inquiries',
      label: 'Zapytanie',
      required: true,
      unique: true,
      access: systemOnly,
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Ocena',
      required: true,
      min: 1,
      max: 5,
      access: systemOnly,
    },
    { name: 'title', type: 'text', label: 'Tytuł', maxLength: 120, access: moderationOnly },
    {
      name: 'body',
      type: 'textarea',
      label: 'Treść',
      required: true,
      validate: length(30, 1500),
      access: moderationOnly,
    },
    {
      name: 'authorDisplayName',
      type: 'text',
      label: 'Podpis',
      required: true,
      maxLength: 80,
      access: moderationOnly,
    },
    {
      name: 'firmReply',
      type: 'textarea',
      label: 'Odpowiedź firmy',
      maxLength: 1500,
      access: { update: ownerOrModeration },
    },
    { name: 'firmReplyAt', type: 'date', label: 'Odpowiedź dodana', access: systemOnly },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: options({
        pending: 'Czeka na moderację',
        approved: 'Opublikowana',
        rejected: 'Odrzucona',
      }),
      access: moderationOnly,
    },
    {
      name: 'moderationReason',
      type: 'textarea',
      label: 'Uzasadnienie decyzji',
      access: moderationOnly,
    },
    { name: 'publishedAt', type: 'date', label: 'Opublikowana', access: systemOnly },
  ],
}
