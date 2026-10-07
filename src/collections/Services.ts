import type { CollectionConfig } from 'payload'

import { admin, anyone } from '@/access'
import { auditHooks } from '@/hooks/audit'
import { RESERVED_SLUGS } from '@/lib/validation'

import { seoField, slugField } from './fields'

/** Słownik usług z podusługami (SPEC 4). Slug tworzy adresy `/[usluga]/[miejscowosc]` (SPEC 3.14). */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Usługa', plural: 'Usługi' },
  admin: { defaultColumns: ['name', 'slug', 'parent'], useAsTitle: 'name', group: 'Słowniki' },
  access: { read: anyone, create: admin, update: admin, delete: admin },
  hooks: auditHooks,
  fields: [
    { name: 'name', type: 'text', label: 'Nazwa', required: true },
    slugField('name', { reserved: RESERVED_SLUGS, notIn: 'pages' }),
    { name: 'parent', type: 'relationship', relationTo: 'services', label: 'Usługa nadrzędna' },
    { name: 'icon', type: 'text', label: 'Ikona (nazwa z lucide)' },
    { name: 'description', type: 'textarea', label: 'Opis' },
    seoField,
  ],
}
