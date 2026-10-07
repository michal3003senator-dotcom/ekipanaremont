'use client'

import { useState, useTransition } from 'react'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { toast } from '@/components/ui/Toast'
import type { ActionResult } from '@/lib/actions'

import {
  changeEmailAction,
  changePasswordAction,
  deleteAccountAction,
  exportDataAction,
  saveNotificationsAction,
} from './actions'

type Prefs = { inquiries: boolean; availabilityReminders: boolean; reviews: boolean }

const PREF_LABELS: Record<keyof Prefs, { label: string; description: string }> = {
  inquiries: { label: 'Nowe zapytania', description: 'E-mail, gdy klient napisze do firmy.' },
  availabilityReminders: {
    label: 'Przypomnienia o terminie',
    description: 'Prośba o potwierdzenie terminu przed wygaśnięciem.',
  },
  reviews: { label: 'Nowe opinie', description: 'E-mail po publikacji opinii o firmie.' },
}

export function NotificationsForm({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState(initial)
  const [pending, startTransition] = useTransition()
  const change = (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    startTransition(async () => {
      const result = await saveNotificationsAction(next)
      if (!result.ok) {
        setPrefs(prefs)
        toast({ title: 'Ustawienia niezapisane', description: result.message, tone: 'danger' })
      }
    })
  }
  return (
    <div className="flex flex-col gap-2" aria-busy={pending || undefined}>
      {(Object.keys(PREF_LABELS) as (keyof Prefs)[]).map((key) => (
        <Switch
          key={key}
          id={`powiadomienia-${key}`}
          label={PREF_LABELS[key].label}
          description={PREF_LABELS[key].description}
          checked={prefs[key]}
          onCheckedChange={(value) => change(key, value)}
        />
      ))}
    </div>
  )
}

/** Mały formularz z polami tekstowymi i wynikiem akcji – wspólny dla sekcji ustawień. */
function useSettingsAction<D>(action: (input: Record<string, string>) => Promise<ActionResult<D>>) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ActionResult<D> | null>(null)
  const [pending, startTransition] = useTransition()
  const submit = (onOk?: (result: ActionResult<D>) => void) =>
    startTransition(async () => {
      const next = await action(values)
      setResult(next)
      if (next.ok) {
        setValues({})
        onOk?.(next)
      }
    })
  const field = (name: string) => ({
    value: values[name] ?? '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [name]: event.target.value })),
  })
  const error = (name: string) => (result && !result.ok ? result.fieldErrors?.[name] : undefined)
  return { submit, field, error, result, pending }
}

export function PasswordForm() {
  const { submit, field, error, result, pending } = useSettingsAction(changePasswordAction)
  return (
    <form onSubmit={(event) => (event.preventDefault(), submit())} className="flex flex-col gap-4">
      {result?.ok && <FormNotice tone="success">{result.message}</FormNotice>}
      <Field id="current" label="Obecne hasło" required error={error('current')}>
        {(control) => (
          <Input
            {...control}
            {...field('current')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <Field
        id="next"
        label="Nowe hasło"
        required
        hint="Co najmniej 12 znaków."
        error={error('next')}
      >
        {(control) => (
          <Input {...control} {...field('next')} type="password" autoComplete="new-password" />
        )}
      </Field>
      <Button type="submit" loading={pending} className="self-start max-sm:w-full">
        Zmieniam hasło
      </Button>
    </form>
  )
}

export function EmailForm({ current }: { current: string }) {
  const { submit, field, error, result, pending } = useSettingsAction(changeEmailAction)
  return (
    <form onSubmit={(event) => (event.preventDefault(), submit())} className="flex flex-col gap-4">
      {result?.ok && <FormNotice tone="success">{result.message}</FormNotice>}
      <p className="text-small text-text-muted">Obecny adres: {current}</p>
      <Field id="email" label="Nowy e-mail" required error={error('email')}>
        {(control) => <Input {...control} {...field('email')} type="email" autoComplete="email" />}
      </Field>
      <Field id="email-password" label="Hasło" required error={error('password')}>
        {(control) => (
          <Input
            {...control}
            {...field('password')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <Button type="submit" loading={pending} className="self-start max-sm:w-full">
        Zmieniam e-mail
      </Button>
    </form>
  )
}

export function ExportForm() {
  const { submit, field, error, pending } = useSettingsAction(exportDataAction)
  const download = (result: ActionResult<{ json: string }>) => {
    if (!result.ok || !result.data) return
    const url = URL.createObjectURL(new Blob([result.data.json], { type: 'application/json' }))
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: 'ekipanatermin-dane.json',
    })
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Dane pobrane' })
  }
  return (
    <form
      onSubmit={(event) => (event.preventDefault(), submit(download))}
      className="flex flex-col gap-4"
    >
      <p className="text-small text-text-muted">
        Plik JSON z kontem, profilem, realizacjami, zapytaniami, opiniami i statystykami.
      </p>
      <Field id="export-password" label="Hasło" required error={error('password')}>
        {(control) => (
          <Input
            {...control}
            {...field('password')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <Button type="submit" loading={pending} className="self-start max-sm:w-full">
        Pobieram dane
      </Button>
    </form>
  )
}

export function DeleteAccountForm() {
  const { submit, field, error, result, pending } = useSettingsAction(deleteAccountAction)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (
          window.confirm(
            'Usunąć konto, profil firmy, realizacje i zapytania? Tego nie da się cofnąć.',
          )
        )
          submit()
      }}
      className="flex flex-col gap-4"
    >
      {result && !result.ok && result.message && (
        <FormNotice tone="error">{result.message}</FormNotice>
      )}
      <p className="text-small text-text-muted">
        Usuniemy konto, profil firmy, realizacje ze zdjęciami, zapytania i statystyki. Opinie znikną
        z serwisu.
      </p>
      <Field id="delete-password" label="Hasło" required error={error('password')}>
        {(control) => (
          <Input
            {...control}
            {...field('password')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <Button type="submit" variant="danger" loading={pending} className="self-start max-sm:w-full">
        Usuwam konto
      </Button>
    </form>
  )
}
