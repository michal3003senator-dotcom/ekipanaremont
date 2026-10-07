'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { nipSchema } from '@/lib/validation/forms'

import { createFirmAction, lookupNipAction } from '../../actions'
import { stepHref } from './steps'

type Lookup = { status: string; name?: string; address?: string | null }

const SOURCES: Record<string, string> = { found: 'Znaleźliśmy firmę w rejestrze' }

/** Krok 1: NIP → rejestry → potwierdzenie danych albo nazwa podana ręcznie (ADR 0019). */
export function NipStep() {
  const router = useRouter()
  const [nip, setNip] = useState('')
  const [name, setName] = useState('')
  const [lookup, setLookup] = useState<Lookup | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const check = () => {
    const parsed = nipSchema.safeParse({ nip })
    if (!parsed.success) return setError(parsed.error.issues[0]!.message)
    setError(null)
    startTransition(async () => {
      const result = await lookupNipAction({ nip })
      if (result.ok) setLookup(result.data ?? null)
      else {
        setLookup(null)
        setError(result.fieldErrors?.nip ?? null)
        setMessage(result.message ?? null)
      }
    })
  }

  const create = () =>
    startTransition(async () => {
      const result = await createFirmAction({
        nip,
        name: lookup?.status === 'found' ? undefined : name,
      })
      if (result.ok) router.push(stepHref('uslugi'))
      else {
        setError(result.fieldErrors?.nip ?? null)
        setMessage(result.message ?? result.fieldErrors?.name ?? null)
      }
    })

  return (
    <div className="flex flex-col gap-6">
      {message && <FormNotice tone="error">{message}</FormNotice>}
      <Field
        id="nip"
        label="NIP firmy"
        required
        hint="10 cyfr, z myślnikami albo bez."
        error={error ?? undefined}
      >
        {(control) => (
          <Input
            {...control}
            value={nip}
            onChange={(event) => {
              setNip(event.target.value)
              setLookup(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                check()
              }
            }}
            inputMode="numeric"
            autoComplete="off"
            maxLength={13}
            className="font-data tabular-nums"
          />
        )}
      </Field>

      {!lookup && (
        <Button
          variant="primary"
          loading={pending}
          onClick={check}
          className="self-start max-sm:w-full"
        >
          Sprawdzam NIP
        </Button>
      )}

      {lookup?.status === 'found' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-line bg-surface-1 p-5">
            <p className="text-micro uppercase tracking-caps text-text-muted">{SOURCES.found}</p>
            <p className="mt-2 text-lead font-medium">{lookup.name}</p>
            {lookup.address && <p className="text-small text-text-muted">{lookup.address}</p>}
          </div>
          <Button
            variant="primary"
            loading={pending}
            onClick={create}
            className="self-start max-sm:w-full"
          >
            To moja firma – dalej
          </Button>
        </div>
      )}

      {lookup && lookup.status !== 'found' && (
        <div className="flex flex-col gap-4">
          <FormNotice tone="info">
            <p className="font-medium">
              {lookup.status === 'unavailable'
                ? 'Rejestry chwilowo nie odpowiadają.'
                : 'Nie znaleźliśmy tego NIP w rejestrach.'}
            </p>
            <p className="text-text-muted">
              Podaj nazwę firmy. Moderator sprawdzi NIP ręcznie przed publikacją profilu.
            </p>
          </FormNotice>
          <Field id="name" label="Nazwa firmy" required>
            {(control) => (
              <Input
                {...control}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                autoComplete="organization"
              />
            )}
          </Field>
          <Button
            variant="primary"
            loading={pending}
            onClick={create}
            disabled={name.trim().length < 2}
            className="self-start max-sm:w-full"
          >
            Zakładam profil – dalej
          </Button>
        </div>
      )}
    </div>
  )
}
