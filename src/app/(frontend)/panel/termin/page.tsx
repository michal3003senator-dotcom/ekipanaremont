import { redirect } from 'next/navigation'

import { todayInWarsaw } from '@/lib/format/date'
import { availabilityState } from '@/lib/panel/availability'
import { getPanel } from '@/lib/panel/context'
import { getSettings } from '@/lib/settings'

import { PanelHeading } from '../_components/PanelSection'
import { AvailabilityForm } from './AvailabilityForm'

export default async function AvailabilityPage() {
  const { firm } = await getPanel('/panel/termin')
  if (!firm) redirect('/panel/profil/nowy')
  const today = todayInWarsaw()
  const expiryDays = (await getSettings()).availabilityExpiryDays ?? 14
  const state = availabilityState(firm.availability, today, expiryDays)
  return (
    <>
      <PanelHeading
        title="Termin"
        lead="Najbliższy dzień, w którym możesz zacząć nowe zlecenie. Firmy z potwierdzonym terminem są wyżej w wynikach."
      />
      <AvailabilityForm
        today={today}
        initial={state.date}
        confirmedOn={state.confirmedOn}
        expiryDays={expiryDays}
      />
    </>
  )
}
