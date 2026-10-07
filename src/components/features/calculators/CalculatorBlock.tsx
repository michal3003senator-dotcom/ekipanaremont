import { headers } from 'next/headers'

import { idOf } from '@/access'
import { calculatorsEnabled, getCalculator, toPublicCalculator } from '@/lib/content/calculators'
import type { ContentReader } from '@/lib/content/articles'
import { publicContext } from '@/lib/search/context'

import { Calculator } from './Calculator'

/**
 * Kalkulator w treści albo na własnej stronie. Bez kompletu parametrów albo przy wyłączonym
 * module nic nie pokazuje; w podglądzie redakcji mówi, czego brakuje.
 */
export async function CalculatorBlock({
  calculator,
  reader,
}: {
  calculator: unknown
  reader: ContentReader
}) {
  const id = idOf(calculator)
  if (!id || !(await calculatorsEnabled())) return null
  const { payload } = await publicContext()
  const doc = await getCalculator(payload, { id }, reader)
  const publicCalculator = doc ? toPublicCalculator(doc) : null
  if (!publicCalculator) {
    return reader.draft ? (
      <p className="rounded-control border border-line bg-surface-2 px-4 py-3 text-small">
        Kalkulator „{doc?.title ?? 'bez nazwy'}” nie pokaże się czytelnikom: uzupełnij jego
        parametry w panelu i opublikuj go.
      </p>
    ) : null
  }
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return <Calculator calculator={publicCalculator} id={`kalkulator-${id}`} nonce={nonce} />
}
