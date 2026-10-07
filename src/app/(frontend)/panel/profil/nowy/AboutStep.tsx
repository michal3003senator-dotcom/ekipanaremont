'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { type AboutStepInput, aboutStepSchema } from '@/lib/validation/forms'

import { useActionForm } from '@/components/features/forms/useActionForm'
import { saveAboutAction } from '../../actions'

const numberOrUndefined = (value: string) => (value === '' ? undefined : Number(value))

/** Krok 3: krótki opis i fakty, które klient porównuje między firmami. */
export function AboutStep({ initial, next }: { initial: AboutStepInput; next: string }) {
  const router = useRouter()
  const { register, control, handleSubmit, setError, formState } = useForm<AboutStepInput>({
    resolver: zodResolver(aboutStepSchema),
    mode: 'onTouched',
    defaultValues: initial,
  })
  const { pending, result, run } = useActionForm(setError)
  const errors = formState.errors

  return (
    <form
      noValidate
      onSubmit={(event) =>
        void handleSubmit((data) =>
          run(
            () => saveAboutAction(data),
            () => router.push(next),
          ),
        )(event)
      }
      className="flex flex-col gap-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <Field
        id="shortDescription"
        label="Krótki opis"
        required
        hint="2–3 zdania: co robisz najlepiej i gdzie. Widać go na karcie firmy w wynikach."
        error={errors.shortDescription?.message}
      >
        {(control) => (
          <Textarea
            {...control}
            {...register('shortDescription')}
            maxLength={300}
            showCount
            rows={4}
          />
        )}
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="phone"
          label="Telefon"
          hint="Klient zobaczy go po kliknięciu „Pokaż numer”."
          error={errors.phone?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register('phone')}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
            />
          )}
        </Field>
        <Field id="website" label="Strona internetowa" error={errors.website?.message}>
          {(control) => (
            <Input
              {...control}
              {...register('website')}
              type="url"
              inputMode="url"
              placeholder="https://"
            />
          )}
        </Field>
        <Field
          id="warrantyMonths"
          label="Gwarancja (miesiące)"
          error={errors.warrantyMonths?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register('warrantyMonths', { setValueAs: numberOrUndefined })}
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
            />
          )}
        </Field>
        <Field
          id="yearsExperience"
          label="Lata doświadczenia"
          error={errors.yearsExperience?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register('yearsExperience', { setValueAs: numberOrUndefined })}
              type="number"
              inputMode="numeric"
              min={0}
              max={80}
            />
          )}
        </Field>
        <Field id="teamSize" label="Liczba osób w ekipie" error={errors.teamSize?.message}>
          {(control) => (
            <Input
              {...control}
              {...register('teamSize', { setValueAs: numberOrUndefined })}
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
            />
          )}
        </Field>
      </div>
      <Controller
        control={control}
        name="vatInvoice"
        render={({ field }) => (
          <Switch
            id="vatInvoice"
            label="Wystawiam faktury VAT"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Button
        type="submit"
        variant="primary"
        loading={pending}
        className="self-start max-sm:w-full"
      >
        Zapisuję i przechodzę dalej
      </Button>
    </form>
  )
}
