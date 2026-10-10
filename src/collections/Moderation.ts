import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import {
  admin,
  either,
  idOf,
  isStaffUser,
  moderation,
  nobody,
  ownAccount,
  ownFirm,
  verifiedModeration,
} from '@/access'
import { auditHooks } from '@/hooks/audit'
import {
  reportDecisionNotices,
  requireStatementOfReasons,
  sanctionNotices,
} from '@/hooks/moderation'
import {
  REPORT_DECISIONS,
  REPORT_REASONS,
  REPORT_TARGETS,
  SANCTION_SCOPES,
  SANCTION_TYPES,
} from '@/lib/moderation/options'

import { encrypted, options, systemOnly } from './fields'

const TARGETS = options(REPORT_TARGETS)

/** Personel tworzący rekord zapisuje się sam (nie da się podać kogoś innego). */
const stampStaff =
  (field: string): CollectionBeforeValidateHook =>
  ({ data, operation, req: { user } }) =>
    operation === 'create' && data && isStaffUser(user) ? { ...data, [field]: idOf(user) } : data

/**
 * Zgłoszenie treści (DSA, SPEC 3.13): tworzy je Server Action (Turnstile, Zod). Dane zgłaszającego (S)
 * i oświadczenie o dobrej wierze (art. 16 DSA). Decyzja z uzasadnieniem i możliwością odwołania.
 */
export const Reports: CollectionConfig = {
  slug: 'reports',
  labels: { singular: 'Zgłoszenie', plural: 'Zgłoszenia' },
  admin: { defaultColumns: ['targetType', 'reason', 'status', 'createdAt'], group: 'Moderacja' },
  access: { read: moderation, create: nobody, update: moderation, delete: admin },
  hooks: {
    afterChange: [...auditHooks.afterChange, reportDecisionNotices],
    afterDelete: auditHooks.afterDelete,
    beforeChange: [
      requireStatementOfReasons,
      ({ data, originalDoc, req: { user } }) =>
        data.status !== originalDoc?.status &&
        (data.status === 'resolved' || data.status === 'rejected')
          ? { ...data, decidedBy: idOf(user), decidedAt: new Date().toISOString() }
          : data,
    ],
  },
  fields: [
    {
      name: 'targetType',
      type: 'select',
      label: 'Dotyczy',
      required: true,
      index: true,
      options: TARGETS,
      access: systemOnly,
    },
    {
      name: 'targetId',
      type: 'text',
      label: 'ID treści',
      required: true,
      index: true,
      access: systemOnly,
    },
    {
      name: 'targetTitle',
      type: 'text',
      label: 'Czego dotyczy',
      maxLength: 200,
      access: systemOnly,
    },
    {
      name: 'reason',
      type: 'select',
      label: 'Powód',
      required: true,
      access: systemOnly,
      options: options(REPORT_REASONS),
    },
    { name: 'description', type: 'textarea', label: 'Opis', maxLength: 2000, access: systemOnly },
    encrypted(
      'reports',
      { name: 'reporterName', label: 'Imię i nazwisko zgłaszającego' },
      [verifiedModeration],
      { writers: [] },
    ),
    encrypted(
      'reports',
      { name: 'reporterEmail', label: 'E-mail zgłaszającego' },
      [verifiedModeration],
      { writers: [] },
    ),
    {
      name: 'reporterAccount',
      type: 'relationship',
      relationTo: 'firmAccounts',
      label: 'Konto zgłaszające',
      access: systemOnly,
    },
    {
      name: 'goodFaithConfirmed',
      type: 'checkbox',
      label: 'Oświadczenie o dobrej wierze',
      access: systemOnly,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'new',
      index: true,
      options: options({
        new: 'Nowe',
        in_review: 'W trakcie',
        resolved: 'Rozpatrzone',
        rejected: 'Odrzucone',
      }),
    },
    {
      name: 'decision',
      type: 'select',
      label: 'Decyzja',
      options: options(REPORT_DECISIONS),
    },
    {
      name: 'statementOfReasons',
      type: 'textarea',
      label: 'Uzasadnienie decyzji',
      maxLength: 5000,
    },
    {
      name: 'decidedBy',
      type: 'relationship',
      relationTo: 'staff',
      label: 'Decyzję podjął',
      access: systemOnly,
    },
    { name: 'decidedAt', type: 'date', label: 'Data decyzji', access: systemOnly },
    {
      name: 'appealOf',
      type: 'relationship',
      relationTo: 'reports',
      label: 'Odwołanie od',
      access: systemOnly,
    },
  ],
}

/** Sankcja (SPEC 3.11): ostrzeżenie albo blokada czasowa forum, giełdy lub konta. Firma widzi swoje. */
export const Sanctions: CollectionConfig = {
  slug: 'sanctions',
  labels: { singular: 'Sankcja', plural: 'Sankcje' },
  admin: { defaultColumns: ['account', 'scope', 'type', 'until'], group: 'Moderacja' },
  access: {
    read: either(moderation, ownAccount('account')),
    create: moderation,
    update: moderation,
    delete: admin,
  },
  hooks: {
    afterChange: [...auditHooks.afterChange, sanctionNotices],
    afterDelete: auditHooks.afterDelete,
    beforeValidate: [stampStaff('createdBy')],
  },
  fields: [
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'firmAccounts',
      label: 'Konto',
      required: true,
      index: true,
    },
    {
      name: 'scope',
      type: 'select',
      label: 'Zakres',
      required: true,
      options: options(SANCTION_SCOPES),
    },
    {
      name: 'type',
      type: 'select',
      label: 'Rodzaj',
      required: true,
      options: options(SANCTION_TYPES),
    },
    { name: 'until', type: 'date', label: 'Do (puste = bezterminowo)', index: true },
    { name: 'reason', type: 'textarea', label: 'Uzasadnienie', required: true, maxLength: 5000 },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'staff',
      label: 'Nałożył',
      access: systemOnly,
    },
  ],
}

/** Dzienne statystyki firmy (SPEC 4): zapis tylko przez system, odczyt – firma i administrator. */
export const FirmStatsDaily: CollectionConfig = {
  slug: 'firmStatsDaily',
  labels: { singular: 'Statystyka dzienna', plural: 'Statystyki dzienne' },
  admin: { defaultColumns: ['firm', 'date', 'views', 'inquiries'], group: 'Firmy' },
  access: { read: either(admin, ownFirm()), create: nobody, update: nobody, delete: nobody },
  indexes: [{ fields: ['firm', 'date'], unique: true }],
  fields: [
    { name: 'firm', type: 'relationship', relationTo: 'firms', label: 'Firma', required: true },
    { name: 'date', type: 'text', label: 'Dzień (RRRR-MM-DD)', required: true },
    { name: 'views', type: 'number', label: 'Wyświetlenia', defaultValue: 0 },
    { name: 'phoneReveals', type: 'number', label: 'Odsłonięcia telefonu', defaultValue: 0 },
    { name: 'inquiries', type: 'number', label: 'Zapytania', defaultValue: 0 },
  ],
}

/** Dziennik zmian (SPEC 4): tylko dopisywanie, bez wartości pól. Zmiana wpisu jest niemożliwa. */
export const AuditLog: CollectionConfig = {
  slug: 'auditLog',
  labels: { singular: 'Wpis dziennika', plural: 'Dziennik zmian' },
  admin: {
    defaultColumns: ['createdAt', 'actorType', 'action', 'targetCollection', 'docId'],
    group: 'Administracja',
  },
  access: { read: admin, create: nobody, update: nobody, delete: nobody },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation !== 'create') throw new Error('Dziennik zmian jest tylko do dopisywania.')
        return data
      },
    ],
  },
  fields: [
    { name: 'actor', type: 'text', label: 'Kto (ID)', index: true },
    {
      name: 'actorType',
      type: 'select',
      label: 'Rodzaj',
      required: true,
      options: options({ staff: 'Personel', firm: 'Firma', system: 'System' }),
    },
    {
      name: 'action',
      type: 'select',
      label: 'Akcja',
      required: true,
      options: options({ create: 'Utworzenie', update: 'Zmiana', delete: 'Usunięcie' }),
    },
    { name: 'targetCollection', type: 'text', label: 'Kolekcja', required: true, index: true },
    { name: 'docId', type: 'text', label: 'ID rekordu', required: true, index: true },
    { name: 'changedFields', type: 'text', hasMany: true, label: 'Zmienione pola' },
    { name: 'ipHash', type: 'text', hidden: true },
  ],
}
