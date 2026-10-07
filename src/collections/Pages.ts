import type { CollectionConfig } from 'payload'

import { anyone, editorial, either, where } from '@/access'
import { pageBlocks } from '@/blocks'
import { ROUTE_SLUGS } from '@/lib/validation'

import { options, seoField, slugField, uniqueSlug } from './fields'

const requiredForLegal =
  (message: string) =>
  (value: unknown, { siblingData }: { siblingData: { legalKind?: unknown } }) =>
    !siblingData.legalKind || Boolean(value) || message

/**
 * Strona (SPEC 3.8) pod adresem `/[slug]`: regulamin, polityki, O nas, Kontakt i inne.
 * Dokument prawny (`legalKind`) jest jedynym źródłem wersji regulaminu i polityki (PLAN pyt. 12);
 * opublikowane wersje tworzą publiczne archiwum.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Strona', plural: 'Strony' },
  admin: {
    defaultColumns: ['title', 'slug', 'legalVersion', '_status'],
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
  // Autozapis szkicu – podgląd na żywo odświeża się w trakcie pisania (ADR 0023).
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 100 },
  hooks: { beforeValidate: [uniqueSlug('pages')] },
  fields: [
    { name: 'title', type: 'text', label: 'Tytuł', required: true, maxLength: 120 },
    slugField('title', { reserved: ROUTE_SLUGS, notIn: 'services' }),
    { name: 'content', type: 'blocks', label: 'Treść', blocks: pageBlocks },
    {
      name: 'legalKind',
      type: 'select',
      label: 'Dokument prawny',
      unique: true,
      options: options({ terms: 'Regulamin', privacy: 'Polityka prywatności' }),
      admin: {
        position: 'sidebar',
        description: 'Wersja tego dokumentu trafia do zgód przy rejestracji i formularzach.',
      },
    },
    {
      name: 'legalVersion',
      type: 'text',
      label: 'Wersja dokumentu',
      maxLength: 20,
      validate: requiredForLegal('Podaj wersję dokumentu, np. 1.2.'),
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.legalKind) },
    },
    {
      name: 'effectiveFrom',
      type: 'date',
      label: 'Obowiązuje od',
      validate: requiredForLegal('Podaj datę, od której dokument obowiązuje.'),
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.legalKind) },
    },
    seoField,
  ],
}

/** Opcjonalny wstęp strony lokalnej `/[usluga]/[miejscowosc]` (SPEC 3.14). */
export const LocalIntros: CollectionConfig = {
  slug: 'localIntros',
  labels: { singular: 'Wstęp strony lokalnej', plural: 'Wstępy stron lokalnych' },
  admin: { defaultColumns: ['service', 'locality'], group: 'Treści' },
  access: { read: anyone, create: editorial, update: editorial, delete: editorial },
  indexes: [{ fields: ['service', 'locality'], unique: true }],
  fields: [
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      label: 'Usługa',
      required: true,
      filterOptions: { parent: { exists: false } },
    },
    {
      name: 'locality',
      type: 'relationship',
      relationTo: 'localities',
      label: 'Miejscowość',
      required: true,
      filterOptions: { type: { in: ['miejscowosc', 'dzielnica'] } },
    },
    { name: 'intro', type: 'richText', label: 'Wstęp' },
    seoField,
  ],
}
