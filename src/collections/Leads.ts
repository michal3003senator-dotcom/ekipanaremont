import type { CollectionConfig } from 'payload'

import { admin, nobody, verifiedAdmin } from '@/access'
import { emailHash } from '@/lib/crypto'

import { encrypted, hashField, options, systemOnly } from './fields'

/** Lead z kalkulatora (SPEC 3.8, 4): osobna zgoda, tylko administrator, retencja 12 miesięcy. */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leady' },
  admin: { defaultColumns: ['calculator', 'status', 'createdAt'], group: 'Treści' },
  access: { read: admin, create: nobody, update: admin, delete: admin },
  hooks: {
    beforeValidate: [
      ({ data }) =>
        typeof data?.email === 'string' ? { ...data, emailHash: emailHash(data.email) } : data,
    ],
  },
  fields: [
    {
      name: 'calculator',
      type: 'relationship',
      relationTo: 'calculators',
      label: 'Kalkulator',
      access: systemOnly,
    },
    { name: 'inputs', type: 'json', label: 'Dane wejściowe', access: systemOnly },
    { name: 'result', type: 'json', label: 'Wynik', access: systemOnly },
    encrypted('leads', { name: 'name', label: 'Imię' }, [verifiedAdmin]),
    encrypted('leads', { name: 'email', label: 'E-mail', required: true }, [verifiedAdmin]),
    hashField('emailHash'),
    encrypted('leads', { name: 'phone', label: 'Telefon' }, [verifiedAdmin]),
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
      options: options({ new: 'Nowy', contacted: 'Kontakt nawiązany', closed: 'Zamknięty' }),
    },
    { name: 'retentionUntil', type: 'date', label: 'Usunąć po', index: true, access: systemOnly },
  ],
}
