import type {
  CollectionBeforeValidateHook,
  CollectionSlug,
  Field,
  PayloadRequest,
  TextareaField,
  TextField,
} from 'payload'

import { fieldFor } from '@/access'
import { encryptedFieldHooks } from '@/lib/crypto'
import { slugify } from '@/lib/validation'

type UserCheck = (user: PayloadRequest['user']) => boolean
type BaseField = Omit<TextField, 'type' | 'hooks' | 'access'>

/**
 * Pole (S): szyfrowane AES-256-GCM w hookach (ADR 0007), czytelne tylko dla `readers`,
 * zmieniane przez `writers` (domyślnie ci sami). Bez kolumny i filtra w panelu.
 */
export function encrypted(
  collection: string,
  field: BaseField,
  readers: UserCheck[],
  { type = 'text', writers = readers }: { type?: 'text' | 'textarea'; writers?: UserCheck[] } = {},
): Field {
  return {
    ...field,
    type,
    hooks: encryptedFieldHooks(`${collection}.${field.name}`),
    access: { read: fieldFor(...readers), update: fieldFor(...writers) },
    admin: { ...field.admin, disableListColumn: true, disableListFilter: true },
  } as TextField | TextareaField
}

/** Pole zapisywane tylko przez system (Local API z `overrideAccess` albo hook kolekcji). */
export const systemOnly = { create: () => false, update: () => false }

/** Skrót HMAC (H) – tylko do wyszukiwania po stronie serwera, nigdy w odpowiedziach API. */
export const hashField = (name: string): Field => ({
  name,
  type: 'text',
  index: true,
  hidden: true,
  access: systemOnly,
})

export const options = <T extends string>(entries: Record<T, string>) =>
  (Object.entries(entries) as Array<[T, string]>).map(([value, label]) => ({ value, label }))

type SlugOptions = {
  /** Adresy zajęte przez trasy aplikacji (ADR 0022). */
  reserved?: ReadonlySet<string>
  /** Druga kolekcja w tym samym miejscu adresu (strony z CMS i usługi w `/[slug]`). */
  notIn?: CollectionSlug
}

/** Unikalny slug z polskich znaków (ł → l), wypełniany z `source`, bez zastrzeżonych adresów. */
export const slugField = (source: string, { reserved, notIn }: SlugOptions = {}): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Adres (slug)',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Uzupełnia się z nazwy. Małe litery, cyfry i myślniki.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const text = typeof value === 'string' && value !== '' ? value : data?.[source]
        return typeof text === 'string' ? slugify(text) : value
      },
    ],
  },
  validate: async (value: unknown, { req }: { req: PayloadRequest }) => {
    if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'Użyj małych liter, cyfr i myślników.'
    }
    if (reserved?.has(value)) return 'Ten adres jest zarezerwowany.'
    if (notIn) {
      const { totalDocs } = await req.payload.count({
        collection: notIn,
        where: { slug: { equals: value } },
        overrideAccess: true,
        req,
      })
      if (totalDocs > 0) return 'Ten adres jest już zajęty w serwisie.'
    }
    return true
  },
})

/** SEO: tytuł, opis, obrazek, adres kanoniczny (SPEC 3.8). */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    { name: 'title', type: 'text', label: 'Tytuł', maxLength: 70 },
    { name: 'description', type: 'textarea', label: 'Opis', maxLength: 170 },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Obrazek do udostępniania' },
    {
      name: 'canonical',
      type: 'text',
      label: 'Adres kanoniczny',
      validate: (value: unknown) =>
        !value ||
        (typeof value === 'string' && /^https:\/\/\S+$/.test(value)) ||
        'Podaj pełny adres https://',
    },
  ],
}

/**
 * Unikalny slug bez błędu przy powtórzonej nazwie: „remonty-kowalski”, „remonty-kowalski-2”…
 * (firmy o tej samej nazwie, wątki forum o tym samym tytule).
 */
export const uniqueSlug =
  (collection: CollectionSlug): CollectionBeforeValidateHook =>
  async ({ data, originalDoc, req }) => {
    const base = typeof data?.slug === 'string' && data.slug ? data.slug : null
    if (!data || !base || base === originalDoc?.slug) return data
    for (let attempt = 1; attempt < 50; attempt += 1) {
      const slug = attempt === 1 ? base : `${base}-${attempt}`
      const { totalDocs } = await req.payload.count({
        collection,
        where: {
          slug: { equals: slug },
          ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
        },
        overrideAccess: true,
        req,
      })
      if (totalDocs === 0) return { ...data, slug }
    }
    return data
  }
