// `useGrouping: 'always'`: pl-PL domyślnie nie grupuje liczb czterocyfrowych („1250 zł”).
const pln = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  useGrouping: 'always',
  maximumFractionDigits: 0,
})
const plnWithGrosze = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  useGrouping: 'always',
  minimumFractionDigits: 2,
})
const rating = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const plural = new Intl.PluralRules('pl-PL')

/** Kwota w groszach: „1 250 zł”, z groszami tylko wtedy, gdy są („1 250,50 zł”). */
export function formatPrice(grosze: number): string {
  if (!Number.isSafeInteger(grosze)) throw new RangeError('Kwota musi być całkowitą liczbą groszy')
  return (grosze % 100 === 0 ? pln : plnWithGrosze).format(grosze / 100)
}

/** Ocena z jedną cyfrą po przecinku: „4,9”. */
export const formatRating = (value: number) => rating.format(value)

type PluralForms = { one: string; few: string; many: string }

/** Rzeczownik w formie pasującej do liczby: „opinia”, „opinie”, „opinii”. */
export function pluralNoun(count: number, forms: PluralForms): string {
  const category = plural.select(count)
  return category === 'one' ? forms.one : category === 'few' ? forms.few : forms.many
}

/** Liczba z rzeczownikiem: „1 opinia”, „2 opinie”, „5 opinii”. */
export function formatCount(count: number, forms: PluralForms): string {
  return `${count} ${pluralNoun(count, forms)}`
}

const integer = new Intl.NumberFormat('pl-PL', { useGrouping: 'always', maximumFractionDigits: 0 })

/** Liczba całkowita z odstępami tysięcy: „1 250”. */
export const formatNumber = (value: number) => integer.format(value)

/** Numer telefonu w polskim zapisie: „600 100 200”, z kierunkowym „+48 600 100 200”. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  const local = digits.slice(-9).replace(/(\d{3})(?=\d)/g, '$1 ')
  return digits.length > 9 ? `+${digits.slice(0, -9)} ${local}` : local
}

/** „1 250,50” albo „1250.5” → 125050 groszy; puste → null; nieliczbowe → NaN (walidacja pola). */
export function parseZlotyToGrosze(text: string): number | null {
  const normalized = text.replace(/[\s zł]/g, '').replace(',', '.')
  if (normalized === '') return null
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN
  return Math.round(Number(normalized) * 100)
}

/** 125050 → „1250,50”, 125000 → „1250” – wartość pola w panelu (bez spacji tysięcy). */
export const groszeToZlotyInput = (grosze: number) =>
  grosze % 100 === 0 ? String(grosze / 100) : (grosze / 100).toFixed(2).replace('.', ',')
