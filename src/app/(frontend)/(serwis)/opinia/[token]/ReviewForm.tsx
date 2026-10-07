'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { useActionForm } from '@/components/features/forms/useActionForm'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { RatingInput } from '@/components/ui/RatingInput'
import { Textarea } from '@/components/ui/Textarea'
import { type ReviewInput, reviewSchema } from '@/lib/validation/forms'

import { submitReviewAction } from './actions'

type Props = { token: string; firmName: string; suggestedSignature: string }

export function ReviewForm({ token, firmName, suggestedSignature }: Props) {
  const { register, control, handleSubmit, setError, formState } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    mode: 'onTouched',
    defaultValues: { token, title: '', body: '', authorDisplayName: suggestedSignature },
  })
  const { pending, result, run } = useActionForm(setError)
  const [sent, setSent] = useState(false)
  const errors = formState.errors

  if (sent) {
    return (
      <FormNotice tone="success">
        <p className="font-medium">Opinia wysłana</p>
        <p className="text-text-muted">
          Dziękujemy. Sprawdzimy ją i opublikujemy w profilu firmy {firmName}.{' '}
          <Link href="/jak-sprawdzamy-opinie" className="underline underline-offset-4">
            Jak sprawdzamy opinie
          </Link>
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
            () => submitReviewAction(data),
            () => setSent(true),
          ),
        )(event)
      }
      className="flex flex-col gap-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <Controller
        control={control}
        name="rating"
        render={({ field, fieldState }) => (
          <RatingInput
            name="rating"
            legend="Ocena"
            error={fieldState.error?.message}
            onValueChange={(value) => field.onChange(value)}
          />
        )}
      />
      <Field id="title" label="Tytuł" error={errors.title?.message}>
        {(field) => <Input {...field} {...register('title')} maxLength={120} />}
      </Field>
      <Field
        id="body"
        label="Opinia"
        required
        hint="Co firma zrobiła, czy dotrzymała terminu, jak wyglądał kontakt."
        error={errors.body?.message}
      >
        {(field) => (
          <Textarea {...field} {...register('body')} rows={6} maxLength={1500} showCount />
        )}
      </Field>
      <Field
        id="authorDisplayName"
        label="Podpis"
        required
        hint="Imię i dzielnica albo miejscowość, np. „Anna, Widzew”. Bez nazwiska."
        error={errors.authorDisplayName?.message}
      >
        {(field) => <Input {...field} {...register('authorDisplayName')} maxLength={80} />}
      </Field>
      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Wysyłam opinię
      </Button>
    </form>
  )
}
