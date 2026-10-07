'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Turnstile } from '@/components/features/auth/Turnstile'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { type RegisterInput, registerSchema } from '@/lib/validation/forms'

import { registerAction, resendVerificationAction } from '../actions'
import { useActionForm } from '../_components/useActionForm'

type Props = { siteKey?: string; nonce?: string }

export function RegisterForm({ siteKey, nonce }: Props) {
  const { register, control, handleSubmit, setError, setValue, getValues, formState } =
    useForm<RegisterInput>({
      resolver: zodResolver(registerSchema),
      mode: 'onTouched',
      defaultValues: { email: '', password: '' },
    })
  const { pending, result, run } = useActionForm(setError)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const onToken = useCallback(
    (token: string | undefined) => setValue('turnstileToken', token),
    [setValue],
  )
  const errors = formState.errors

  if (sentTo) {
    return (
      <div className="flex flex-col gap-6">
        <FormNotice tone="success">
          <p className="font-medium">Sprawdź skrzynkę {sentTo}</p>
          <p className="text-text-muted">
            Kliknij link w wiadomości, żeby potwierdzić adres. Link działa 24 godziny.
          </p>
        </FormNotice>
        <Button
          variant="ghost"
          loading={pending}
          onClick={() => run(() => resendVerificationAction({ email: sentTo }))}
          className="self-start"
        >
          Wyślij link ponownie
        </Button>
        {result?.ok && result.message && (
          <p className="text-small text-text-muted" role="status">
            {result.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) =>
        void handleSubmit((data) =>
          run(
            () => registerAction(data),
            () => setSentTo(getValues('email').trim().toLowerCase()),
          ),
        )(event)
      }
      className="flex flex-col gap-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <Field id="email" label="E-mail firmowy" required error={errors.email?.message}>
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
      <Field
        id="password"
        label="Hasło"
        required
        hint="Co najmniej 12 znaków. Najłatwiej zapamiętać 3–4 niezwiązane słowa."
        error={errors.password?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register('password')}
            type="password"
            autoComplete="new-password"
          />
        )}
      </Field>
      <Controller
        control={control}
        name="terms"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <CheckboxField
              id="terms"
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
              label={
                <>
                  Akceptuję{' '}
                  <Link href="/regulamin" className="underline underline-offset-4" target="_blank">
                    regulamin
                  </Link>{' '}
                  i{' '}
                  <Link
                    href="/polityka-prywatnosci"
                    className="underline underline-offset-4"
                    target="_blank"
                  >
                    politykę prywatności
                  </Link>
                </>
              }
            />
            {fieldState.error && (
              <p className="text-small text-danger">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
      <Turnstile siteKey={siteKey} nonce={nonce} onToken={onToken} />
      <Button type="submit" variant="primary" loading={pending}>
        Zakładam konto
      </Button>
      <p className="text-small text-text-muted">
        Masz już konto?{' '}
        <Link href="/logowanie" className="font-medium text-text underline underline-offset-4">
          Zaloguj się
        </Link>
      </p>
    </form>
  )
}
