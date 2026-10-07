import { describe, expect, it } from 'vitest'

import {
  bathroomCost,
  inRange,
  INPUT_LIMITS,
  paint,
  parseDecimal,
  roundRange,
  skimCoat,
  tiles,
} from '../../lib/calculators/formulas'

// Parametry tylko do testów wzorów – prawdziwe wartości wpisuje redakcja w panelu.
const zl = (value: number) => value * 100

describe('kalkulatory – wzory', () => {
  it('widełki kwot do pełnych 100 zł: dół w dół, góra w górę', () => {
    expect(roundRange({ min: zl(1_249), max: zl(1_201) })).toEqual({
      min: zl(1_200),
      max: zl(1_300),
    })
    expect(roundRange({ min: zl(1_200), max: zl(1_200) })).toEqual({
      min: zl(1_200),
      max: zl(1_200),
    })
  })

  it('łazienka: robocizna + materiały za m² podłogi', () => {
    const result = bathroomCost(
      {
        labourPerM2: { min: zl(1_000), max: zl(1_500) },
        materialsPerM2: { min: zl(500), max: zl(2_000) },
      },
      { areaM2: 4.5 },
    )
    expect(result.labour).toEqual({ min: zl(4_500), max: zl(6_800) })
    expect(result.materials).toEqual({ min: zl(2_200), max: zl(9_000) })
    expect(result.total).toEqual({ min: zl(6_700), max: zl(15_800) })
  })

  it('płytki: zapas doliczony do powierzchni, sztuki i opakowania w górę', () => {
    const result = tiles(
      { wastePercent: 10 },
      { areaM2: 6, tileWidthCm: 30, tileHeightCm: 60, boxM2: 1.44 },
    )
    expect(result.areaWithWaste).toBe(6.6)
    // 6,6 m² / 0,18 m² = 36,67 → 37 płytek; 6,6 / 1,44 = 4,58 → 5 opakowań = 7,2 m²
    expect(result.pieces).toBe(37)
    expect(result.boxes).toBe(5)
    expect(result.m2ToBuy).toBe(7.2)
  })

  it('płytki: dokładne dzielenie nie dolicza sztuki przez błąd zmiennoprzecinkowy', () => {
    const result = tiles({ wastePercent: 10 }, { areaM2: 6, tileWidthCm: 60, tileHeightCm: 110 })
    expect(result.pieces).toBe(10) // 6,6 / 0,66 = 10 (bez 11 z 10,000000001)
    expect(result.boxes).toBeNull()
  })

  it('farba: warstwy, wydajność i zapas, w górę do pół litra', () => {
    expect(paint({ coverageM2PerLitre: 10, coats: 2, wastePercent: 10 }, { areaM2: 40 })).toEqual({
      litres: 9,
      coats: 2,
    })
    expect(
      paint({ coverageM2PerLitre: 12, coats: 2, wastePercent: 0 }, { areaM2: 25 }).litres,
    ).toBe(4.5)
  })

  it('gładź: kilogramy, pełne worki i robocizna', () => {
    const result = skimCoat(
      { kgPerM2PerMm: 1, bagKg: 20, labourPerM2: { min: zl(20), max: zl(35) } },
      { areaM2: 50, thicknessMm: 2 },
    )
    expect(result).toEqual({ kg: 100, bags: 5, labour: { min: zl(1_000), max: zl(1_800) } })
  })

  it('liczby z pola: przecinek, kropka, spacje; błędne → null; zakresy', () => {
    expect(parseDecimal('6,5')).toBe(6.5)
    expect(parseDecimal(' 1 200 ')).toBe(1200)
    expect(parseDecimal('abc')).toBeNull()
    expect(parseDecimal('-3')).toBeNull()
    expect(inRange(parseDecimal('0,2'), INPUT_LIMITS.areaM2)).toBe(false)
    expect(inRange(6, INPUT_LIMITS.bathroomAreaM2)).toBe(true)
  })
})
