import { z } from 'zod'

/** Kwota w groszach (CLAUDE.md: kwoty jako integer). */
const grosze = z.int().min(0).max(100_000_000)
const percent = z.number().min(0).max(50)
const range = z
  .object({ min: grosze, max: grosze })
  .refine((value) => value.min <= value.max, 'Kwota „od” nie może być większa niż „do”.')

/**
 * Parametry kalkulatorów (SPEC 3.8) – wartości wpisuje redakcja w panelu, w kodzie nie ma domyślnych.
 * Schemat sprawdza komplet przy publikacji; szkic może być niepełny.
 */
export const calculatorParams = {
  bathroomCost: z.object({ labourPerM2: range, materialsPerM2: range }),
  tiles: z.object({ wastePercent: percent }),
  paint: z.object({
    coverageM2PerLitre: z.number().positive().max(30),
    coats: z.int().min(1).max(4),
    wastePercent: percent,
  }),
  skimCoat: z.object({
    kgPerM2PerMm: z.number().positive().max(5),
    bagKg: z.number().positive().max(50),
    labourPerM2: range,
  }),
} as const

export type CalculatorType = keyof typeof calculatorParams
export type CalculatorParams<T extends CalculatorType> = z.infer<(typeof calculatorParams)[T]>

export const CALCULATOR_TYPES = Object.keys(calculatorParams) as CalculatorType[]

export const isCalculatorType = (value: unknown): value is CalculatorType =>
  typeof value === 'string' && value in calculatorParams

/** Nazwy parametrów w komunikacie dla redakcji. */
const PARAM_LABELS: Record<string, string> = {
  labourPerM2: 'robocizna za m²',
  materialsPerM2: 'materiały za m²',
  wastePercent: 'zapas',
  coverageM2PerLitre: 'wydajność',
  coats: 'liczba warstw',
  kgPerM2PerMm: 'zużycie',
  bagKg: 'waga worka',
  min: 'od',
  max: 'do',
}

/** Walidacja przy publikacji: `true` albo komunikat, czego brakuje. */
export function checkCalculatorParams(type: unknown, params: unknown): true | string {
  if (!isCalculatorType(type)) return 'Wybierz rodzaj kalkulatora.'
  const result = calculatorParams[type].safeParse(params)
  if (result.success) return true
  const fields = result.error.issues.map((issue) =>
    issue.path.map((part) => PARAM_LABELS[String(part)] ?? String(part)).join(' '),
  )
  return `Uzupełnij parametry przed publikacją: ${[...new Set(fields)].join(', ')}.`
}

/** Parametry opublikowanego kalkulatora albo `null`, gdy niepełne – wtedy kalkulatora nie pokazujemy. */
export function readCalculatorParams<T extends CalculatorType>(
  type: T,
  doc: Partial<Record<CalculatorType, unknown>>,
): CalculatorParams<T> | null {
  const result = calculatorParams[type].safeParse(doc[type])
  return result.success ? (result.data as CalculatorParams<T>) : null
}
