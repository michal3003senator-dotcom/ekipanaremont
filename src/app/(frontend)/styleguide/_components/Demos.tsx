'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { DatePicker } from '@/components/ui/DatePicker'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/Dialog'
import { Field } from '@/components/ui/Field'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet'
import { toast } from '@/components/ui/Toast'
import { addDays, type CalendarDate } from '@/lib/format/date'

import { DEMO_TODAY, LOCALITIES } from '../_data'

export function ComboboxDemo() {
  const [value, setValue] = useState<ComboboxOption | null>(null)
  return (
    <Field
      id="miejscowosc"
      label="Miejscowość"
      hint="Wpisz co najmniej jedną literę, np. „lodz”."
      required
    >
      {(control) => (
        <Combobox
          {...control}
          label="Miejscowość"
          options={LOCALITIES}
          value={value}
          onValueChange={setValue}
          placeholder="Np. Zgierz"
          name="miejscowosc"
        />
      )}
    </Field>
  )
}

export function DatePickerDemo() {
  const [value, setValue] = useState<CalendarDate | null>('2026-10-14')
  return (
    <Field id="termin" label="Wolny termin" hint="Od dziś do 180 dni (SPEC 3.5)." required>
      {(control) => (
        <DatePicker
          {...control}
          label="Wolny termin"
          value={value}
          onValueChange={setValue}
          min={DEMO_TODAY}
          max={addDays(DEMO_TODAY, 180)}
        />
      )}
    </Field>
  )
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Otwórz okno</Button>
      </DialogTrigger>
      <DialogContent
        title="Potwierdzasz termin od 14 paź?"
        description="Klienci zobaczą go w wynikach do 21 paź. Przed wygaśnięciem przypomnimy e-mailem."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="ghost">Anuluj</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="primary" onClick={() => toast({ title: 'Termin potwierdzony' })}>
                Potwierdzam termin
              </Button>
            </DialogClose>
          </>
        }
      />
    </Dialog>
  )
}

export function SheetDemo() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Otwórz panel</Button>
      </SheetTrigger>
      <SheetContent
        title="Filtry"
        description="Pokażemy tylko firmy, które spełniają wszystkie warunki."
        onDismiss={() => setOpen(false)}
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Pokaż 12 firm
          </Button>
        }
      >
        <div className="flex flex-col">
          <CheckboxField id="filtr-vat" label="Faktura VAT" defaultChecked />
          <CheckboxField id="filtr-ocena" label="Ocena 4,5 i więcej" />
          <CheckboxField id="filtr-gwarancja" label="Gwarancja na prace" />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ToastDemo() {
  return (
    <Button
      onClick={() =>
        toast({
          title: 'Termin potwierdzony',
          description: 'Firma jest widoczna w wynikach do 21 paź.',
        })
      }
    >
      Pokaż powiadomienie
    </Button>
  )
}
