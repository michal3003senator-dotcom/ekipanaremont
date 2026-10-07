/** Przedziały budżetu w formularzu zapytania (SPEC 3.6) – te same w kolekcji i w panelu. */
export const BUDGET_RANGES = {
  to10k: 'do 10 000 zł',
  from10to30k: '10 000–30 000 zł',
  from30to60k: '30 000–60 000 zł',
  from60to100k: '60 000–100 000 zł',
  over100k: 'powyżej 100 000 zł',
  unknown: 'Nie wiem',
} as const

/** Planowany termin prac; w bazie zapisujemy etykietę (pole tekstowe `timeframe`). */
export const TIMEFRAMES = {
  asap: 'Jak najszybciej',
  month: 'W ciągu miesiąca',
  quarter: 'W ciągu 3 miesięcy',
  flexible: 'Termin elastyczny',
} as const

export type BudgetRange = keyof typeof BUDGET_RANGES
export type Timeframe = keyof typeof TIMEFRAMES

/** Zdjęcia do zapytania: liczba i rozmiar jednego pliku po zmniejszeniu w przeglądarce. */
export const INQUIRY_MAX_PHOTOS = 5
export const INQUIRY_PHOTO_MAX_BYTES = 900 * 1024
