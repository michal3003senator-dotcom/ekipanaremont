'use client'

import { useState } from 'react'

import { AvailabilityStrip } from '@/components/features/availability-tiles/AvailabilityTiles'
import { availabilityFrom, getAvailability } from '@/components/features/availability-tiles/model'
import { type CalendarDate, daysBetween } from '@/lib/format/date'
import { formatCount } from '@/lib/format/number'

import { type DemoFirm, LOCALITIES, type LocalityKey, SERVICES, type ServiceKey } from '../_data'
import { ChevronIcon, PrimaryButton, SegmentedField, START_OPTIONS } from './Fields'

type FirmTerm = Pick<DemoFirm, 'availableFrom' | 'offers' | 'serves'>

type Props = { today: CalendarDate; firms: FirmTerm[] }

type InlineSelectProps<T extends string> = {
  label: string
  name: string
  value: T
  options: ReadonlyArray<{ key: T; label: string }>
  onChange: (value: T) => void
}

/** Pole wyboru wpisane w zdanie: widać tylko tekst, natywna lista leży na nim (dostępna z klawiatury). */
function InlineSelect<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: InlineSelectProps<T>) {
  const current = options.find((option) => option.key === value)?.label ?? ''
  return (
    <span className="relative inline-flex items-baseline gap-[0.15em] border-b-2 border-line-strong transition-colors duration-150 hover:border-text-muted has-focus-visible:rounded-badge has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-accent">
      <span aria-hidden="true">{current}</span>
      <ChevronIcon className="size-[0.5em] self-center text-text-muted" />
      <select
        aria-label={label}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  )
}

/** C „Zdanie”: wybór miejscowości i usługi daje odpowiedź – najbliższy wolny termin. */
export function SentenceSearch({ today, firms }: Props) {
  const [locality, setLocality] = useState<LocalityKey>('zgierz')
  const [service, setService] = useState<ServiceKey>('lazienka')
  const [start, setStart] = useState('obojetnie')

  const matching = firms.filter(
    (firm) => firm.serves.includes(locality) && firm.offers.includes(service),
  )
  const activeDates = matching
    .map((firm) => firm.availableFrom)
    .filter((date): date is CalendarDate => date !== null && daysBetween(today, date) >= 0)
    .sort()
  const availability = getAvailability(today, activeDates[0] ?? null)
  const limit = start === 'obojetnie' ? null : Number(start)
  const count =
    limit === null
      ? matching.length
      : activeDates.filter((date) => daysBetween(today, date) <= limit).length

  return (
    <form action="/szukaj">
      <p className="font-display text-display font-semibold">
        <InlineSelect
          label="Miejscowość"
          name="miejscowosc"
          value={locality}
          options={LOCALITIES}
          onChange={setLocality}
        />
        ,{' '}
        <InlineSelect
          label="Usługa"
          name="usluga"
          value={service}
          options={SERVICES}
          onChange={setService}
        />
        :{' '}
        <output aria-live="polite" className="whitespace-nowrap">
          {availabilityFrom(availability) ?? 'zapytaj o termin'}.
        </output>
      </p>
      <AvailabilityStrip
        today={today}
        availability={availability}
        size="hero"
        className="mt-8 md:mt-10"
      />
      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-end md:justify-between">
        <SegmentedField
          legend="Start"
          name="termin"
          options={START_OPTIONS}
          value={start}
          onChange={setStart}
          className="md:w-md"
        />
        <PrimaryButton>{`Pokaż ${formatCount(count, { one: 'firmę', few: 'firmy', many: 'firm' })}`}</PrimaryButton>
      </div>
    </form>
  )
}
