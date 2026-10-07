'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'

import { replyToReviewAction } from '../actions'

/** Publiczna odpowiedź firmy: raz, z poprawkami przez 24 h (SPEC 3.4). */
export function ReplyForm({
  id,
  initial,
  editable,
}: {
  id: string
  initial?: string | null
  editable: boolean
}) {
  const [reply, setReply] = useState(initial ?? '')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  if (!editable) return null
  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="self-start">
        {initial ? 'Poprawiam odpowiedź' : 'Odpowiadam publicznie'}
      </Button>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <Field
        id={`odpowiedz-${id}`}
        label="Twoja odpowiedź"
        required
        hint="Widoczna pod opinią. Poprawki możliwe przez 24 godziny od publikacji."
        error={error}
      >
        {(control) => (
          <Textarea
            {...control}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            maxLength={1500}
            showCount
            rows={4}
          />
        )}
      </Field>
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="sm"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await replyToReviewAction({ id, reply })
              if (result.ok) {
                setOpen(false)
                toast({ title: 'Odpowiedź opublikowana' })
              } else setError(result.fieldErrors?.reply ?? result.message)
            })
          }
        >
          Publikuję odpowiedź
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Anuluj
        </Button>
      </div>
    </div>
  )
}
