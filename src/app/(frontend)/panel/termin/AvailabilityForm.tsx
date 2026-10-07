'use client'

import { useState, useTransition } from 'react'

import {
  AvailabilityCaption,
  AvailabilityStrip,
} from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field } from '@/components/ui/Field'
import { toast } from '@/components/ui/Toast'
import { addDays, type CalendarDate, formatShortDate } from '@/lib/format/date'
import { AVAILABILITY_MAX_DAYS } from '@/lib/validation/limits'

import { clearAvailabilityAction, confirmAvailabilityAction } from '../actions'

type Props = {
  today: CalendarDate
  initial: CalendarDate | null
  confirmedOn?: CalendarDate
  expiryDays: number
}

/** Wybór daty z podglądem kafli na żywo i potwierdzenie jednym dotknięciem (SPEC 3.4, 3.5). */
export function AvailabilityForm({ today, initial, confirmedOn, expiryDays }: Props) {
  const [date, setDate] = useState<CalendarDate | null>(
    initial && initial >= today ? initial : null,
  )
  const [confirmed, setConfirmed] = useState(confirmedOn)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  const availability = getAvailability(today, date)

  const confirm = () =>
    startTransition(async () => {
      const result = await confirmAvailabilityAction({ date })
      if (result.ok) {
        setConfirmed(today)
        setError(undefined)
        toast({ title: 'Termin potwierdzony' })
      } else setError(result.fieldErrors?.date ?? result.message)
    })

  const clear = () =>
    startTransition(async () => {
      const result = await clearAvailabilityAction()
      if (result.ok) {
        setDate(null)
        setConfirmed(undefined)
        toast({ title: 'Termin usunięty' })
      }
    })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 rounded-card border border-line bg-surface-1 p-5">
        <AvailabilityStrip today={today} availability={availability} size="profile" />
        <AvailabilityCaption
          today={today}
          availability={availability}
          confirmedOn={date === initial ? confirmed : undefined}
        />
      </div>
      <Field
        id="termin"
        label="Najbliższy wolny termin"
        required
        hint={`Od dziś do ${formatShortDate(addDays(today, AVAILABILITY_MAX_DAYS))}.`}
        error={error}
      >
        {(control) => (
          <DatePicker
            {...control}
            label="Najbliższy wolny termin"
            value={date}
            onValueChange={setDate}
            min={today}
            max={addDays(today, AVAILABILITY_MAX_DAYS)}
            placeholder="Wybierz dzień"
          />
        )}
      </Field>
      <p className="text-small text-text-muted">
        Po potwierdzeniu termin jest widoczny przez {expiryDays} dni. Przypomnimy e-mailem, żeby go
        odświeżyć.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          loading={pending}
          disabled={!date}
          onClick={confirm}
          className="max-sm:w-full"
        >
          Potwierdzam termin
        </Button>
        {initial && (
          <Button variant="ghost" disabled={pending} onClick={clear} className="max-sm:w-full">
            Nie mam wolnego terminu
          </Button>
        )}
      </div>
    </div>
  )
}
