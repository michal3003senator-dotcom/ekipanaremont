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
  const [result, setResult] = useState<ActionResult<unknown> | null>(null)

  const run = <D>(
    action: () => Promise<ActionResult<D>>,
    onOk?: (result: Extract<ActionResult<D>, { ok: true }>) => void,
  ) =>
    startTransition(async () => {
      const next = await action()
      setResult(next)
      if (next.ok) onOk?.(next as Extract<ActionResult<D>, { ok: true }>)
      else
        for (const [field, message] of Object.entries(next.fieldErrors ?? {})) {
          if (field !== 'form') setError(field as Path<T>, { type: 'server', message })
        }
    })

  return { pending, result, run }
}
