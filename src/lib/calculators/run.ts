import { formatPrice } from '@/lib/format/number'

import { bathroomCost, INPUT_LIMITS, inRange, paint, skimCoat, tiles } from './formulas'
import type { CalculatorParams, CalculatorType } from './params'

/** Kalkulator z kompletem parametrów (opublikowany). */
export type RunnableCalculator = {
  [T in CalculatorType]: { type: T; params: CalculatorParams<T> }
}[CalculatorType]

/** Wiersz wyniku: etykieta, wartość tekstowa, wyróżnienie najważniejszej liczby. */
export type ResultRow = { label: string; value: string; strong?: boolean }
export type CalculatorRun = { rows: ResultRow[]; text: string }
export type CalculatorInputs = Partial<Record<string, number | null>>

const range = (value: { min: number; max: number }) =>
  value.min === value.max
    ? formatPrice(value.min)
    : `${formatPrice(value.min)} – ${formatPrice(value.max)}`
const num = (value: number) => new Intl.NumberFormat('pl-PL').format(value)

/** Pola danych od użytkownika dla rodzaju kalkulatora (te same w formularzu i w akcji serwera). */
export const CALCULATOR_FIELDS: Record<
  CalculatorType,
  Array<{ name: string; label: string; unit: string; hint?: string; optional?: boolean }>
> = {
  bathroomCost: [
    {
      name: 'area',
      label: 'Powierzchnia podłogi',
      unit: 'm²',
      hint: 'Długość × szerokość łazienki, np. 4,5.',
    },
  ],
  tiles: [
    { name: 'area', label: 'Powierzchnia do wyłożenia', unit: 'm²' },
    { name: 'width', label: 'Szerokość płytki', unit: 'cm' },
    { name: 'height', label: 'Długość płytki', unit: 'cm' },
    {
      name: 'box',
      label: 'Płytek w opakowaniu',
      unit: 'm²',
      hint: 'Z etykiety – policzymy pełne opakowania.',
      optional: true,
    },
  ],
  paint: [
    { name: 'area', label: 'Powierzchnia ścian i sufitu', unit: 'm²', hint: 'Bez okien i drzwi.' },
  ],
  skimCoat: [
    { name: 'area', label: 'Powierzchnia', unit: 'm²' },
    { name: 'thickness', label: 'Grubość warstwy', unit: 'mm', hint: 'Zwykle 1–3 mm.' },
  ],
}

/**
 * Wynik kalkulatora dla danych liczbowych; `null` – dane niepełne albo poza zakresem.
 * Ten sam kod liczy w przeglądarce i w akcji serwera (zapis prośby o kontakt).
 */
export function runCalculator(
  calculator: RunnableCalculator,
  input: CalculatorInputs,
): CalculatorRun | null {
  const area = input.area ?? null
  switch (calculator.type) {
    case 'bathroomCost': {
      if (!inRange(area, INPUT_LIMITS.bathroomAreaM2)) return null
      const result = bathroomCost(calculator.params, { areaM2: area! })
      return {
        rows: [
          { label: 'Robocizna', value: range(result.labour) },
          { label: 'Materiały', value: range(result.materials) },
          { label: 'Razem', value: range(result.total), strong: true },
        ],
        text: `Remont łazienki ${num(area!)} m², szacunek z kalkulatora: ${range(result.total)}.`,
      }
    }
    case 'tiles': {
      const { width = null, height = null } = input
      const box = input.box ?? undefined
      if (
        !inRange(area, INPUT_LIMITS.areaM2) ||
        !inRange(width, INPUT_LIMITS.tileCm) ||
        !inRange(height, INPUT_LIMITS.tileCm) ||
        (box !== undefined && !inRange(box, INPUT_LIMITS.boxM2))
      )
        return null
      const result = tiles(calculator.params, {
        areaM2: area!,
        tileWidthCm: width!,
        tileHeightCm: height!,
        boxM2: box,
      })
      return {
        rows: [
          { label: 'Powierzchnia z zapasem', value: `${num(result.areaWithWaste)} m²` },
          { label: 'Płytki', value: `${num(result.pieces)} szt.`, strong: true },
          ...(result.boxes && result.m2ToBuy
            ? [{ label: 'Opakowania', value: `${result.boxes} (${num(result.m2ToBuy)} m²)` }]
            : []),
        ],
        text: `Płytki ${num(width!)}×${num(height!)} cm na ${num(area!)} m², z zapasem ${num(result.areaWithWaste)} m².`,
      }
    }
    case 'paint': {
      if (!inRange(area, INPUT_LIMITS.areaM2)) return null
      const result = paint(calculator.params, { areaM2: area! })
      return {
        rows: [
          { label: 'Farba', value: `${num(result.litres)} l`, strong: true },
          { label: 'Warstwy', value: String(result.coats) },
        ],
        text: `Malowanie ${num(area!)} m², około ${num(result.litres)} l farby.`,
      }
    }
    case 'skimCoat': {
      const thickness = input.thickness ?? null
      if (!inRange(area, INPUT_LIMITS.areaM2) || !inRange(thickness, INPUT_LIMITS.thicknessMm))
        return null
      const result = skimCoat(calculator.params, { areaM2: area!, thicknessMm: thickness! })
      return {
        rows: [
          { label: 'Gładź', value: `${num(result.kg)} kg, worki: ${result.bags}` },
          { label: 'Robocizna', value: range(result.labour), strong: true },
        ],
        text: `Gładź na ${num(area!)} m², warstwa ${num(thickness!)} mm, robocizna ${range(result.labour)}.`,
      }
    }
  }
}
