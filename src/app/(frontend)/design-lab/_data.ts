import type { StaticImageData } from 'next/image'

import type { CalendarDate, CalendarMonth } from '@/lib/format/date'

import glazura from './_photos/glazura.jpg'
import kuchnia from './_photos/kuchnia.jpg'
import lazienkaBiala from './_photos/lazienka-biala.jpg'
import lazienkaDrewno from './_photos/lazienka-drewno.jpg'
import lazienkaSzara from './_photos/lazienka-szara.jpg'
import pokoj from './_photos/pokoj.jpg'

/** Stała data: zrzuty mają być powtarzalne (środa, 7 października 2026). */
export const DEMO_TODAY: CalendarDate = '2026-10-07'

export const VARIANTS = {
  a: { name: 'Realizacja', fonts: 'Schibsted Grotesk · Onest · Geist Mono' },
  b: { name: 'Grafik', fonts: 'Instrument Sans 75 i 100 · JetBrains Mono' },
  c: { name: 'Zdanie', fonts: 'Mona Sans 125 (telefon 90) · Onest · Martian Mono' },
} as const

export type VariantKey = keyof typeof VARIANTS

export const isVariantKey = (value: string): value is VariantKey => value in VARIANTS

export const SERVICES = [
  { key: 'lazienka', label: 'remont łazienki' },
  { key: 'plytki', label: 'układanie płytek' },
  { key: 'malowanie', label: 'malowanie i gładzie' },
  { key: 'kuchnia', label: 'remont kuchni' },
] as const

export const LOCALITIES = [
  { key: 'zgierz', label: 'Zgierz' },
  { key: 'lodz', label: 'Łódź' },
  { key: 'pabianice', label: 'Pabianice' },
  { key: 'konstantynow', label: 'Konstantynów Łódzki' },
] as const

export type ServiceKey = (typeof SERVICES)[number]['key']
export type LocalityKey = (typeof LOCALITIES)[number]['key']

export type DemoFirm = {
  slug: string
  name: string
  services: string
  locality: string
  /** Liczba dodatkowych miejscowości w obszarze działania. */
  areaExtra: number
  rating: number
  reviews: number
  registry: 'CEIDG' | 'KRS'
  availableFrom: CalendarDate | null
  confirmedOn?: CalendarDate
  offers: ServiceKey[]
  serves: LocalityKey[]
  photo: StaticImageData
  photoAlt: string
  project: { title: string; month: CalendarMonth }
}

// Firmy są zmyślone, miejscowości prawdziwe.
const balucka: DemoFirm = {
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
  offers: ['malowanie'],
  serves: ['lodz', 'zgierz', 'konstantynow'],
  photo: pokoj,
  photoAlt: 'Pokój po gładziach i malowaniu, z jasną podłogą z desek',
  project: { title: 'Gładzie i malowanie, 54 m²', month: '2026-09' },
}

const kowal: DemoFirm = {
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
  offers: ['lazienka', 'plytki', 'malowanie'],
  serves: ['lodz', 'zgierz', 'pabianice', 'konstantynow'],
  photo: lazienkaSzara,
  photoAlt: 'Łazienka z szarymi płytkami wielkoformatowymi, wanną wolnostojącą i czarną armaturą',
  project: { title: 'Łazienka 6 m²', month: '2026-09' },
}

const nowak: DemoFirm = {
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
  offers: ['plytki', 'kuchnia', 'lazienka'],
  serves: ['konstantynow', 'lodz', 'pabianice', 'zgierz'],
  photo: glazura,
  photoAlt: 'Biała glazura w układzie cegiełki nad zlewem z chromowaną baterią',
  project: { title: 'Ściana nad blatem', month: '2026-08' },
}

const lis: DemoFirm = {
  slug: 'studio-lazienek-lis',
  name: 'Studio Łazienek Lis',
  services: 'Łazienki pod klucz',
  locality: 'Łódź-Polesie',
  areaExtra: 5,
  rating: 4.8,
  reviews: 19,
  registry: 'CEIDG',
  availableFrom: '2026-10-26',
  confirmedOn: '2026-10-02',
  offers: ['lazienka', 'plytki'],
  serves: ['lodz', 'konstantynow', 'zgierz'],
  photo: lazienkaDrewno,
  photoAlt: 'Łazienka z szarymi płytkami, drewnianymi lamelami na ścianie i wanną',
  project: { title: 'Łazienka 8 m²', month: '2026-07' },
}

const kosowski: DemoFirm = {
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
  offers: ['lazienka'],
  serves: ['pabianice', 'lodz', 'konstantynow'],
  photo: lazienkaBiala,
  photoAlt: 'Łazienka z kabiną bez brodzika, białymi płytkami i szafką pod umywalką',
  project: { title: 'Łazienka 5 m²', month: '2026-09' },
}

const domoweRemonty: DemoFirm = {
  slug: 'domowe-remonty',
  name: 'Domowe Remonty sp. z o.o.',
  services: 'Kuchnie i remonty mieszkań',
  locality: 'Zgierz',
  areaExtra: 12,
  rating: 4.6,
  reviews: 21,
  registry: 'KRS',
  availableFrom: null,
  offers: ['kuchnia', 'malowanie', 'lazienka'],
  serves: ['zgierz', 'lodz'],
  photo: kuchnia,
  photoAlt: 'Biała kuchnia z szarym blatem, płytą indukcyjną i otwartymi półkami',
  project: { title: 'Kuchnia 9 m²', month: '2026-06' },
}

/** Kolejność jak w wynikach: najbliższy termin, potem ocena; firmy bez terminu na końcu (SPEC 3.1). */
export const FIRMS: DemoFirm[] = [balucka, kowal, nowak, lis, kosowski, domoweRemonty]

/** Firma z przykładowej realizacji w hero. */
export const HERO_FIRM = kowal
