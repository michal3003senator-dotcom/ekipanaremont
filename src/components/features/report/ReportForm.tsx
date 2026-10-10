'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { reportAction } from '@/app/(frontend)/(serwis)/zgloszenie/actions'
import { FormNotice } from '@/components/features/auth/FormNotice'
import { Turnstile } from '@/components/features/auth/Turnstile'
import { useActionForm } from '@/components/features/forms/useActionForm'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { PUBLIC_REASONS, type PublicTarget } from '@/lib/moderation/options'
import { type ReportInput, reportSchema } from '@/lib/validation/moderation'

type Props = { targetType: PublicTarget; targetId: string; nonce?: string }

const REASONS = Object.entries(PUBLIC_REASONS).map(([value, label]) => ({ value, label }))

/** Formularz zgłoszenia (SPEC 3.13, art. 16 DSA): powód, opis, e-mail i oświadczenie. */
export function ReportForm({ targetType, targetId, nonce }: Props) {
  const { register, control, handleSubmit, setError, setValue, formState } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    mode: 'onTouched',
    defaultValues: { targetType, targetId, description: '', reporterName: '', reporterEmail: '' },
  })
  const { pending, result, run } = useActionForm(setError)
  const [sent, setSent] = useState(false)
  const errors = formState.errors
  const onToken = useCallback(
    (token: string | undefined) => setValue('turnstileToken', token),
    [setValue],
  )

  if (sent)
    return (
      <FormNotice tone="success">
        <p className="font-medium">Zgłoszenie przyjęte</p>
        <p className="text-text-muted">
          Potwierdzenie wysłaliśmy e-mailem. Decyzję z uzasadnieniem dostaniesz w osobnej
          wiadomości.
        </p>
      </FormNotice>
    )

  return (
    <form
      noValidate
      onSubmit={(event) =>
        void handleSubmit((data) =>
          run(
            () => reportAction(data),
            () => setSent(true),
          ),
        )(event)
      }
      className="flex flex-col gap-4"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <Field id="report-reason" label="Powód" required error={errors.reason?.message}>
        {(field) => (
          <Select
            {...field}
            {...register('reason')}
            options={REASONS}
            placeholder="Wybierz powód"
          />
        )}
      </Field>
      <Field
        id="report-description"
        label="Co jest nie tak?"
        hint="Konkretnie: które zdanie, zdjęcie lub dane. Bez danych osobowych innych osób."
        required
        error={errors.description?.message}
      >
        {(field) => (
          <Textarea {...field} {...register('description')} rows={4} maxLength={2000} showCount />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="report-name" label="Imię i nazwisko" error={errors.reporterName?.message}>
          {(field) => <Input {...field} {...register('reporterName')} autoComplete="name" />}
        </Field>
        <Field id="report-email" label="E-mail" required error={errors.reporterEmail?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('reporterEmail')}
              type="email"
              autoComplete="email"
              inputMode="email"
            />
          )}
        </Field>
      </div>
      <Controller
        control={control}
        name="goodFaith"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <CheckboxField
              id="report-good-faith"
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
              label={
                <>
                  Oświadczam, że zgłoszenie składam w dobrej wierze, a informacje są prawdziwe i
                  pełne. Zasady w{' '}
                  <Link
                    href="/zasady-moderacji"
                    className="underline underline-offset-4"
                    target="_blank"
                  >
                    zasadach moderacji
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
      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Wysyłam zgłoszenie
      </Button>
    </form>
  )
}
