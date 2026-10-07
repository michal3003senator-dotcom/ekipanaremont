import { z } from 'zod'

/** Kwota w groszach (CLAUDE.md: kwoty jako integer). */
const grosze = z.int().min(0).max(100_000_000)
const percent = z.number().min(0).max(50)
const range = z
  .object({ min: grosze, max: grosze })
  .refine((value) => value.min <= value.max, 'min > max')

/**
 * Parametry kalkulatorów edytowane w CMS (SPEC 3.8), walidowane schematem typu.
 * Zestaw startowy – szczegóły dopracujemy przy budowie kalkulatorów.
 */
export const calculatorParams = {
  bathroomCost: z.object({ labourPerM2: range, materialsPerM2: range }),
  tiles: z.object({ wastePercent: percent }),
  paint: z.object({
    coverageM2PerLitre: z.number().positive().max(30),
    coats: z.int().min(1).max(4),
    wastePercent: percent,
  }),
  skimCoat: z.object({ kgPerM2PerMm: z.number().positive().max(5), labourPerM2: range }),
} as const

export type CalculatorType = keyof typeof calculatorParams

export const CALCULATOR_TYPES = Object.keys(calculatorParams) as CalculatorType[]

export function checkCalculatorParams(type: unknown, params: unknown): true | string {
  if (typeof type !== 'string' || !(type in calculatorParams)) return 'Wybierz rodzaj kalkulatora.'
  const result = calculatorParams[type as CalculatorType].safeParse(params)
  return (
    result.success ||
    `Nieprawidłowe parametry: ${result.error.issues.map((issue) => issue.path.join('.') || issue.message).join(', ')}`
  )
}
