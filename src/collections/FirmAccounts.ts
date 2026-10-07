import type { Access, CollectionConfig } from 'payload'

import { admin, either, fieldFor, verifiedAdmin } from '@/access'
import { auditHooks } from '@/hooks/audit'

const THIRTY_DAYS_S = 30 * 24 * 60 * 60
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

const self: Access = ({ req: { user } }) =>
  user?.collection === 'firmAccounts' ? { id: { equals: user.id } } : false

/** Konto firmy (SPEC 4). Rejestracja przez Server Action z Turnstile (faza 4), nie przez REST. */
export const FirmAccounts: CollectionConfig = {
  slug: 'firmAccounts',
  labels: { singular: 'Konto firmy', plural: 'Konta firm' },
  admin: { defaultColumns: ['email', 'firm', '_verified'], useAsTitle: 'email', group: 'Firmy' },
  auth: {
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
    lockTime: FIFTEEN_MINUTES_MS,
    maxLoginAttempts: 5,
    // Sesja 30 dni (PLAN pyt. 5); zmiana e-maila, hasła, eksport i usunięcie wymagają hasła (faza 4).
    tokenExpiration: THIRTY_DAYS_S,
    verify: true,
    // Link do zmiany hasła ważny godzinę (ADR 0018); e-mail wysyła Server Action z wersją tekstową.
    forgotPassword: { expiration: 60 * 60 * 1000 },
  },
  access: {
    // Ciasteczko sesji jest wspólne dla kolekcji z logowaniem – konto firmy nie wchodzi do panelu Payload.
    admin: () => false,
    read: either(admin, self),
    create: admin,
    update: either(admin, self),
    delete: admin,
    unlock: admin,
  },
  hooks: auditHooks,
  fields: [
    {
      name: 'firm',
      type: 'relationship',
      relationTo: 'firms',
      label: 'Firma',
      saveToJWT: true,
      access: { update: fieldFor(verifiedAdmin) },
    },
    {
      name: 'termsVersion',
      type: 'text',
      label: 'Wersja regulaminu',
      access: { update: fieldFor(verifiedAdmin) },
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      label: 'Akceptacja regulaminu',
      access: { update: fieldFor(verifiedAdmin) },
    },
    {
      name: 'notificationPrefs',
      type: 'group',
      label: 'Powiadomienia e-mail',
      fields: [
        { name: 'inquiries', type: 'checkbox', label: 'Nowe zapytania', defaultValue: true },
        {
          name: 'availabilityReminders',
          type: 'checkbox',
          label: 'Przypomnienia o terminie',
          defaultValue: true,
        },
        { name: 'reviews', type: 'checkbox', label: 'Nowe opinie', defaultValue: true },
      ],
    },
    {
      // Link weryfikacyjny jest ważny 24 h od wysłania (ADR 0018).
      name: 'verificationSentAt',
      type: 'date',
      label: 'Link weryfikacyjny wysłany',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
  ],
}
