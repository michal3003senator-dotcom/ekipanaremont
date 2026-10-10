'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import { appealAction } from '@/app/(frontend)/(serwis)/zgloszenie/actions'
import { FormNotice } from '@/components/features/auth/FormNotice'
import { Turnstile } from '@/components/features/auth/Turnstile'
import { useActionForm } from '@/components/features/forms/useActionForm'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { type AppealInput, appealSchema } from '@/lib/validation/moderation'

/** Odwołanie (art. 20 DSA): uzasadnienie i e-mail do odpowiedzi; rozpatruje inny moderator. */
export function AppealForm({ token, nonce }: { token: string; nonce?: string }) {
  const { register, handleSubmit, setError, setValue, formState } = useForm<AppealInput>({
    resolver: zodResolver(appealSchema),
    mode: 'onTouched',
    defaultValues: { token, description: '', email: '' },
  })
  const { pending, result, run } = useActionForm(setError)
  const [sent, setSent] = useState(false)
  const errors = formState.errors
  const onToken = useCallback(
    (value: string | undefined) => setValue('turnstileToken', value),
    [setValue],
  )

  if (sent)
    return (
      <FormNotice tone="success">
        <p className="font-medium">Odwołanie przyjęte</p>
        <p className="text-text-muted">
          Rozpatrzy je inny moderator. Decyzję z uzasadnieniem wyślemy e-mailem.
        </p>
      </FormNotice>
    )

  return (
    <form
      noValidate
      onSubmit={(event) =>
        void handleSubmit((data) =>
          run(
            () => appealAction(data),
            () => setSent(true),
          ),
        )(event)
      }
      className="flex flex-col gap-4"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <Field
        id="appeal-description"
        label="Dlaczego decyzja jest błędna?"
        hint="Fakty, które moderator mógł pominąć. Możesz opisać, co już poprawiłeś."
        required
        error={errors.description?.message}
      >
        {(field) => (
          <Textarea {...field} {...register('description')} rows={6} maxLength={3000} showCount />
        )}
      </Field>
      <Field id="appeal-email" label="E-mail do odpowiedzi" required error={errors.email?.message}>
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
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        nonce={nonce}
        onToken={onToken}
      />
      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Wysyłam odwołanie
      </Button>
    </form>
  )
}
