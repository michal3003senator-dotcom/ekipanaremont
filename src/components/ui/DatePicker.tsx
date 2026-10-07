'use client'

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { pl } from 'react-day-picker/locale'

import { cn } from '@/lib/cn'
import {
  type CalendarDate,
  formatShortDateWithWeekday,
  fromLocalDate,
  toLocalDate,
  todayInWarsaw,
} from '@/lib/format/date'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'

import type { FieldControlProps } from './Field'
import { Icon } from './Icon'
import { fieldClasses } from './Input'
import { Sheet, SheetContent, SheetTrigger } from './Sheet'

type Props = FieldControlProps & {
  /** Tytuł panelu z kalendarzem na telefonie, zwykle jak etykieta pola. */
  label: string
  value: CalendarDate | null
  onValueChange: (date: CalendarDate) => void
  min?: CalendarDate
  max?: CalendarDate
  placeholder?: string
  name?: string
}

const DAY_CLASSES = {
  root: 'w-fit',
  months: 'relative',
  month: 'flex flex-col gap-2',
  nav: 'absolute end-0 top-0 flex gap-1',
  button_previous:
    'flex size-11 cursor-pointer items-center justify-center rounded-control hover:bg-surface-2 disabled:cursor-default disabled:opacity-40',
  button_next:
    'flex size-11 cursor-pointer items-center justify-center rounded-control hover:bg-surface-2 disabled:cursor-default disabled:opacity-40',
  month_caption: 'flex h-11 items-center ps-1 font-medium capitalize',
  weekday: 'h-8 text-micro font-normal uppercase tracking-caps text-text-muted',
  day: 'p-0',
  day_button:
    'flex size-11 cursor-pointer items-center justify-center rounded-control font-data text-small transition-colors duration-150 hover:bg-surface-2',
  today: 'font-semibold underline decoration-line-strong decoration-2 underline-offset-4',
  selected: '[&>button]:bg-accent [&>button]:text-on-accent [&>button]:hover:bg-accent-hover',
  disabled: 'opacity-40 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent',
  outside: 'text-text-muted',
  hidden: 'invisible',
}

/** Wybór dnia, np. wolnego terminu (dziś … +180 dni, SPEC 3.5). Na telefonie w dolnym panelu. */
export function DatePicker({
  label,
  value,
  onValueChange,
  min,
  max,
  placeholder = 'Wybierz dzień',
  name,
  ...control
}: Props) {
  const [open, setOpen] = useState(false)
  const isMobile = useMediaQuery('(width < 48rem)')
  const today = toLocalDate(todayInWarsaw())

  const calendar = (
    <DayPicker
      mode="single"
      locale={pl}
      weekStartsOn={1}
      today={today}
      selected={value ? toLocalDate(value) : undefined}
      defaultMonth={value ? toLocalDate(value) : today}
      startMonth={min ? toLocalDate(min) : undefined}
      endMonth={max ? toLocalDate(max) : undefined}
      disabled={[
        ...(min ? [{ before: toLocalDate(min) }] : []),
        ...(max ? [{ after: toLocalDate(max) }] : []),
      ]}
      onSelect={(date) => {
        if (!date) return
        onValueChange(fromLocalDate(date))
        setOpen(false)
      }}
      classNames={DAY_CLASSES}
      components={{
        Chevron: ({ orientation }) => (
          <Icon icon={orientation === 'left' ? ChevronLeft : ChevronRight} />
        ),
      }}
    />
  )

  const trigger = (
    <button
      type="button"
      {...control}
      className={cn(
        fieldClasses,
        'flex h-12 cursor-pointer items-center justify-between px-4 text-start',
      )}
    >
      <span className={cn(value ? 'font-data' : 'text-text-muted')}>
        {value ? formatShortDateWithWeekday(value) : placeholder}
      </span>
      <Icon icon={CalendarDays} className="text-text-muted" />
    </button>
  )

  return (
    <>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent title={label} onDismiss={() => setOpen(false)}>
            <div className="flex justify-center">{calendar}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>{trigger}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={8}
              className="z-40 rounded-card border border-line bg-surface-1 p-3 shadow-float state-open:animate-pop-in state-closed:animate-pop-out"
            >
              {calendar}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </>
  )
}
