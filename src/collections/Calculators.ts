import type { CollectionConfig } from 'payload'

import { anyone, editorial } from '@/access'
import { CALCULATOR_TYPES, checkCalculatorParams } from '@/lib/calculators/params'

import { slugField } from './fields'

const TYPE_LABELS: Record<(typeof CALCULATOR_TYPES)[number], string> = {
  bathroomCost: 'Koszt remontu łazienki',
  tiles: 'Ilość płytek z zapasem',
  paint: 'Ilość farby',
  skimCoat: 'Koszt gładzi',
}

/** Kalkulator (SPEC 3.8): komponent React wybierany typem, parametry z CMS walidowane schematem typu. */
export const Calculators: CollectionConfig = {
  slug: 'calculators',
  labels: { singular: 'Kalkulator', plural: 'Kalkulatory' },
  admin: { defaultColumns: ['title', 'type'], useAsTitle: 'title', group: 'Treści' },
  access: { read: anyone, create: editorial, update: editorial, delete: editorial },
  fields: [
    { name: 'title', type: 'text', label: 'Tytuł', required: true },
    slugField('title'),
    {
      name: 'type',
      type: 'select',
      label: 'Rodzaj',
      required: true,
      unique: true,
      options: CALCULATOR_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
    },
    {
      name: 'params',
      type: 'json',
      label: 'Parametry',
      required: true,
      validate: (value: unknown, { siblingData }: { siblingData: { type?: unknown } }) =>
        checkCalculatorParams(siblingData.type, value),
    },
    { name: 'disclaimer', type: 'textarea', label: 'Zastrzeżenie pod wynikiem' },
    {
      name: 'linkedService',
      type: 'relationship',
      relationTo: 'services',
      label: 'Usługa do wyszukiwarki',
    },
  ],
}
