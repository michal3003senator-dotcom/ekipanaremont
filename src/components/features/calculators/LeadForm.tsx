'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { submitLeadAction } from '@/app/(frontend)/(serwis)/kalkulatory/actions'
import { FormNotice } from '@/components/features/auth/FormNotice'
import { Turnstile } from '@/components/features/auth/Turnstile'
import { useActionForm } from '@/components/features/forms/useActionForm'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { type LeadInput, leadSchema } from '@/lib/validation/forms'

type Props = {
  calculatorId: string
  inputs: Record<string, number | null | undefined>
  nonce?: string
}

/** Prośba o kontakt z wynikiem kalkulatora – osobna zgoda (SPEC 3.8). */
export function LeadForm({ calculatorId, inputs, nonce }: Props) {
  const { register, control, handleSubmit, setError, setValue, formState } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: 'onTouched',
    defaultValues: { calculatorId, inputs, name: '', email: '', phone: '' },
  })
  const { pending, result, run } = useActionForm(setError)
  const [sent, setSent] = useState(false)
  const errors = formState.errors
  const onToken = useCallback(
    (token: string | undefined) => setValue('turnstileToken', token),
    [setValue],
  )

  if (sent) {
    return (
      <FormNotice tone="success">
        <p className="font-medium">Prośba zapisana</p>
        <p className="text-text-muted">
          Odezwiemy się e-mailem z propozycją firm z wolnym terminem.
        </p>
      </FormNotice>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) =>
        void handleSubmit((data) =>
          run(
            () => submitLeadAction({ ...data, inputs }),
            () => setSent(true),
          ),
        )(event)
      }
      className="flex flex-col gap-4 border-t border-line pt-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="lead-name" label="Imię" required error={errors.name?.message}>
          {(field) => <Input {...field} {...register('name')} autoComplete="given-name" />}
        </Field>
        <Field id="lead-email" label="E-mail" required error={errors.email?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('email')}
              type="email"
              autoComplete="email"
              inputMode="email"
            />
          )}
        </Field>
        <Field id="lead-phone" label="Telefon" error={errors.phone?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('phone')}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
            />
          )}
        </Field>
      </div>
      <Controller
        control={control}
        name="consent"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <CheckboxField
              id="lead-consent"
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
              label={
                <>
                  Zgadzam się na kontakt w sprawie tej wyceny i zapisanie wyniku kalkulatora.
                  Szczegóły w{' '}
                  <Link
                    href="/polityka-prywatnosci"
                    className="underline underline-offset-4"
                    target="_blank"
                  >
                    polityce prywatności
                  </Link>
                  .
                </>
              }
            />
            {fieldState.error && (
              <p className="text-small text-danger">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        nonce={nonce}
        onToken={onToken}
      />
      <Button type="submit" variant="secondary" loading={pending} className="self-start">
        Wysyłam prośbę
      </Button>
    </form>
  )
}
