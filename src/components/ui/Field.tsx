import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

/** Atrybuty, które pole formularza dostaje od `Field`. */
export type FieldControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  required?: boolean
}

type FieldProps = {
  id: string
  label: string
  /** Podpowiedź pod polem, np. format lub limit. */
  hint?: string
  /** Konkretny komunikat błędu, np. „Podaj numer z 9 cyframi” (DESIGN §8). */
  error?: string
  required?: boolean
  className?: string
  children: (control: FieldControlProps) => ReactNode
}

/** Etykieta, podpowiedź i błąd pod polem, powiązane z polem przez id. */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const hintId = hint ? `${id}-podpowiedz` : undefined
  const errorId = error ? `${id}-blad` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-small font-medium">
        {label}
        {!required && <span className="font-normal text-text-muted"> (opcjonalnie)</span>}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required,
      })}
      {hint && (
        <p id={hintId} className="text-small text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-small text-danger">
          <Icon icon={CircleAlert} className="mt-0.5 size-4" />
          {error}
        </p>
      )}
    </div>
  )
}
