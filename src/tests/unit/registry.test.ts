import { describe, expect, it, vi } from 'vitest'

import { lookupNip } from '../../lib/registry'

const NIP = '5260250274'
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

const whitelist = (subject: unknown) => json({ result: { subject, requestId: 'x' } })
const vatSubject = {
  name: 'GLAZURA SP. Z O.O.',
  nip: NIP,
  statusVat: 'Czynny',
  regon: '123',
  krs: '0000123456',
  workingAddress: 'PIOTRKOWSKA 1, 90-001 ŁÓDŹ',
}
const krsOdpis = {
  odpis: {
    dane: {
      dzial1: {
        danePodmiotu: {
          nazwa: 'GLAZURA SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
          identyfikatory: { nip: NIP, regon: '123' },
        },
        siedzibaIAdres: {
          adres: {
            ulica: 'UL. PIOTRKOWSKA',
            nrDomu: '1',
            miejscowosc: 'ŁÓDŹ',
            kodPocztowy: '90-001',
          },
        },
      },
    },
  },
}

function router(routes: Record<string, () => Response>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    const match = Object.keys(routes).find((prefix) => url.startsWith(prefix))
    if (!match) throw new Error(`Nieoczekiwane zapytanie: ${url}`)
    return routes[match]!()
  }) as unknown as typeof fetch
}

describe('lookupNip', () => {
  it('odrzuca NIP z błędną sumą kontrolną bez pytania rejestrów', async () => {
    const fetchMock = router({})
    expect(await lookupNip('5260250275', { fetch: fetchMock })).toEqual({ status: 'not_found' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('spółka: Biała lista daje numer KRS, nazwa i adres z KRS', async () => {
    const result = await lookupNip('526-025-02-74', {
      ceidgToken: '',
      fetch: router({
        'https://wl-api.mf.gov.pl/': () => whitelist(vatSubject),
        'https://api-krs.ms.gov.pl/': () => json(krsOdpis),
      }),
    })
    expect(result).toMatchObject({
      status: 'found',
      record: {
        source: 'krs',
        name: 'GLAZURA SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
        address: 'UL. PIOTRKOWSKA 1, 90-001 ŁÓDŹ',
        krs: '0000123456',
      },
    })
  })

  it('jednoosobowa działalność zwolniona z VAT: znaleziona w CEIDG', async () => {
    const result = await lookupNip(NIP, {
      ceidgToken: 'token',
      fetch: router({
        'https://dane.biznes.gov.pl/': () =>
          json({
            firmy: [
              {
                nazwa: 'Jan Kowalski Usługi Remontowe',
                status: 'AKTYWNY',
                adresDzialalnosci: {
                  ulica: 'Zgierska',
                  budynek: '5',
                  miasto: 'Łódź',
                  kod: '91-001',
                },
              },
            ],
          }),
      }),
    })
    expect(result).toMatchObject({
      status: 'found',
      record: { source: 'ceidg', active: true, address: 'Zgierska 5, 91-001 Łódź' },
    })
  })

  it('brak w rejestrach to not_found, awaria rejestru to unavailable', async () => {
    expect(
      await lookupNip(NIP, {
        ceidgToken: '',
        fetch: router({ 'https://wl-api.mf.gov.pl/': () => whitelist(null) }),
      }),
    ).toEqual({ status: 'not_found' })
    expect(
      await lookupNip(NIP, {
        ceidgToken: '',
        fetch: router({ 'https://wl-api.mf.gov.pl/': () => json({}, 503) }),
      }),
    ).toEqual({ status: 'unavailable' })
  })

  it('awaria KRS zostawia dane z Białej listy', async () => {
    const result = await lookupNip(NIP, {
      ceidgToken: '',
      fetch: router({
        'https://wl-api.mf.gov.pl/': () => whitelist(vatSubject),
        'https://api-krs.ms.gov.pl/': () => json({}, 500),
      }),
    })
    expect(result).toMatchObject({
      status: 'found',
      record: { source: 'vat', name: 'GLAZURA SP. Z O.O.' },
    })
  })
})
