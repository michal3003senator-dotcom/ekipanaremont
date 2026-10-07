import type { CollectionConfig } from 'payload'

import { isStaff } from '../access/isStaff'

const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60
const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000

export const Staff: CollectionConfig = {
  slug: 'staff',
  labels: { singular: 'Pracownik', plural: 'Personel' },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'email',
  },
  auth: {
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
    lockTime: FIFTEEN_MINUTES_IN_MS,
    maxLoginAttempts: 5,
    tokenExpiration: EIGHT_HOURS_IN_SECONDS,
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: isStaff,
    update: isStaff,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Imię i nazwisko',
      required: true,
    },
  ],
}
