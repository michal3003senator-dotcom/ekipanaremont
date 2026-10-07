import type { CalculatorParams, CalculatorType } from '@/lib/calculators/params'

/** Opublikowany kalkulator z kompletem parametrów – to trafia do przeglądarki. */
export type PublicCalculator = {
  [T in CalculatorType]: {
    id: string
    type: T
    title: string
    intro: string | null
    disclaimer: string | null
    params: CalculatorParams<T>
    serviceSlug: string | null
  }
}[CalculatorType]
