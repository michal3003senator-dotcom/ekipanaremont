import type { CollectionConfig, Field, NumberField } from 'payload'

import { editorial, either, where } from '@/access'
import {
  type CalculatorType,
  CALCULATOR_TYPES,
  checkCalculatorParams,
  isCalculatorType,
} from '@/lib/calculators/params'

import { slugField, uniqueSlug } from './fields'

const TYPE_LABELS: Record<CalculatorType, string> = {
  bathroomCost: 'Koszt remontu łazienki',
  tiles: 'Ilość płytek z zapasem',
  paint: 'Ilość farby',
  skimCoat: 'Koszt gładzi',
}

/** Kwota w groszach, w panelu wpisywana w złotych (MoneyField). */
const money = (name: string, label: string): NumberField => ({
  name,
  type: 'number',
  label,
  admin: { components: { Field: '/components/admin/MoneyField#MoneyField' } },
})

const range = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [{ type: 'row', fields: [money('min', 'Od'), money('max', 'Do')] }],
})

const number = (name: string, label: string, description: string): NumberField => ({
  name,
  type: 'number',
  label,
  admin: { description },
})

/** Parametry jednego rodzaju – widoczne tylko przy wybranym rodzaju kalkulatora. */
const paramsFor = (type: CalculatorType, fields: Field[]): Field => ({
  name: type,
  type: 'group',
  label: `Parametry: ${TYPE_LABELS[type]}`,
  admin: { condition: (data) => data?.type === type },
  fields,
})

/**
 * Kalkulator (SPEC 3.8): komponent wybierany rodzajem, wszystkie parametry edytowane w panelu.
 * W kodzie nie ma wartości domyślnych – kalkulator bez kompletu parametrów nie przejdzie publikacji.
 */
export const Calculators: CollectionConfig = {
  slug: 'calculators',
  labels: { singular: 'Kalkulator', plural: 'Kalkulatory' },
  admin: {
    defaultColumns: ['title', 'type', '_status'],
    useAsTitle: 'title',
    group: 'Treści',
  },
  access: {
    read: either(editorial, where({ _status: { equals: 'published' } })),
    readVersions: editorial,
    create: editorial,
    update: editorial,
    delete: editorial,
  },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: { beforeValidate: [uniqueSlug('calculators')] },
  fields: [
    { name: 'title', type: 'text', label: 'Tytuł', required: true, maxLength: 120 },
    slugField('title'),
    {
      name: 'type',
      type: 'select',
      label: 'Rodzaj',
      required: true,
      unique: true,
      options: CALCULATOR_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
      // Szkic zapisuje się bez walidacji; publikacja wymaga kompletu parametrów danego rodzaju.
      validate: (value: unknown, { data }: { data: Record<string, unknown> }) =>
        checkCalculatorParams(value, isCalculatorType(value) ? data?.[value] : undefined),
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Wstęp nad kalkulatorem',
      maxLength: 400,
    },
    paramsFor('bathroomCost', [
      range('labourPerM2', 'Robocizna za m² podłogi'),
      range('materialsPerM2', 'Materiały za m² podłogi'),
    ]),
    paramsFor('tiles', [
      number(
        'wastePercent',
        'Zapas (%)',
        'Doliczany do powierzchni, np. 10 przy układaniu prostym.',
      ),
    ]),
    paramsFor('paint', [
      number(
        'coverageM2PerLitre',
        'Wydajność (m² z litra)',
        'Dla jednej warstwy, z etykiety farby.',
      ),
      number('coats', 'Liczba warstw', 'Od 1 do 4.'),
      number('wastePercent', 'Zapas (%)', 'Na nierówności i straty.'),
    ]),
    paramsFor('skimCoat', [
      number('kgPerM2PerMm', 'Zużycie (kg na m² przy 1 mm)', 'Z karty technicznej gładzi.'),
      number('bagKg', 'Waga worka (kg)', 'Do przeliczenia na worki.'),
      range('labourPerM2', 'Robocizna za m²'),
    ]),
    { name: 'disclaimer', type: 'textarea', label: 'Zastrzeżenie pod wynikiem', maxLength: 400 },
    {
      name: 'linkedService',
      type: 'relationship',
      relationTo: 'services',
      label: 'Usługa do wyszukiwarki',
      admin: { position: 'sidebar' },
    },
  ],
}
