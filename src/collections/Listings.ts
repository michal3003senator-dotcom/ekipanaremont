import type { CollectionConfig, PayloadRequest } from 'payload'

import {
  admin,
  all,
  either,
  fieldFor,
  isFirmUser,
  moderation,
  nobody,
  ownFirm,
  verifiedModeration,
  where,
} from '@/access'
import { community } from '@/access/community'
import { assignOwnFirm } from '@/hooks/assignOwner'

import { encrypted, options, systemOnly } from './fields'

const member = community('marketplace')
const moderationOnly = {
  create: fieldFor(verifiedModeration),
  update: fieldFor(verifiedModeration),
}

/**
 * Ogłoszenie giełdy (SPEC 3.10). Numer seryjny (S) wpisuje firma, czyta tylko moderacja.
 * Statusy `active` i `hidden` ustawia moderacja albo system (akceptacja, wygasanie, zgłoszenia kradzieży).
 */
export const Listings: CollectionConfig = {
  slug: 'listings',
  labels: { singular: 'Ogłoszenie', plural: 'Ogłoszenia' },
  admin: {
    defaultColumns: ['title', 'firm', 'type', 'status', 'expiresAt'],
    useAsTitle: 'title',
    group: 'Giełda',
  },
  access: {
    read: either(
      moderation,
      all(member, either(ownFirm(), where({ status: { in: ['active', 'reserved'] } }))),
    ),
    create: member,
    update: either(moderation, all(member, ownFirm())),
    delete: either(moderation, all(member, ownFirm())),
  },
  indexes: [{ fields: ['status', 'category', 'expiresAt'] }],
  hooks: { beforeValidate: [assignOwnFirm()] },
  fields: [
    {
      name: 'firm',
      type: 'relationship',
      relationTo: 'firms',
      label: 'Firma',
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Rodzaj',
      required: true,
      options: options({ sell: 'Sprzedam', swap: 'Zamienię' }),
    },
    {
      name: 'category',
      type: 'select',
      label: 'Kategoria',
      required: true,
      options: options({
        power_tools: 'Elektronarzędzia',
        machines: 'Maszyny',
        scaffolding: 'Rusztowania i drabiny',
        hand_tools: 'Narzędzia ręczne',
        surplus_materials: 'Nadwyżki materiałów',
        other: 'Inne',
      }),
    },
    { name: 'title', type: 'text', label: 'Tytuł', required: true, minLength: 5, maxLength: 120 },
    { name: 'description', type: 'textarea', label: 'Opis', required: true, maxLength: 5000 },
    {
      name: 'condition',
      type: 'select',
      label: 'Stan',
      options: options({ new: 'Nowy', used: 'Używany', damaged: 'Uszkodzony' }),
    },
    { name: 'priceGrosze', type: 'number', label: 'Cena (gr)', min: 0, max: 100_000_000 },
    { name: 'negotiable', type: 'checkbox', label: 'Do negocjacji', defaultValue: false },
    { name: 'swapFor', type: 'text', label: 'Zamienię na', maxLength: 200 },
    { name: 'vatInvoice', type: 'checkbox', label: 'Faktura VAT', defaultValue: false },
    { name: 'locality', type: 'relationship', relationTo: 'localities', label: 'Miejscowość' },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 10,
      label: 'Zdjęcia',
    },
    encrypted(
      'listings',
      { name: 'serialNumber', label: 'Numer seryjny', maxLength: 100 },
      [verifiedModeration],
      {
        writers: [verifiedModeration, isFirmUser],
      },
    ),
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: options({
        draft: 'Szkic',
        pending: 'Czeka na akceptację',
        active: 'Aktywne',
        reserved: 'Zarezerwowane',
        sold: 'Sprzedane',
        expired: 'Wygasłe',
        hidden: 'Ukryte',
      }),
      validate: (
        value: unknown,
        {
          overrideAccess,
          previousValue,
          req,
        }: { overrideAccess?: boolean; previousValue?: unknown; req: PayloadRequest },
      ) =>
        value === previousValue ||
        overrideAccess ||
        verifiedModeration(req.user) ||
        ['draft', 'pending', 'reserved', 'sold'].includes(String(value)) ||
        'Ten status ustawia moderacja.',
    },
    { name: 'expiresAt', type: 'date', label: 'Wygasa', index: true, access: moderationOnly },
    {
      name: 'viewCount',
      type: 'number',
      label: 'Wyświetlenia',
      defaultValue: 0,
      access: systemOnly,
    },
    {
      name: 'theftReportCount',
      type: 'number',
      label: 'Zgłoszenia kradzieży',
      defaultValue: 0,
      access: systemOnly,
    },
  ],
}

/** Wiadomość do sprzedającego (SPEC 3.10): zapis w bazie i przekazanie e-mailem bez ujawniania adresów. */
export const ListingMessages: CollectionConfig = {
  slug: 'listingMessages',
  labels: { singular: 'Wiadomość', plural: 'Wiadomości' },
  admin: { defaultColumns: ['listing', 'fromFirm', 'createdAt'], group: 'Giełda' },
  access: {
    read: either(moderation, all(member, either(ownFirm('fromFirm'), ownFirm('listing.firm')))),
    create: member,
    update: nobody,
    delete: admin,
  },
  hooks: { beforeValidate: [assignOwnFirm('fromFirm')] },
  fields: [
    {
      name: 'listing',
      type: 'relationship',
      relationTo: 'listings',
      label: 'Ogłoszenie',
      required: true,
      index: true,
    },
    {
      name: 'fromFirm',
      type: 'relationship',
      relationTo: 'firms',
      label: 'Od firmy',
      required: true,
      index: true,
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Treść',
      required: true,
      minLength: 10,
      maxLength: 2000,
    },
    { name: 'deliveredAt', type: 'date', label: 'Przekazana e-mailem', access: systemOnly },
  ],
}
