import { describe, expect, it } from 'vitest'

import type { CalendarDate } from '../../lib/format/date'
import { availabilityState } from '../../lib/panel/availability'
import { profileGaps } from '../../lib/panel/profile'

const TODAY = '2026-10-07' as CalendarDate

describe('stan terminu (SPEC 3.5)', () => {
  it('aktywny do expiryDays od potwierdzenia, potem wygasa', () => {
    const fresh = availabilityState(
      { date: '2026-10-14', confirmedAt: '2026-10-01T10:00:00Z' },
      TODAY,
      14,
    )
    expect(fresh).toMatchObject({
      expired: false,
      expiresOn: '2026-10-15',
      availability: { status: 'soon' },
    })
    const stale = availabilityState(
      { date: '2026-10-20', confirmedAt: '2026-09-20T10:00:00Z' },
      TODAY,
      14,
    )
    expect(stale).toMatchObject({
      expired: true,
      availability: { status: 'none' },
      date: '2026-10-20',
    })
  })

  it('data w przeszłości wygasa, brak daty to brak terminu (nie „wygasły”)', () => {
    expect(
      availabilityState({ date: '2026-10-06', confirmedAt: '2026-10-06T08:00:00Z' }, TODAY, 14)
        .expired,
    ).toBe(true)
    expect(availabilityState({ date: null }, TODAY, 14)).toMatchObject({
      expired: false,
      availability: { status: 'none' },
    })
  })
})

describe('braki profilu', () => {
  it('lista braków w kolejności kreatora, pusta dla kompletnego profilu', () => {
    const gaps = profileGaps(
      {
        services: [],
        serviceArea: [],
        baseLocality: null,
        shortDescription: null,
        registryVerifiedAt: null,
      },
      1,
    )
    expect(gaps.map((gap) => gap.key)).toEqual(['services', 'area', 'about', 'photos'])
    expect(gaps.at(-1)?.label).toBe('Dodaj jeszcze 2 zdjęcia realizacji')
    expect(
      profileGaps(
        {
          services: ['s'],
          serviceArea: ['l'],
          baseLocality: 'l',
          shortDescription: 'Opis',
          registryVerifiedAt: null,
        },
        3,
      ),
    ).toEqual([])
  })
})
