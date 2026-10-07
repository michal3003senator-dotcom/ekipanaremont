import type { ImageProps } from 'next/image'

import type { CalendarDate, CalendarMonth } from '@/lib/format/date'

export type FirmPhotoData = {
  src: ImageProps['src']
  alt: string
  /** Zdjęcie poglądowe (styleguide): obowiązkowy podpis, nigdy jako realizacja firmy (DESIGN §7). */
  demo?: boolean
}

/** Dane firmy potrzebne na liście wyników, w grafiku i w nagłówku profilu. */
export type FirmSummary = {
  slug: string
  name: string
  services: string
  locality: string
  /** Liczba dodatkowych miejscowości w obszarze działania. */
  areaExtra: number
  rating: number | null
  reviews: number
  /** Rejestr, w którym sprawdziliśmy NIP; `null` – weryfikacja ręczna przez moderatora. */
  registry: 'CEIDG' | 'KRS' | 'VAT' | null
  availableFrom: CalendarDate | null
  confirmedOn?: CalendarDate
  /** Okładka: pierwsze zdjęcie pierwszej realizacji; brak – neutralne pole z inicjałami. */
  photo?: FirmPhotoData
}

export type Project = {
  id: string
  title: string
  locality: string
  month: CalendarMonth
  photo: FirmPhotoData
}

/** Zdjęcie w galerii z podpisem (realizacje firmy, galerie w artykułach). */
export type GalleryItem = { id: string; photo: FirmPhotoData; caption: string }
