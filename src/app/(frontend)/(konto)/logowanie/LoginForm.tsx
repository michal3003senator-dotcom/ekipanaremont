'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { type LoginInput, loginSchema } from '@/lib/validation/forms'

import { loginAction, resendVerificationAction } from '../actions'
import { useActionForm } from '../_components/useActionForm'

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const { register, handleSubmit, setError, getValues, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '', next },
  })
  const { pending, result, run } = useActionForm(setError)
  const resend = useActionForm(setError)
  const unverified = result && !result.ok && result.fieldErrors?.form === 'unverified'
  const errors = formState.errors

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit((data) => run(() => loginAction(data)))(event)}
      className="flex flex-col gap-6"
    >
      {notice && !result && <FormNotice tone="success">{notice}</FormNotice>}
      {result && !result.ok && result.message && (
        <FormNotice tone="error">
          <p>{result.message}</p>
          {unverified && (
            <button
              type="button"
              className="self-start font-medium underline underline-offset-4"
              onClick={() =>
                resend.run(() => resendVerificationAction({ email: getValues('email') }))
              }
            >
              Wyślij link ponownie
            </button>
          )}
        </FormNotice>
      )}
      {resend.result?.ok && <FormNotice tone="success">{resend.result.message}</FormNotice>}
      <Field id="email" label="E-mail" required error={errors.email?.message}>
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
      <Field id="password" label="Hasło" required error={errors.password?.message}>
        {(control) => (
          <Input
            {...control}
            {...register('password')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <div className="flex flex-col gap-4">
        <Button type="submit" variant="primary" loading={pending}>
          Zaloguj się
        </Button>
        <Link
          href="/reset-hasla"
          className="self-start text-small text-text-muted underline underline-offset-4 hover:text-text"
        >
          Nie pamiętasz hasła?
        </Link>
      </div>
      <p className="border-t border-line pt-6 text-small text-text-muted">
        Nie masz konta?{' '}
        <Link href="/rejestracja" className="font-medium text-text underline underline-offset-4">
          Załóż konto firmy
        </Link>
      </p>
    </form>
  )
}
