import type { CollectionConfig } from 'payload'

import { admin, either, fieldFor, isFirmUser, ownFirm, nobody, verifiedAdmin } from '@/access'
import { emailHash } from '@/lib/crypto'

import { encrypted, hashField, options, systemOnly } from './fields'

const readers = [verifiedAdmin, isFirmUser]
const adminWrites = { create: fieldFor(verifiedAdmin), update: fieldFor(verifiedAdmin) }

/**
 * Zapytanie klienta (SPEC 3.6, 4). Tworzy je wyłącznie Server Action (Turnstile, Zod, limit) przez
 * Local API. Czyta firma-adresat i administrator; dane kontaktowe i opis zaszyfrowane (S).
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Zapytanie', plural: 'Zapytania' },
  admin: { defaultColumns: ['firm', 'service', 'status', 'createdAt'], group: 'Firmy' },
  access: {
    read: either(admin, ownFirm()),
    create: nobody,
    update: either(admin, ownFirm()),
    delete: admin,
  },
  indexes: [{ fields: ['firm', 'status', 'createdAt'] }],
  hooks: {
    beforeValidate: [
      ({ data }) =>
        typeof data?.clientEmail === 'string'
          ? { ...data, clientEmailHash: emailHash(data.clientEmail) }
          : data,
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
      access: adminWrites,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      label: 'Rodzaj prac',
      access: adminWrites,
    },
    {
      name: 'locality',
      type: 'relationship',
      relationTo: 'localities',
      label: 'Miejscowość',
      access: adminWrites,
    },
    encrypted('inquiries', { name: 'description', label: 'Opis', required: true }, readers, {
      type: 'textarea',
      writers: [verifiedAdmin],
    }),
    {
      name: 'budgetRange',
      type: 'select',
      label: 'Budżet',
      options: options({
        to10k: 'do 10 000 zł',
        from10to30k: '10 000–30 000 zł',
        from30to60k: '30 000–60 000 zł',
        from60to100k: '60 000–100 000 zł',
        over100k: 'powyżej 100 000 zł',
        unknown: 'Nie wiem',
      }),
      access: adminWrites,
    },
    { name: 'timeframe', type: 'text', label: 'Planowany termin', access: adminWrites },
    encrypted('inquiries', { name: 'clientName', label: 'Imię', required: true }, readers, {
      writers: [verifiedAdmin],
    }),
    encrypted('inquiries', { name: 'clientEmail', label: 'E-mail', required: true }, readers, {
      writers: [verifiedAdmin],
    }),
    hashField('clientEmailHash'),
    encrypted('inquiries', { name: 'clientPhone', label: 'Telefon' }, readers, {
      writers: [verifiedAdmin],
    }),
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 5,
      label: 'Zdjęcia',
      access: adminWrites,
    },
    {
      name: 'consentTextVersion',
      type: 'text',
      label: 'Wersja treści zgody',
      required: true,
      access: systemOnly,
    },
    {
      name: 'consentAt',
      type: 'date',
      label: 'Zgoda wyrażona',
      required: true,
      access: systemOnly,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'new',
      index: true,
      options: options({ new: 'Nowe', read: 'Przeczytane', archived: 'Zarchiwizowane' }),
    },
    hashField('reviewTokenHash'),
    {
      name: 'reviewTokenExpiresAt',
      type: 'date',
      label: 'Link do opinii ważny do',
      access: systemOnly,
    },
    {
      name: 'reviewRequestedAt',
      type: 'date',
      label: 'Prośba o opinię wysłana',
      access: systemOnly,
    },
    {
      name: 'source',
      type: 'select',
      label: 'Źródło',
      defaultValue: 'direct',
      options: options({ direct: 'Profil firmy', calculator: 'Kalkulator' }),
      access: systemOnly,
    },
    hashField('ipHash'),
  ],
}
