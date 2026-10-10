import type { CollectionConfig, FieldAccess } from 'payload'

import {
  admin,
  either,
  fieldFor,
  firmIdOf,
  idOf,
  moderation,
  ownFirm,
  staff,
  verifiedAdmin,
  verifiedModeration,
  where,
} from '@/access'
import { auditHooks } from '@/hooks/audit'
import { deleteFirmContent } from '@/hooks/firmCascade'
import { startTrialOnApproval } from '@/hooks/firmTrial'
import { firmDecisionNotices, requireModerationReason } from '@/hooks/moderation'
import {
  checkAvailabilityDate,
  HTTPS_URL,
  isValidNip,
  normalizeNip,
  PHONE_PL,
} from '@/lib/validation'

import { options, slugField, systemOnly, uniqueSlug } from './fields'

/** Właściciel profilu albo zweryfikowany personel moderacji. */
const ownerOrModeration: FieldAccess = ({ req: { user }, doc, id }) =>
  verifiedModeration(user) || (firmIdOf(user) !== null && firmIdOf(user) === (idOf(doc) ?? id))

const adminOnly = { create: fieldFor(verifiedAdmin), update: fieldFor(verifiedAdmin) }
const moderationOnly = {
  create: fieldFor(verifiedModeration),
  update: fieldFor(verifiedModeration),
}
const internal = { read: ownerOrModeration, ...adminOnly }

const int = (min: number, max: number) => (value: unknown) =>
  value === null ||
  value === undefined ||
  (Number.isInteger(value) && (value as number) >= min && (value as number) <= max) ||
  `Podaj liczbę całkowitą od ${min} do ${max}.`

/**
 * Firma (SPEC 4). Publicznie widać tylko profile `active`; firma edytuje swój profil i termin,
 * status zmienia moderacja, dane rejestrowe i abonament – administrator albo system.
 */
export const Firms: CollectionConfig = {
  slug: 'firms',
  labels: { singular: 'Firma', plural: 'Firmy' },
  admin: {
    defaultColumns: ['name', 'status', 'subscriptionStatus', 'availability.date'],
    useAsTitle: 'name',
    group: 'Firmy',
  },
  access: {
    read: either(staff(), ownFirm('id'), where({ status: { equals: 'active' } })),
    create: admin,
    update: either(moderation, ownFirm('id')),
    delete: admin,
  },
  indexes: [{ fields: ['status', 'availability.date'] }],
  hooks: {
    afterChange: [...auditHooks.afterChange, firmDecisionNotices],
    beforeDelete: [deleteFirmContent],
    afterDelete: auditHooks.afterDelete,
    beforeValidate: [
      uniqueSlug('firms'),
      ({ data }) =>
        typeof data?.nip === 'string' ? { ...data, nip: normalizeNip(data.nip) } : data,
    ],
    beforeChange: [
      requireModerationReason('firms', ['rejected', 'suspended']),
      startTrialOnApproval,
      // Każde potwierdzenie terminu (nowa data albo jawne potwierdzenie) odświeża `confirmedAt` (SPEC 3.5).
      ({ context, data, originalDoc }) => {
        const date = data.availability?.date
        const changed = date !== undefined && date !== originalDoc?.availability?.date
        if (!changed && !context.confirmAvailability) return data
        return {
          ...data,
          availability: {
            ...data.availability,
            confirmedAt: date ? new Date().toISOString() : null,
          },
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nazwa', required: true, maxLength: 120 },
    slugField('name'),
    {
      name: 'nip',
      type: 'text',
      label: 'NIP',
      required: true,
      unique: true,
      index: true,
      access: adminOnly,
      validate: (value: unknown) =>
        (typeof value === 'string' && isValidNip(value)) || 'Podaj poprawny NIP (10 cyfr).',
    },
    {
      name: 'registrySource',
      type: 'select',
      label: 'Rejestr',
      options: options({ ceidg: 'CEIDG', krs: 'KRS', vat: 'Biała lista VAT' }),
      access: adminOnly,
    },
    { name: 'registryData', type: 'json', label: 'Dane z rejestru', access: internal },
    { name: 'registryVerifiedAt', type: 'date', label: 'NIP zweryfikowany', access: adminOnly },
    { name: 'shortDescription', type: 'textarea', label: 'Krótki opis', maxLength: 300 },
    { name: 'about', type: 'richText', label: 'O firmie' },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Zdjęcie główne' },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Usługi',
      index: true,
    },
    {
      name: 'serviceArea',
      type: 'relationship',
      relationTo: 'localities',
      hasMany: true,
      label: 'Obszar działania',
      index: true,
    },
    { name: 'baseLocality', type: 'relationship', relationTo: 'localities', label: 'Siedziba' },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
      validate: (value: unknown) =>
        !value || (typeof value === 'string' && PHONE_PL.test(value)) || 'Podaj numer z 9 cyframi.',
    },
    {
      name: 'website',
      type: 'text',
      label: 'Strona internetowa',
      validate: (value: unknown) =>
        !value ||
        (typeof value === 'string' && HTTPS_URL.test(value)) ||
        'Podaj adres zaczynający się od https://',
    },
    { name: 'vatInvoice', type: 'checkbox', label: 'Wystawia faktury VAT', defaultValue: false },
    {
      name: 'warrantyMonths',
      type: 'number',
      label: 'Gwarancja (miesiące)',
      validate: int(0, 120),
    },
    { name: 'yearsExperience', type: 'number', label: 'Lata doświadczenia', validate: int(0, 80) },
    { name: 'teamSize', type: 'number', label: 'Wielkość ekipy', validate: int(1, 500) },
    {
      name: 'availability',
      type: 'group',
      label: 'Najbliższy wolny termin',
      fields: [
        {
          name: 'date',
          type: 'text',
          label: 'Data (RRRR-MM-DD)',
          index: true,
          validate: (value: unknown, { previousValue }: { previousValue?: unknown }) =>
            checkAvailabilityDate(value, previousValue),
        },
        {
          name: 'confirmedAt',
          type: 'date',
          label: 'Potwierdzony',
          access: systemOnly,
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: options({
        draft: 'Szkic',
        pending_review: 'Czeka na weryfikację',
        active: 'Aktywna',
        suspended: 'Zawieszona',
        rejected: 'Odrzucona',
      }),
      access: moderationOnly,
    },
    {
      name: 'moderationReason',
      type: 'textarea',
      label: 'Uzasadnienie decyzji',
      access: { read: ownerOrModeration, ...moderationOnly },
    },
    { name: 'trialStartsAt', type: 'date', label: 'Okres próbny od', access: internal },
    { name: 'trialEndsAt', type: 'date', label: 'Okres próbny do', access: internal },
    {
      name: 'subscriptionStatus',
      type: 'select',
      label: 'Abonament',
      required: true,
      defaultValue: 'trial',
      options: options({
        trial: 'Okres próbny',
        active: 'Aktywny',
        past_due: 'Zaległa płatność',
        canceled: 'Anulowany',
      }),
      access: internal,
    },
    {
      // Znaczniki wysłanych przypomnień – zadania nie wysyłają tego samego dwa razy (SPEC 5).
      name: 'mailLog',
      type: 'group',
      label: 'Wysłane przypomnienia',
      access: { read: ownerOrModeration, ...systemOnly },
      admin: { readOnly: true },
      fields: [
        { name: 'availabilityReminderAt', type: 'date', label: 'Przypomnienie o terminie' },
        { name: 'availabilityExpiredAt', type: 'date', label: 'Termin wygasł' },
        { name: 'trialEnding7At', type: 'date', label: 'Koniec okresu próbnego za 7 dni' },
        { name: 'trialEnding1At', type: 'date', label: 'Koniec okresu próbnego za 1 dzień' },
      ],
    },
    {
      name: 'ratingAvg',
      type: 'number',
      label: 'Średnia ocen',
      access: systemOnly,
      admin: { readOnly: true },
    },
    {
      name: 'ratingCount',
      type: 'number',
      label: 'Liczba opinii',
      defaultValue: 0,
      access: systemOnly,
      admin: { readOnly: true },
    },
  ],
}
