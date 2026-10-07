import type { Block } from 'payload'

import { HTTPS_URL } from '@/lib/validation'

/** Link przycisku: ścieżka w serwisie albo pełny adres https (bez `javascript:` i innych schematów). */
const SAFE_HREF = /^\/(?!\/)[^\s]*$/

const text: Block = {
  slug: 'text',
  labels: { singular: 'Tekst', plural: 'Teksty' },
  fields: [{ name: 'body', type: 'richText', label: 'Treść', required: true }],
}

const heading: Block = {
  slug: 'heading',
  labels: { singular: 'Nagłówek', plural: 'Nagłówki' },
  fields: [
    { name: 'text', type: 'text', label: 'Tekst', required: true },
    { name: 'level', type: 'select', label: 'Poziom', defaultValue: 'h2', options: ['h2', 'h3'] },
  ],
}

const image: Block = {
  slug: 'image',
  labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie', required: true },
    { name: 'caption', type: 'text', label: 'Podpis' },
  ],
}

const gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Galeria', plural: 'Galerie' },
  fields: [
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      minRows: 2,
      maxRows: 24,
      label: 'Zdjęcia',
      required: true,
    },
  ],
}

const quote: Block = {
  slug: 'quote',
  labels: { singular: 'Cytat', plural: 'Cytaty' },
  fields: [
    { name: 'text', type: 'textarea', label: 'Cytat', required: true },
    { name: 'author', type: 'text', label: 'Autor' },
  ],
}

const faq: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Pytania',
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', label: 'Pytanie', required: true },
        { name: 'answer', type: 'textarea', label: 'Odpowiedź', required: true },
      ],
    },
  ],
}

const table: Block = {
  slug: 'table',
  labels: { singular: 'Tabela', plural: 'Tabele' },
  fields: [
    { name: 'caption', type: 'text', label: 'Opis tabeli (dla czytników ekranu)', required: true },
    { name: 'header', type: 'text', hasMany: true, label: 'Nagłówki kolumn', required: true },
    {
      name: 'rows',
      type: 'array',
      label: 'Wiersze',
      minRows: 1,
      fields: [{ name: 'cells', type: 'text', hasMany: true, label: 'Komórki', required: true }],
    },
  ],
}

const cta: Block = {
  slug: 'cta',
  labels: { singular: 'Przycisk', plural: 'Przyciski' },
  fields: [
    { name: 'label', type: 'text', label: 'Tekst przycisku', required: true, maxLength: 60 },
    {
      name: 'href',
      type: 'text',
      label: 'Adres',
      required: true,
      validate: (value: unknown) =>
        (typeof value === 'string' && (SAFE_HREF.test(value) || HTTPS_URL.test(value))) ||
        'Podaj ścieżkę zaczynającą się od / albo adres https://',
    },
  ],
}

const calculator: Block = {
  slug: 'calculator',
  labels: { singular: 'Kalkulator', plural: 'Kalkulatory' },
  fields: [
    {
      name: 'calculator',
      type: 'relationship',
      relationTo: 'calculators',
      label: 'Kalkulator',
      required: true,
    },
  ],
}

const recommendedFirms: Block = {
  slug: 'recommendedFirms',
  labels: { singular: 'Polecane firmy', plural: 'Polecane firmy' },
  fields: [
    { name: 'service', type: 'relationship', relationTo: 'services', label: 'Usługa' },
    { name: 'locality', type: 'relationship', relationTo: 'localities', label: 'Miejscowość' },
    { name: 'limit', type: 'number', label: 'Liczba firm', defaultValue: 3, min: 1, max: 6 },
  ],
}

/** Bloki treści artykułów (SPEC 3.8). */
export const articleBlocks: Block[] = [
  text,
  heading,
  image,
  gallery,
  quote,
  faq,
  table,
  cta,
  calculator,
  recommendedFirms,
]

/** Bloki stron (regulamin, polityki, O nas, Kontakt). */
export const pageBlocks: Block[] = [text, heading, image, faq, table, cta]
