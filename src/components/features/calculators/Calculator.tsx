'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { parseDecimal } from '@/lib/calculators/formulas'
import { CALCULATOR_FIELDS, runCalculator } from '@/lib/calculators/run'
import { searchHref } from '@/lib/search/href'

import { NumberField } from './NumberField'
import { INQUIRY_DRAFT_KEY } from './draft'
import type { PublicCalculator } from './types'

// Formularz kontaktu (React Hook Form, Zod, Turnstile) dopiero po kliknięciu.
const LeadForm = dynamic(() => import('./LeadForm').then((module) => module.LeadForm), {
  ssr: false,
})

/** Kalkulator (SPEC 3.8): wynik liczy się od razu, pod nim przejście do firm z wolnym terminem. */
export function Calculator({
  calculator,
  id,
  nonce,
}: {
  calculator: PublicCalculator
  id: string
  /** Nonce CSP dla skryptu Turnstile w formularzu kontaktu. */
  nonce?: string
}) {
  const [fields, setFields] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const inputs = Object.fromEntries(
    Object.entries(fields).map(([name, text]) => [
      name,
      text.trim() ? parseDecimal(text) : undefined,
    ]),
  )
  const result = runCalculator(calculator, inputs)
  const href = searchHref({}, { usluga: calculator.serviceSlug ?? undefined })

  const saveDraft = () => {
    if (!result) return
    try {
      sessionStorage.setItem(INQUIRY_DRAFT_KEY, result.text)
    } catch {
      // Bez sessionStorage opis zapytania po prostu zostanie pusty.
    }
  }

  return (
    <section
      aria-labelledby={`${id}-tytul`}
      className="flex flex-col gap-6 rounded-card border border-line bg-surface-1 p-4 inset-shadow-edge md:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-tytul`} className="font-display text-h3 font-medium">
          {calculator.title}
        </h2>
        {calculator.intro && <p className="text-small text-text-muted">{calculator.intro}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2" onBlur={() => setTouched(true)}>
        {CALCULATOR_FIELDS[calculator.type].map((field) => (
          <NumberField
            key={field.name}
            id={`${id}-${field.name}`}
            label={field.label}
            unit={field.unit}
            hint={field.hint}
            required={!field.optional}
            value={fields[field.name] ?? ''}
            onChange={(text) => setFields((current) => ({ ...current, [field.name]: text }))}
          />
        ))}
      </div>
      <output
        htmlFor={CALCULATOR_FIELDS[calculator.type].map((field) => `${id}-${field.name}`).join(' ')}
        aria-live="polite"
        className="block"
      >
        {result ? (
          <dl className="flex flex-col border-t border-line">
            {result.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 border-b border-line py-3"
              >
                <dt className="text-small text-text-muted">{row.label}</dt>
                <dd
                  className={row.strong ? 'font-data text-h3 font-medium' : 'font-data text-lead'}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-small text-text-muted">
            {touched && Object.values(fields).some(Boolean)
              ? 'Sprawdź wartości – liczba poza zakresem albo z błędem.'
              : 'Wpisz wymiary – wynik pojawi się od razu.'}
          </p>
        )}
      </output>
      {calculator.disclaimer && (
        <p className="text-micro text-text-muted">{calculator.disclaimer}</p>
      )}
      {result && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="primary">
            <Link href={href} onClick={saveDraft}>
              Znajdź firmę z wolnym terminem
            </Link>
          </Button>
          {!leadOpen && (
            <Button variant="secondary" onClick={() => setLeadOpen(true)}>
              Poproszę o kontakt
            </Button>
          )}
        </div>
      )}
      {result && leadOpen && (
        <LeadForm calculatorId={calculator.id} inputs={inputs} nonce={nonce} />
      )}
    </section>
  )
}
