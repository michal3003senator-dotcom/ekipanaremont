'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Turnstile } from '@/components/features/auth/Turnstile'
import { useActionForm } from '@/components/features/forms/useActionForm'
import { INQUIRY_DRAFT_KEY } from '@/components/features/calculators/draft'
import { useLocalitySuggestions } from '@/components/features/search/useLocalitySuggestions'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { compressImage } from '@/lib/images'
import { BUDGET_RANGES, INQUIRY_MAX_PHOTOS, TIMEFRAMES } from '@/lib/inquiry/options'
import { type InquiryInput, inquirySchema } from '@/lib/validation/forms'

import { sendInquiryAction } from './actions'

/** Zdjęcia zapytania mniejsze niż w realizacjach – firma potrzebuje podglądu, nie wydruku. */
const PHOTO_MAX_SIDE = 1600

const asOptions = (entries: Record<string, string>) =>
  Object.entries(entries).map(([value, label]) => ({ value, label }))

type Photo = { file: File; url: string }

type Props = {
  firmSlug: string
  firmName: string
  services: ReadonlyArray<{ value: string; label: string }>
  siteKey?: string
  nonce?: string
}

/** Formularz zapytania w profilu (SPEC 3.6): bez rejestracji, zdjęcia zmniejszane w przeglądarce. */
export function InquiryForm({ firmSlug, firmName, services, siteKey, nonce }: Props) {
  const { register, control, handleSubmit, setError, setValue, formState } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    mode: 'onTouched',
    defaultValues: {
      firm: firmSlug,
      service: services.length === 1 ? services[0]?.value : '',
      locality: '',
      description: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
    },
  })
  const { pending, result, run } = useActionForm(setError)
  const [place, setPlace] = useState<ComboboxOption | null>(null)
  const { places, loading, search } = useLocalitySuggestions()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [preparing, setPreparing] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const errors = formState.errors
  const onToken = useCallback(
    (token: string | undefined) => setValue('turnstileToken', token),
    [setValue],
  )

  // Wynik z kalkulatora (ta sama karta przeglądarki) jako początek opisu prac.
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(INQUIRY_DRAFT_KEY)
      if (!draft) return
      setValue('description', `${draft} `, { shouldDirty: true })
      sessionStorage.removeItem(INQUIRY_DRAFT_KEY)
    } catch {
      // Bez sessionStorage opis zostaje pusty.
    }
  }, [setValue])

  const urls = useRef<string[]>([])
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  async function addPhotos(files: FileList | null) {
    const chosen = Array.from(files ?? []).slice(0, INQUIRY_MAX_PHOTOS - photos.length)
    if (!chosen.length) return
    setPreparing(true)
    const ready = await Promise.all(chosen.map((file) => compressImage(file, PHOTO_MAX_SIDE)))
    const added = ready.map((file) => ({ file, url: URL.createObjectURL(file) }))
    urls.current.push(...added.map((photo) => photo.url))
    setPhotos((current) => [...current, ...added].slice(0, INQUIRY_MAX_PHOTOS))
    setPreparing(false)
  }

  function removePhoto(url: string) {
    URL.revokeObjectURL(url)
    setPhotos((current) => current.filter((photo) => photo.url !== url))
  }

  const submit = (data: InquiryInput) =>
    run(() => {
      const form = new FormData()
      form.set('data', JSON.stringify(data))
      for (const photo of photos) form.append('photos', photo.file)
      return sendInquiryAction(form)
    })

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(submit)(event)}
      className="flex flex-col gap-6"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {services.length > 0 && (
          <Field id="service" label="Rodzaj prac" error={errors.service?.message}>
            {(field) => (
              <Select
                {...field}
                {...register('service')}
                options={services}
                placeholder="Wybierz usługę"
              />
            )}
          </Field>
        )}
        <Controller
          control={control}
          name="locality"
          render={({ field: { onChange, onBlur }, fieldState }) => (
            <Field id="locality" label="Miejscowość" required error={fieldState.error?.message}>
              {(field) => (
                <Combobox
                  {...field}
                  label="Miejscowość"
                  options={places}
                  loading={loading}
                  onQueryChange={search}
                  value={place}
                  onValueChange={(option) => {
                    setPlace(option)
                    onChange(option?.value ?? '')
                    onBlur()
                  }}
                  placeholder="np. Łódź, Widzew"
                />
              )}
            </Field>
          )}
        />
      </div>
      <Field
        id="description"
        label="Opis prac"
        required
        hint="Co trzeba zrobić, metraż, stan obecny. Bez danych kontaktowych – te podasz niżej."
        error={errors.description?.message}
      >
        {(field) => (
          <Textarea {...field} {...register('description')} rows={5} maxLength={2000} showCount />
        )}
      </Field>
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="budgetRange" label="Budżet" required error={errors.budgetRange?.message}>
          {(field) => (
            <Select
              {...field}
              {...register('budgetRange')}
              options={asOptions(BUDGET_RANGES)}
              placeholder="Wybierz przedział"
            />
          )}
        </Field>
        <Field id="timeframe" label="Planowany termin" required error={errors.timeframe?.message}>
          {(field) => (
            <Select
              {...field}
              {...register('timeframe')}
              options={asOptions(TIMEFRAMES)}
              placeholder="Wybierz termin"
            />
          )}
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-small font-medium">
          Zdjęcia <span className="font-normal text-text-muted">(do {INQUIRY_MAX_PHOTOS})</span>
        </legend>
        {photos.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {photos.map((photo, index) => (
              <li key={photo.url} className="relative overflow-hidden rounded-control">
                {/* eslint-disable-next-line @next/next/no-img-element -- podgląd lokalnego pliku (blob:), bez optymalizacji */}
                <img src={photo.url} alt="" className="aspect-square w-full object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={`Usuń zdjęcie ${index + 1}`}
                  onClick={() => removePhoto(photo.url)}
                  className="absolute end-1 top-1"
                >
                  <Icon icon={X} />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {photos.length < INQUIRY_MAX_PHOTOS && (
          <Button
            type="button"
            variant="secondary"
            loading={preparing}
            onClick={() => fileInput.current?.click()}
            className="self-start"
          >
            <Icon icon={ImagePlus} />
            Dodaj zdjęcia
          </Button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            void addPhotos(event.target.files)
            event.target.value = ''
          }}
        />
        {result && !result.ok && result.fieldErrors?.photos && (
          <p className="text-small text-danger">{result.fieldErrors.photos}</p>
        )}
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        <Field id="clientName" label="Imię" required error={errors.clientName?.message}>
          {(field) => <Input {...field} {...register('clientName')} autoComplete="given-name" />}
        </Field>
        <Field id="clientEmail" label="E-mail" required error={errors.clientEmail?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('clientEmail')}
              type="email"
              autoComplete="email"
              inputMode="email"
            />
          )}
        </Field>
        <Field
          id="clientPhone"
          label="Telefon"
          hint="Firmy chętniej oddzwaniają, niż piszą."
          error={errors.clientPhone?.message}
        >
          {(field) => (
            <Input
              {...field}
              {...register('clientPhone')}
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
              id="consent"
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
              label={
                <>
                  Zgadzam się na przekazanie zapytania i danych kontaktowych firmie {firmName}, żeby
                  mogła odpowiedzieć. Szczegóły w{' '}
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
      <Turnstile siteKey={siteKey} nonce={nonce} onToken={onToken} />
      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Wyślij zapytanie
      </Button>
    </form>
  )
}
