import type { FirmSummary, Project } from '@/components/features/firm/types'
import type { CalendarDate } from '@/lib/format/date'

import glazura from './_photos/glazura.jpg'
import kuchnia from './_photos/kuchnia.jpg'
import lazienkaBiala from './_photos/lazienka-biala.jpg'
import lazienkaDrewno from './_photos/lazienka-drewno.jpg'
import lazienkaSzara from './_photos/lazienka-szara.jpg'
import pokoj from './_photos/pokoj.jpg'

/** Stała data: zrzuty są powtarzalne (środa, 7 października 2026). */
export const DEMO_TODAY: CalendarDate = '2026-10-07'

// Firmy zmyślone, miejscowości prawdziwe, zdjęcia poglądowe (ZRODLA.md). Kolejność jak w wynikach.
export const FIRMS: FirmSummary[] = [
  {
    slug: 'malowanie-balucka',
    name: 'Malowanie Bałucka',
    services: 'Malowanie, gładzie, sufity',
    locality: 'Łódź-Bałuty',
    areaExtra: 4,
    rating: 4.7,
    reviews: 12,
    registry: 'CEIDG',
    availableFrom: '2026-10-07',
    confirmedOn: '2026-10-07',
    photo: {
      src: pokoj,
      alt: 'Pokój po gładziach i malowaniu, z jasną podłogą z desek',
      demo: true,
    },
  },
  {
    slug: 'pracownia-glazury-kowal',
    name: 'Pracownia Glazury Kowal',
    services: 'Łazienki, glazura, gładzie',
    locality: 'Łódź-Widzew',
    areaExtra: 9,
    rating: 4.9,
    reviews: 37,
    registry: 'CEIDG',
    availableFrom: '2026-10-14',
    confirmedOn: '2026-10-06',
    photo: {
      src: lazienkaSzara,
      alt: 'Łazienka z szarymi płytkami wielkoformatowymi, wanną wolnostojącą i czarną armaturą',
      demo: true,
    },
  },
  {
    slug: 'glazurnictwo-nowak',
    name: 'Glazurnictwo Nowak',
    services: 'Płytki, mozaiki, kuchnie',
    locality: 'Konstantynów Łódzki',
    areaExtra: 7,
    rating: 4.8,
    reviews: 23,
    registry: 'CEIDG',
    availableFrom: '2026-10-20',
    confirmedOn: '2026-10-05',
    photo: {
      src: glazura,
      alt: 'Biała glazura w układzie cegiełki nad zlewem z chromowaną baterią',
      demo: true,
    },
  },
  {
    slug: 'lazienki-kosowski',
    name: 'Łazienki Kosowski',
    services: 'Remonty łazienek pod klucz',
    locality: 'Pabianice',
    areaExtra: 6,
    rating: 5,
    reviews: 8,
    registry: 'CEIDG',
    availableFrom: '2026-11-03',
    confirmedOn: '2026-10-04',
    photo: {
      src: lazienkaBiala,
      alt: 'Łazienka z kabiną bez brodzika, białymi płytkami i szafką pod umywalką',
      demo: true,
    },
  },
  {
    slug: 'domowe-remonty',
    name: 'Domowe Remonty sp. z o.o.',
    services: 'Kuchnie i remonty mieszkań',
    locality: 'Zgierz',
    areaExtra: 12,
    rating: null,
    reviews: 0,
    registry: 'KRS',
    availableFrom: null,
    photo: {
      src: kuchnia,
      alt: 'Biała kuchnia z szarym blatem, płytą indukcyjną i otwartymi półkami',
      demo: true,
    },
  },
]

export const PROJECTS: Project[] = [
  {
    id: 'lazienka-widzew',
    title: 'Łazienka 6 m²',
    locality: 'Łódź-Widzew',
    month: '2026-09',
    photo: {
      src: lazienkaSzara,
      alt: 'Łazienka z szarymi płytkami i wanną wolnostojącą',
      demo: true,
    },
  },
  {
    id: 'lazienka-polesie',
    title: 'Łazienka 8 m²',
    locality: 'Łódź-Polesie',
    month: '2026-07',
    photo: {
      src: lazienkaDrewno,
      alt: 'Łazienka z drewnianymi lamelami na ścianie i wanną',
      demo: true,
    },
  },
  {
    id: 'lazienka-pabianice',
    title: 'Łazienka 5 m²',
    locality: 'Pabianice',
    month: '2026-09',
    photo: {
      src: lazienkaBiala,
      alt: 'Łazienka z kabiną bez brodzika i białymi płytkami',
      demo: true,
    },
  },
  {
    id: 'glazura-konstantynow',
    title: 'Ściana nad blatem',
    locality: 'Konstantynów Łódzki',
    month: '2026-08',
    photo: { src: glazura, alt: 'Biała glazura w układzie cegiełki nad zlewem', demo: true },
  },
  {
    id: 'gladzie-baluty',
    title: 'Gładzie i malowanie, 54 m²',
    locality: 'Łódź-Bałuty',
    month: '2026-09',
    photo: { src: pokoj, alt: 'Pokój po gładziach i malowaniu, z jasną podłogą', demo: true },
  },
  {
    id: 'kuchnia-zgierz',
    title: 'Kuchnia 9 m²',
    locality: 'Zgierz',
    month: '2026-06',
    photo: { src: kuchnia, alt: 'Biała kuchnia z szarym blatem i płytą indukcyjną', demo: true },
  },
]

export const LOCALITIES = [
  { value: 'lodz', label: 'Łódź', description: 'miasto na prawach powiatu' },
  { value: 'zgierz', label: 'Zgierz', description: 'pow. zgierski' },
  { value: 'pabianice', label: 'Pabianice', description: 'pow. pabianicki' },
  { value: 'konstantynow', label: 'Konstantynów Łódzki', description: 'pow. pabianicki' },
  { value: 'aleksandrow', label: 'Aleksandrów Łódzki', description: 'pow. zgierski' },
  { value: 'strykow', label: 'Stryków', description: 'pow. zgierski' },
  { value: 'glowno', label: 'Głowno', description: 'pow. zgierski' },
  { value: 'ozorkow', label: 'Ozorków', description: 'pow. zgierski' },
]

export const GROUPS = [
  {
    slug: 'formularze',
    title: 'Formularze',
    description: 'Przyciski, pola, wybór z listy, daty, oceny.',
  },
  { slug: 'nakladki', title: 'Nakładki', description: 'Okno, dolny panel, powiadomienie.' },
  {
    slug: 'termin',
    title: 'Termin i firmy',
    description: 'Kafel terminu, karta firmy, grafik, oceny, znaczniki.',
  },
  {
    slug: 'galeria',
    title: 'Galeria',
    description: 'Realizacje z powiększeniem i przesuwaniem palcem.',
  },
  {
    slug: 'uklady',
    title: 'Układy',
    description: 'Nagłówek, stopka, nawigacja panelu, zakładki, strony.',
  },
  { slug: 'stany', title: 'Stany', description: 'Puste, błąd, ładowanie.' },
] as const
