'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Turnstile } from '@/components/features/auth/Turnstile'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { forgotPasswordSchema } from '@/lib/validation/forms'

import { forgotPasswordAction } from '../actions'
import { useActionForm } from '@/components/features/forms/useActionForm'

type Values = z.input<typeof forgotPasswordSchema>

export function ForgotForm({ siteKey, nonce }: { siteKey?: string; nonce?: string }) {
  const { register, handleSubmit, setError, setValue, formState } = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  })
  const { pending, result, run } = useActionForm(setError)
  const onToken = useCallback(
    (token: string | undefined) => setValue('turnstileToken', token),
    [setValue],
  )

  if (result?.ok) return <FormNotice tone="success">{result.message}</FormNotice>

  return (
    <form
      noValidate
      onSubmit={(event) =>
        void handleSubmit((data) => run(() => forgotPasswordAction(data)))(event)
      }
      className="flex flex-col gap-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <Field id="email" label="E-mail konta" required error={formState.errors.email?.message}>
        {(control) => (
          <Input
            {...control}
            {...register('email')}
            type="email"
            autoComplete="email"
            inputMode="email"
          />
        )}
      </Field>
      <Turnstile siteKey={siteKey} nonce={nonce} onToken={onToken} />
      <Button type="submit" variant="primary" loading={pending}>
        Wyślij link do zmiany hasła
      </Button>
    </form>
  )
}
