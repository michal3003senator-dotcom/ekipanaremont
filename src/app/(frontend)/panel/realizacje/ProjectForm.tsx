'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { useActionForm } from '@/components/features/forms/useActionForm'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select, type SelectOption } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import { type ProjectInput, projectSchema } from '@/lib/validation/forms'

import { searchLocalitiesAction } from '../actions'
import { saveProjectAction } from './actions'

type Props = {
  id?: string
  initial: ProjectInput
  services: SelectOption[]
  locality: ComboboxOption | null
  /** Po utworzeniu przechodzimy do zdjęć; `kreator` – z powrotem do kreatora profilu. */
  returnTo?: 'kreator'
}

const emptyToUndefined = (value: string) => (value === '' ? undefined : value)

export function ProjectForm({ id, initial, services, locality: initialLocality, returnTo }: Props) {
  const router = useRouter()
  const { register, control, handleSubmit, setError, formState } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    mode: 'onTouched',
    defaultValues: initial,
  })
  const { pending, result, run } = useActionForm(setError)
  const [options, setOptions] = useState<ComboboxOption[]>(initialLocality ? [initialLocality] : [])
  const [locality, setLocality] = useState(initialLocality)
  const errors = formState.errors

  const submit = (data: ProjectInput) =>
    run(
      () => saveProjectAction({ ...data, id, locality: locality?.value }),
      (saved) => {
        if (id) toast({ title: 'Realizacja zapisana' })
        else if (saved.data)
          router.replace(
            `/panel/realizacje/${saved.data.id}${returnTo ? `?powrot=${returnTo}` : ''}`,
          )
      },
    )

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(submit)(event)}
      className="flex flex-col gap-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <Field
        id="title"
        label="Tytuł"
        required
        hint="Co i gdzie, np. „Łazienka 6 m² na Widzewie”."
        error={errors.title?.message}
      >
        {(control) => <Input {...control} {...register('title')} maxLength={120} />}
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="service" label="Usługa" error={errors.service?.message}>
          {(control) => (
            <Select
              {...control}
              {...register('service', { setValueAs: emptyToUndefined })}
              options={services}
              placeholder="Wybierz usługę"
            />
          )}
        </Field>
        <Field id="completedMonth" label="Miesiąc wykonania" error={errors.completedMonth?.message}>
          {(control) => (
            <Input
              {...control}
              {...register('completedMonth', { setValueAs: emptyToUndefined })}
              type="month"
            />
          )}
        </Field>
      </div>
      <Field id="locality" label="Miejscowość">
        {(control) => (
          <Combobox
            {...control}
            label="Miejscowość"
            options={options}
            onQueryChange={(query) => void searchLocalitiesAction(query).then(setOptions)}
            value={locality}
            onValueChange={setLocality}
            placeholder="np. Łódź"
          />
        )}
      </Field>
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Field
            id="description"
            label="Opis"
            hint="Zakres prac, materiały, czas wykonania."
            error={errors.description?.message}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                maxLength={2000}
                showCount
                rows={5}
              />
            )}
          </Field>
        )}
      />
      <Button
        type="submit"
        variant={id ? 'secondary' : 'primary'}
        loading={pending}
        className="self-start max-sm:w-full"
      >
        {id ? 'Zapisuję zmiany' : 'Zapisuję i dodaję zdjęcia'}
      </Button>
    </form>
  )
}
