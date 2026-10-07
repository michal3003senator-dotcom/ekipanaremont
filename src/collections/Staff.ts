import type { CollectionConfig } from 'payload'

import { admin, either, fieldFor, isStaffUser, isVerifiedStaff, verifiedAdmin } from '@/access'
import { auditHooks } from '@/hooks/audit'

const EIGHT_HOURS_S = 8 * 60 * 60
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

/** Personel (SPEC 4): 2FA TOTP obowiązkowe (payload-totp, ADR 0016), sesja 8 h (PLAN pyt. 5). */
export const Staff: CollectionConfig = {
  slug: 'staff',
  labels: { singular: 'Pracownik', plural: 'Personel' },
  admin: { defaultColumns: ['name', 'email', 'role'], useAsTitle: 'email', group: 'Administracja' },
  auth: {
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
    lockTime: FIFTEEN_MINUTES_MS,
    maxLoginAttempts: 5,
    tokenExpiration: EIGHT_HOURS_S,
  },
  access: {
    // Panel otwiera się bez kodu tylko po to, by wtyczka przekierowała do ustawienia lub podania kodu TOTP.
    admin: ({ req: { user } }) => isStaffUser(user),
    // Własne konto widać także przed podaniem kodu (widok ustawienia 2FA); zmiany – dopiero po kodzie.
    read: either(admin, ({ req: { user } }) =>
      isStaffUser(user) ? { id: { equals: user?.id } } : false,
    ),
    create: admin,
    update: either(admin, ({ req: { user } }) =>
      isVerifiedStaff(user) ? { id: { equals: user?.id } } : false,
    ),
    delete: admin,
    unlock: admin,
  },
  hooks: {
    ...auditHooks,
    afterLogin: [
      async ({ req, user }) => {
        await req.payload.update({
          collection: 'staff',
          id: user.id,
          data: { lastLoginAt: new Date().toISOString() },
          overrideAccess: true,
          req,
          context: { skipAudit: true },
        })
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Imię i nazwisko', required: true },
    {
      name: 'role',
      type: 'select',
      label: 'Rola',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'moderator', label: 'Moderator' },
        { value: 'editor', label: 'Redaktor' },
      ],
      // Rolę zmienia tylko administrator – nikt nie nada jej sobie sam.
      access: { create: fieldFor(verifiedAdmin), update: fieldFor(verifiedAdmin) },
    },
    { name: 'lastLoginAt', type: 'date', label: 'Ostatnie logowanie', admin: { readOnly: true } },
  ],
}
