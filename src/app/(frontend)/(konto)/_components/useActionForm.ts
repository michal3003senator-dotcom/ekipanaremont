'use client'

import { useState, useTransition } from 'react'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import type { ActionResult } from '@/lib/actions'

/**
 * Wywołanie Server Action z formularza React Hook Form: stan wysyłania, komunikat ogólny
 * i błędy pól z serwera (te same nazwy pól co w schemacie Zod).
 */
export function useActionForm<T extends FieldValues>(setError: UseFormSetError<T>) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  const run = (action: () => Promise<ActionResult>, onOk?: (result: ActionResult) => void) =>
    startTransition(async () => {
      const next = await action()
      setResult(next)
      if (next.ok) onOk?.(next)
      else
        for (const [field, message] of Object.entries(next.fieldErrors ?? {})) {
          if (field !== 'form') setError(field as Path<T>, { type: 'server', message })
        }
    })

  return { pending, result, run }
}
