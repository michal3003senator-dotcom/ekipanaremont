import type { GlobalConfig } from 'payload'

import { admin, staff } from '@/access'

const days = (name: string, label: string, defaultValue: number, max = 365) =>
  ({ name, type: 'number', label, required: true, defaultValue, min: 1, max }) as const

/** Ustawienia serwisu (SPEC 3.12): flagi modułów, parametry dni, wersje dokumentów, moderacja. */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Ustawienia',
  admin: { group: 'Administracja' },
  // Serwer czyta przez Local API; lista słów do wstrzymania nie może wyciec publicznie.
  access: { read: staff(), update: admin },
  fields: [
    {
      name: 'featureFlags',
      type: 'group',
      label: 'Moduły',
      fields: [
        { name: 'forum', type: 'checkbox', label: 'Forum firm', defaultValue: false },
        { name: 'marketplace', type: 'checkbox', label: 'Giełda', defaultValue: false },
        { name: 'calculators', type: 'checkbox', label: 'Kalkulatory', defaultValue: true },
      ],
    },
    days('reviewDelayDays', 'Prośba o opinię po (dni)', 14),
    days('availabilityReminderDays', 'Przypomnienie o terminie po (dni)', 10),
    days('availabilityExpiryDays', 'Termin wygasa po (dni)', 14),
    days('listingExpiryDays', 'Ogłoszenie wygasa po (dni)', 30),
    {
      name: 'retention',
      type: 'group',
      label: 'Retencja',
      fields: [
        {
          name: 'inquiriesMonths',
          type: 'number',
          label: 'Zapytania (miesiące)',
          required: true,
          defaultValue: 24,
          min: 1,
          max: 120,
        },
        {
          name: 'leadsMonths',
          type: 'number',
          label: 'Leady (miesiące)',
          required: true,
          defaultValue: 12,
          min: 1,
          max: 120,
        },
      ],
    },
    {
      name: 'moderationReasonTemplates',
      type: 'array',
      label: 'Szablony uzasadnień',
      fields: [
        { name: 'label', type: 'text', label: 'Nazwa', required: true },
        { name: 'text', type: 'textarea', label: 'Treść', required: true },
      ],
    },
    {
      name: 'holdWords',
      type: 'text',
      hasMany: true,
      label: 'Słowa wstrzymujące wpis do moderacji',
    },
  ],
}
