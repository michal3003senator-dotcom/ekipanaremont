'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { decideAction } from '@/app/(frontend)/moderacja/actions'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import type { DecisionInput } from '@/lib/validation/moderation'

export type DecisionOption = {
  decision: DecisionInput['decision']
  label: string
  /** Ten sam przycisk potwierdza decyzję w panelu uzasadnienia. */
  confirm?: string
  variant: 'primary' | 'tonal' | 'secondary' | 'danger'
  needsReason: boolean
}

export type ReasonTemplate = { label: string; text: string }

type Props = {
  kind: DecisionInput['kind']
  id: string
  options: DecisionOption[]
  templates: ReasonTemplate[]
}

/**
 * Akcje karty (SPEC 3.11): duże przyciski pod kciukiem. Decyzja ograniczająca otwiera pole
 * uzasadnienia z gotowymi szablonami – uzasadnienie trafia do autora razem z linkiem do odwołania.
 */
export function DecisionBar({ kind, id, options, templates }: Props) {
  const router = useRouter()
  const reasonId = useId()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState<DecisionOption | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (option: DecisionOption, text = '') =>
    startTransition(async () => {
      const result = await decideAction({
        kind,
        id,
        decision: option.decision,
        reason: text,
      } as DecisionInput)
      if (!result.ok) {
        setError(result.fieldErrors?.reason ?? result.message ?? 'Nie udało się zapisać decyzji.')
        if (!result.fieldErrors) router.refresh()
        return
      }
      toast({ title: 'Zapisano decyzję', tone: 'success' })
      setOpen(null)
      router.refresh()
    })

  if (open) {
    return (
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <label htmlFor={reasonId} className="font-medium">
          Uzasadnienie – {open.label.toLowerCase()}
        </label>
        {templates.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Gotowe uzasadnienia">
            {templates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => setReason(template.text)}
                className="state-layer rounded-pill border border-line-strong px-3 py-2 text-small"
              >
                {template.label}
              </button>
            ))}
          </div>
        )}
        <Textarea
          id={reasonId}
          value={reason}
          maxLength={5000}
          rows={4}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${reasonId}-error` : undefined}
          onChange={(event) => {
            setReason(event.target.value)
            setError(null)
          }}
          placeholder="Konkretnie: co narusza zasady i co autor może zrobić."
        />
        {error && (
          <p id={`${reasonId}-error`} className="text-small text-danger">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(null)} disabled={pending}>
            Anuluj
          </Button>
          <Button
            type="button"
            variant={open.variant === 'danger' ? 'danger' : 'primary'}
            loading={pending}
            onClick={() => submit(open, reason.trim())}
          >
            {open.confirm ?? open.label}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      {error && <p className="text-small text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <Button
            key={option.decision}
            type="button"
            variant={option.variant}
            loading={pending && !option.needsReason}
            disabled={pending}
            onClick={() => (option.needsReason ? setOpen(option) : submit(option))}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
