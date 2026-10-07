'use client'

import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'

type Props = {
  id: string
  label: string
  unit: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  required?: boolean
}

/** Pole liczby z jednostką (m², cm, mm) – przecinek albo kropka, klawiatura numeryczna. */
export function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  error,
  hint,
  required = true,
}: Props) {
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint}>
      {(control) => (
        <div className="relative">
          <Input
            {...control}
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="pe-14 font-data"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-small text-text-muted"
          >
            {unit}
          </span>
        </div>
      )}
    </Field>
  )
}
