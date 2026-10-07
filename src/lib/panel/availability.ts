import { type Availability, getAvailability } from '@/components/features/availability-tiles/model'
import { addDays, type CalendarDate, calendarDateOf } from '@/lib/format/date'

export type AvailabilityState = {
  availability: Availability
  /** Zapisana data (także nieaktywna) – do formularza terminu. */
  date: CalendarDate | null
  confirmedOn: CalendarDate | undefined
  /** Dzień, po którym termin wygaśnie bez ponownego potwierdzenia. */
  expiresOn: CalendarDate | null
  /** Termin jest zapisany, ale już nie jest pokazywany klientom. */
  expired: boolean
}

type FirmAvailability = { date?: string | null; confirmedAt?: string | null } | null | undefined

/**
 * Stan terminu według reguł SPEC 3.5: aktywny, gdy data jest dziś lub później
 * i od potwierdzenia minęło najwyżej `expiryDays` dni.
 */
export function availabilityState(
  value: FirmAvailability,
  today: CalendarDate,
  expiryDays: number,
): AvailabilityState {
  const date = (value?.date as CalendarDate | undefined) ?? null
  const confirmedOn = value?.confirmedAt ? calendarDateOf(value.confirmedAt) : undefined
  const expiresOn = confirmedOn ? addDays(confirmedOn, expiryDays) : null
  const expired = Boolean(date) && (date! < today || !expiresOn || expiresOn < today)
  return {
    availability: expired ? { status: 'none' } : getAvailability(today, date),
    date,
    confirmedOn,
    expiresOn,
    expired,
  }
}
