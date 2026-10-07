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
