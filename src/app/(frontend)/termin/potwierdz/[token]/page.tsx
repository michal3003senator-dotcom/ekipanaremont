import type { Metadata } from 'next'
import Link from 'next/link'

import { AvailabilityTiles } from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { type CalendarDate, todayInWarsaw } from '@/lib/format/date'

import { AccountScreen } from '../../../(konto)/_components/AccountScreen'
import { firmForLink } from '@/lib/panel/availability-link'

import { confirmFromEmailAction } from '../actions'

export const metadata: Metadata = {
  title: 'Potwierdzenie terminu – Ekipa na Termin',
  referrer: 'no-referrer',
  robots: { index: false },
}

export default async function ConfirmFromEmailPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  if (token === 'gotowe') {
    return (
      <AccountScreen title="Termin potwierdzony" aside={false}>
        <div className="flex flex-col gap-6">
          <FormNotice tone="success">
            Klienci dalej widzą Twój termin. Przypomnimy, gdy znów będzie trzeba go potwierdzić.
          </FormNotice>
          <Button asChild variant="secondary" className="self-start">
            <Link href="/panel">Przechodzę do panelu</Link>
          </Button>
        </div>
      </AccountScreen>
    )
  }

  const firm = await firmForLink(token)
  if (!firm) {
    return (
      <AccountScreen title="Link nie działa" aside={false}>
        <div className="flex flex-col gap-6">
          <FormNotice tone="error">
            Link wygasł albo termin był już potwierdzony. Ustaw termin w panelu – zajmie to chwilę.
          </FormNotice>
          <Button asChild variant="primary" className="self-start">
            <Link href="/panel/termin">Ustawiam termin</Link>
          </Button>
        </div>
      </AccountScreen>
    )
  }

  const today = todayInWarsaw()
  const date = firm.availability!.date as CalendarDate
  return (
    <AccountScreen title="Czy termin jest nadal wolny?" lead={firm.name} aside={false}>
      <form action={confirmFromEmailAction} className="flex flex-col gap-8">
        <input type="hidden" name="token" value={token} />
        <AvailabilityTiles
          today={today}
          availability={getAvailability(today, date)}
          size="profile"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" variant="primary">
            Potwierdzam termin
          </Button>
          <Button asChild variant="ghost">
            <Link href="/panel/termin">Zmieniam datę</Link>
          </Button>
        </div>
      </form>
    </AccountScreen>
  )
}
