import { Send } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { RadioGroup, RadioItem } from '@/components/ui/Radio'
import { RatingInput } from '@/components/ui/RatingInput'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'

import { ComboboxDemo, DatePickerDemo } from '../_components/Demos'
import { Section, State } from '../_components/Section'

const BUDGETS = [
  { value: 'do-5', label: 'do 5 tys. zł' },
  { value: '5-15', label: '5–15 tys. zł' },
  { value: '15-40', label: '15–40 tys. zł' },
  { value: '40-100', label: '40–100 tys. zł' },
  { value: 'pow-100', label: 'powyżej 100 tys. zł' },
  { value: 'nie-wiem', label: 'nie wiem' },
]

export default function FormsPage() {
  return (
    <>
      <h1 className="pt-10 font-display text-h1 font-medium md:pt-16">Formularze</h1>

      <Section
        title="Przycisk"
        description="48 px wysokości (44 px w wersji mniejszej). Główna akcja w akcencie – najwyżej jedna na ekranie."
        className="sm:grid-cols-2 lg:grid-cols-4"
      >
        <State label="Główna akcja">
          <Button variant="primary">Wyślij zapytanie</Button>
        </State>
        <State label="Drugorzędny">
          <Button>Pokaż numer telefonu</Button>
        </State>
        <State label="Bez tła">
          <Button variant="ghost">Anuluj</Button>
        </State>
        <State label="Usunięcie">
          <Button variant="danger">Usuń realizację</Button>
        </State>
        <State label="Mniejszy, z ikoną">
          <Button size="sm">
            <Icon icon={Send} />
            Odpowiedz
          </Button>
        </State>
        <State label="Tylko ikona">
          <Button size="icon" aria-label="Wyślij">
            <Icon icon={Send} />
          </Button>
        </State>
        <State label="Wyłączony">
          <Button variant="primary" disabled>
            Wyślij zapytanie
          </Button>
        </State>
        <State label="W toku">
          <Button variant="primary" loading>
            Wysyłam…
          </Button>
        </State>
      </Section>

      <Section title="Pole tekstowe" className="md:grid-cols-2">
        <Field id="imie" label="Imię" required>
          {(control) => <Input {...control} autoComplete="given-name" placeholder="Np. Anna" />}
        </Field>
        <Field id="telefon" label="Telefon" hint="9 cyfr, bez +48.">
          {(control) => (
            <Input {...control} type="tel" inputMode="tel" autoComplete="tel-national" />
          )}
        </Field>
        <Field id="telefon-blad" label="Telefon" error="Podaj numer z 9 cyframi">
          {(control) => <Input {...control} type="tel" defaultValue="12 345" />}
        </Field>
        <Field id="nip" label="NIP" hint="Uzupełniamy automatycznie z CEIDG." required>
          {(control) => (
            <Input {...control} defaultValue="7251234567" disabled className="font-data" />
          )}
        </Field>
      </Section>

      <Section title="Opis i lista" className="md:grid-cols-2">
        <Field
          id="opis"
          label="Opis prac"
          hint="Od 20 do 2000 znaków. Co, gdzie, jaka powierzchnia."
          required
        >
          {(control) => (
            <Textarea
              {...control}
              maxLength={2000}
              showCount
              defaultValue="Remont łazienki 6 m²: skucie płytek, nowa glazura do sufitu, wymiana wanny na kabinę."
            />
          )}
        </Field>
        <Field id="budzet" label="Budżet" required>
          {(control) => <Select {...control} options={BUDGETS} placeholder="Wybierz przedział" />}
        </Field>
      </Section>

      <Section
        title="Pole z podpowiedziami i data"
        description="Podpowiedzi działają bez polskich znaków: „lodz” znajduje Łódź. Kalendarz zaczyna tydzień od poniedziałku."
        className="md:grid-cols-2"
      >
        <ComboboxDemo />
        <DatePickerDemo />
      </Section>

      <Section title="Wybór" className="md:grid-cols-3">
        <State label="Pole wyboru">
          <div>
            <CheckboxField
              id="zgoda"
              required
              label="Zgadzam się na przekazanie danych firmie"
              description="Tylko w celu odpowiedzi na to zapytanie."
            />
            <CheckboxField id="vat" label="Faktura VAT" defaultChecked />
            <CheckboxField id="wylaczone" label="Niedostępne" disabled />
          </div>
        </State>
        <State label="Jedna z kilku">
          <RadioGroup defaultValue="sprzedam" aria-label="Rodzaj ogłoszenia">
            <RadioItem id="sprzedam" value="sprzedam" label="Sprzedam" />
            <RadioItem
              id="zamienie"
              value="zamienie"
              label="Zamienię"
              description="Napisz, na co chcesz zamienić."
            />
          </RadioGroup>
        </State>
        <State label="Przełącznik">
          <div>
            <Switch
              id="powiadomienia"
              label="Nowe zapytania e-mailem"
              description="Bez danych klienta w treści wiadomości."
              defaultChecked
            />
            <Switch id="podsumowanie" label="Podsumowanie tygodnia" />
          </div>
        </State>
      </Section>

      <Section title="Ocena" description="Pola radio pod gwiazdkami: strzałki zmieniają ocenę.">
        <RatingInput name="ocena" legend="Jak oceniasz prace?" defaultValue={4} />
      </Section>
    </>
  )
}
