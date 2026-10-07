import type { CollectionConfig } from 'payload'

import { admin, anyone } from '@/access'
import { normalizeSearch } from '@/lib/format/search'

import { options, slugField } from './fields'

/** Słownik miejscowości z TERYT (SPEC 1, 4) z kolumną do wyszukiwania bez polskich znaków (pg_trgm). */
export const Localities: CollectionConfig = {
  slug: 'localities',
  labels: { singular: 'Miejscowość', plural: 'Miejscowości' },
  admin: {
    defaultColumns: ['name', 'type', 'parent', 'terytId'],
    useAsTitle: 'name',
    group: 'Słowniki',
  },
  access: { read: anyone, create: admin, update: admin, delete: admin },
  hooks: {
    beforeChange: [
      ({ data }) =>
        data.name ? { ...data, nameSearch: normalizeSearch(String(data.name)) } : data,
    ],
  },
  fields: [
    {
      name: 'terytId',
      type: 'text',
      label: 'Identyfikator TERYT',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'name', type: 'text', label: 'Nazwa', required: true, index: true },
    { name: 'nameSearch', type: 'text', label: 'Nazwa do wyszukiwania', admin: { hidden: true } },
    {
      name: 'type',
      type: 'select',
      label: 'Rodzaj',
      required: true,
      index: true,
      options: options({
        wojewodztwo: 'Województwo',
        powiat: 'Powiat',
        gmina: 'Gmina',
        miejscowosc: 'Miejscowość',
        dzielnica: 'Dzielnica',
      }),
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'localities',
      label: 'Jednostka nadrzędna',
      index: true,
    },
    // Nazwy się powtarzają (np. Nowa Wieś) – import TERYT dopisuje do slugu gminę (faza 3.8).
    slugField('name'),
    { name: 'lat', type: 'number', label: 'Szerokość geogr.' },
    { name: 'lng', type: 'number', label: 'Długość geogr.' },
  ],
}
