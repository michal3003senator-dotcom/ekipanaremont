'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { type ActionResult, invalid, tooManyRequests } from '@/lib/actions'
import { clientIpHash } from '@/lib/auth/request'
import { runCalculator } from '@/lib/calculators/run'
import { getCalculator, toPublicCalculator } from '@/lib/content/calculators'
import { consentVersion } from '@/lib/legal'
import { rateLimit } from '@/lib/rate-limit'
import { getSettings } from '@/lib/settings'
import { verifyTurnstile } from '@/lib/turnstile'
import { leadSchema } from '@/lib/validation/forms'

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Prośba o kontakt z kalkulatora (SPEC 3.8, PLAN pyt. 23): osobna zgoda, dane zaszyfrowane,
 * widzi je tylko administrator, usuwane po okresie retencji. Wynik liczy serwer z parametrów CMS.
 */
export async function submitLeadAction(input: unknown): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const data = parsed.data

  const limit = await rateLimit('lead', await clientIpHash())
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)
  if (!(await verifyTurnstile(data.turnstileToken))) {
    return { ok: false, message: 'Nie udało się potwierdzić, że nie jesteś botem. Odśwież stronę.' }
  }

  const payload = await getPayload({ config })
  const doc = await getCalculator(payload, { id: data.calculatorId }, { draft: false })
  const calculator = doc ? toPublicCalculator(doc) : null
  const result = calculator ? runCalculator(calculator, data.inputs) : null
  if (!calculator || !result) return { ok: false, message: 'Uzupełnij kalkulator jeszcze raz.' }

  const { retention } = await getSettings()
  await payload.create({
    collection: 'leads',
    data: {
      calculator: calculator.id,
      inputs: data.inputs,
      result: { text: result.text, rows: result.rows },
      name: data.name,
      email: data.email,
      phone: data.phone,
      consentTextVersion: await consentVersion(payload, 'lead'),
      consentAt: new Date().toISOString(),
      status: 'new',
      retentionUntil: new Date(
        Date.now() + (retention?.leadsMonths ?? 12) * MONTH_MS,
      ).toISOString(),
    },
    overrideAccess: true,
  })
  return { ok: true, message: 'Prośba zapisana.' }
}
