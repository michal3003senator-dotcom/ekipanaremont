import type { CalculatorParams } from './params'

/**
 * Wzory kalkulatorów (SPEC 3.8). Czyste funkcje: parametry z CMS (kwoty w groszach) i dane od
 * użytkownika → wynik. Zaokrąglenia na korzyść klienta: ilości w górę, widełki kwot do 100 zł.
 */

/** Tolerancja błędów zmiennoprzecinkowych przy zaokrąglaniu w górę (6 m² × 1,1 = 6,6000000001). */
const EPSILON = 1e-9
const ceil = (value: number) => Math.ceil(value - EPSILON)
const HUNDRED_ZL = 10_000

export type Range = { min: number; max: number }

/** Widełki w groszach zaokrąglone do pełnych 100 zł: dół w dół, góra w górę. */
export function roundRange(range: Range): Range {
  return {
    min: Math.floor(range.min / HUNDRED_ZL) * HUNDRED_ZL,
    max: ceil(range.max / HUNDRED_ZL) * HUNDRED_ZL,
  }
}

const multiply = (area: number, perM2: Range): Range => ({
  min: Math.round(area * perM2.min),
  max: Math.round(area * perM2.max),
})

const sum = (a: Range, b: Range): Range => ({ min: a.min + b.min, max: a.max + b.max })

/** Remont łazienki: robocizna i materiały za m² podłogi → widełki kosztu. */
export function bathroomCost(params: CalculatorParams<'bathroomCost'>, input: { areaM2: number }) {
  const labour = roundRange(multiply(input.areaM2, params.labourPerM2))
  const materials = roundRange(multiply(input.areaM2, params.materialsPerM2))
  return { labour, materials, total: sum(labour, materials) }
}

/** Płytki: powierzchnia z zapasem → sztuki i (gdy podano) pełne opakowania. */
export function tiles(
  params: CalculatorParams<'tiles'>,
  input: { areaM2: number; tileWidthCm: number; tileHeightCm: number; boxM2?: number | null },
) {
  const areaWithWaste = input.areaM2 * (1 + params.wastePercent / 100)
  const tileM2 = (input.tileWidthCm * input.tileHeightCm) / 10_000
  const pieces = ceil(areaWithWaste / tileM2)
  const boxes = input.boxM2 ? ceil(areaWithWaste / input.boxM2) : null
  return {
    areaWithWaste: Math.round(areaWithWaste * 100) / 100,
    pieces,
    boxes,
    m2ToBuy: boxes && input.boxM2 ? Math.round(boxes * input.boxM2 * 100) / 100 : null,
  }
}

/** Farba: litry na wszystkie warstwy z zapasem, w górę do pół litra. */
export function paint(params: CalculatorParams<'paint'>, input: { areaM2: number }) {
  const litres =
    ((input.areaM2 * params.coats) / params.coverageM2PerLitre) * (1 + params.wastePercent / 100)
  return { litres: ceil(litres * 2) / 2, coats: params.coats }
}

/** Gładź: kilogramy dla grubości warstwy, pełne worki i widełki robocizny. */
export function skimCoat(
  params: CalculatorParams<'skimCoat'>,
  input: { areaM2: number; thicknessMm: number },
) {
  const kg = input.areaM2 * input.thicknessMm * params.kgPerM2PerMm
  return {
    kg: ceil(kg * 10) / 10,
    bags: ceil(kg / params.bagKg),
    labour: roundRange(multiply(input.areaM2, params.labourPerM2)),
  }
}

/** Liczba z pola formularza: „6,5” albo „6.5”; puste lub błędne → null. */
export function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null
  return Number(normalized)
}

/** Zakresy danych od użytkownika – takie same w przeglądarce i w akcji serwera. */
export const INPUT_LIMITS = {
  areaM2: { min: 0.5, max: 500 },
  bathroomAreaM2: { min: 1, max: 40 },
  tileCm: { min: 1, max: 300 },
  boxM2: { min: 0.1, max: 10 },
  thicknessMm: { min: 0.5, max: 10 },
} as const

export const inRange = (value: number | null, { min, max }: { min: number; max: number }) =>
  value !== null && value >= min && value <= max
