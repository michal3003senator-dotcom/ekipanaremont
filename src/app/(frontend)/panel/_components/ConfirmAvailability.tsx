'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'

import {
  AvailabilityCaption,
  AvailabilityStrip,
} from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { addDays, type CalendarDate, formatShortDate } from '@/lib/format/date'

import { confirmAvailabilityAction } from '../actions'

type Props = {
  today: CalendarDate
  date: CalendarDate | null
  confirmedOn?: CalendarDate
  expiresOn: CalendarDate | null
  expired: boolean
  expiryDays: number
  /** Na pulpicie przycisk jest główną akcją ekranu, chyba że profil czeka na wysłanie. */
  primary: boolean
}

/**
 * Kafel terminu z „Potwierdzam termin” (SPEC 3.4): jedno dotknięcie, interfejs reaguje od razu
 * (stan optymistyczny), a przy błędzie wraca do poprzedniego i mówi, co się stało.
 */
export function ConfirmAvailability({
  today,
  date,
  confirmedOn,
  expiresOn,
  expired,
  expiryDays,
  primary,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [state, setOptimistic] = useOptimistic({ confirmedOn, expiresOn, expired })
  const active = date && !(date < today)
  const availability =
    active && !state.expired ? getAvailability(today, date) : ({ status: 'none' } as const)

  const confirm = () =>
    startTransition(async () => {
      setOptimistic({ confirmedOn: today, expiresOn: addDays(today, expiryDays), expired: false })
      const result = await confirmAvailabilityAction({})
      if (result.ok) toast({ title: 'Termin potwierdzony' })
      else
        toast({
          title: 'Termin niepotwierdzony',
          description: result.message ?? result.fieldErrors?.date,
          tone: 'danger',
        })
    })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <AvailabilityStrip today={today} availability={availability} size="profile" />
        <AvailabilityCaption
          today={today}
          availability={availability}
          confirmedOn={state.confirmedOn}
        />
      </div>
      {active ? (
        <>
          <p className="text-small text-text-muted" aria-live="polite">
            {state.expired
              ? 'Termin wygasł i klienci go nie widzą. Potwierdź, że jest aktualny.'
              : state.expiresOn
                ? `Bez potwierdzenia termin zniknie z wyszukiwarki po ${formatShortDate(state.expiresOn)}.`
                : null}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={primary ? 'primary' : 'secondary'}
              loading={pending}
              onClick={confirm}
              className="max-sm:w-full"
            >
              Potwierdzam termin
            </Button>
            <Button asChild variant="ghost" className="max-sm:w-full">
              <Link href="/panel/termin">Zmieniam datę</Link>
            </Button>
          </div>
        </>
      ) : (
        <Button
          asChild
          variant={primary ? 'primary' : 'secondary'}
          className="self-start max-sm:w-full"
        >
          <Link href="/panel/termin">Ustawiam termin</Link>
        </Button>
      )}
    </div>
  )
}
