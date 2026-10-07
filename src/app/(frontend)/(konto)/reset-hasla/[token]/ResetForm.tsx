'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { resetPasswordSchema } from '@/lib/validation/forms'

import { resetPasswordAction } from '../../actions'
import { useActionForm } from '../../_components/useActionForm'

type Values = z.input<typeof resetPasswordSchema>

export function ResetForm({ token }: { token: string }) {
  const { register, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { token, password: '' },
  })
  const { pending, result, run } = useActionForm(setError)

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit((data) => run(() => resetPasswordAction(data)))(event)}
      className="flex flex-col gap-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">
          <p>{result.message}</p>
          <Link href="/reset-hasla" className="self-start font-medium underline underline-offset-4">
            Poproś o nowy link
          </Link>
        </FormNotice>
      )}
      <Field
        id="password"
        label="Nowe hasło"
        required
        hint="Co najmniej 12 znaków. Najłatwiej zapamiętać 3–4 niezwiązane słowa."
        error={formState.errors.password?.message}
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
      <Button type="submit" variant="primary" loading={pending}>
        Zapisuję nowe hasło
      </Button>
    </form>
  )
}
