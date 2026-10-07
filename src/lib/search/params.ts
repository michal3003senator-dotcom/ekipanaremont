import { z } from 'zod'

/** Parametry wyszukiwania w adresie (SPEC 3.1: filtry i strona wyników w URL). */
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/)
const flag = z.enum(['1']).optional()

export const searchParamsSchema = z.object({
  usluga: slug.optional().catch(undefined),
  gdzie: slug.optional().catch(undefined),
  termin: z.enum(['7', '14', '30']).optional().catch(undefined),
  zakres: z.array(slug).max(15).optional().catch(undefined),
  promien: z.enum(['10', '25', '50']).optional().catch(undefined),
  vat: flag.catch(undefined),
  ocena: flag.catch(undefined),
  gwarancja: flag.catch(undefined),
  strona: z.coerce.number().int().min(1).max(500).optional().catch(undefined),
})

export type SearchParams = z.infer<typeof searchParamsSchema>

type RawParams = Record<string, string | string[] | undefined>

/** Parametry z adresu: nieprawidłowe wartości są pomijane, a nie powodują błędu. */
export function parseSearchParams(raw: RawParams): SearchParams {
  const zakres = raw.zakres === undefined ? undefined : ([] as string[]).concat(raw.zakres)
  const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
  return searchParamsSchema.parse({
    usluga: single(raw.usluga),
    gdzie: single(raw.gdzie),
    termin: single(raw.termin),
    zakres,
    promien: single(raw.promien),
    vat: single(raw.vat),
    ocena: single(raw.ocena),
    gwarancja: single(raw.gwarancja),
    strona: single(raw.strona),
  })
}

/** Adres wyników dla parametrów; `patch` nadpisuje wybrane, a zmiana filtrów wraca na 1. stronę. */
export function searchHref(params: SearchParams, patch: Partial<SearchParams> = {}): string {
  const next = { ...params, ...patch }
  if (!('strona' in patch)) delete next.strona
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
    else if (!(key === 'strona' && value === 1)) query.set(key, String(value))
  }
  const text = query.toString()
  return text ? `/szukaj?${text}` : '/szukaj'
}
