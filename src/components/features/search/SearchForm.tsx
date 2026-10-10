'use client'

import { Search } from 'lucide-react'
import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/cn'
import { searchHref } from '@/lib/search/href'
import type { SearchParams } from '@/lib/search/params'

import { useLocalitySuggestions } from './useLocalitySuggestions'

const TERMS = [
  { value: '', label: 'Obojętnie' },
  { value: '7', label: 'Do 7 dni' },
  { value: '14', label: 'Do 14 dni' },
  { value: '30', label: 'Do 30 dni' },
]

type Props = {
  services: ComboboxOption[]
  /** Miasta województwa – lista w pustym polu „Gdzie?”. */
  cities?: ComboboxOption[]
  service?: ComboboxOption | null
  locality?: ComboboxOption | null
  term?: string
  /** Parametry filtrów, które zostają przy nowym wyszukaniu (strona wyników). */
  keep?: SearchParams
  variant?: 'hero' | 'bar'
  className?: string
}

/**
 * Wyszukiwarka (SPEC 3.1): usługa, miejscowość (TERYT, literówki), termin. Bez JS działa jako
 * zwykły formularz GET; z JS prowadzi do czystego adresu wyników bez pustych parametrów.
 */
export function SearchForm({
  services,
  cities = [],
  service = null,
  locality = null,
  term = '',
  keep,
  variant = 'hero',
  className,
}: Props) {
  const router = useRouter()
  const [chosenService, setService] = useState(service)
  const [chosenLocality, setLocality] = useState(locality)
  const [when, setWhen] = useState(term)
  const { places, loading, search: searchPlaces } = useLocalitySuggestions(locality, cities)

  const hero = variant === 'hero'
  return (
    <Form
      action="/szukaj"
      role="search"
      aria-label="Szukaj firm remontowych"
      onSubmit={(event) => {
        event.preventDefault()
        router.push(
          searchHref(
            { ...(keep?.usluga === chosenService?.value ? keep : {}) },
            {
              usluga: chosenService?.value,
              gdzie: chosenLocality?.value,
              termin: (when || undefined) as SearchParams['termin'],
            },
          ),
        )
      }}
      className={cn(
        'grid gap-3',
        hero
          ? 'rounded-card border border-line bg-surface-1 p-3 md:grid-cols-12 md:items-end md:p-4'
          : 'md:grid-cols-12 md:items-end',
        className,
      )}
    >
      {/* Pola dobrowolne (puste = wszystkie firmy); `required` w Field tylko ukrywa „(opcjonalnie)”. */}
      <Field id={`${variant}-usluga`} label="Czego szukasz?" required className="md:col-span-4">
        {(control) => (
          <Combobox
            {...control}
            required={false}
            label="Usługa"
            name="usluga"
            options={services}
            browseOnFocus
            value={chosenService}
            onValueChange={setService}
            placeholder="np. glazurnik, remont łazienki"
          />
        )}
      </Field>
      <Field id={`${variant}-gdzie`} label="Gdzie?" required className="md:col-span-4">
        {(control) => (
          <Combobox
            {...control}
            required={false}
            label="Miejscowość"
            name="gdzie"
            options={places}
            browseOnFocus
            loading={loading}
            onQueryChange={searchPlaces}
            value={chosenLocality}
            onValueChange={setLocality}
            placeholder="np. Łódź, Zgierz"
          />
        )}
      </Field>
      <Field id={`${variant}-termin`} label="Kiedy start?" required className="md:col-span-2">
        {(control) => (
          <Select
            {...control}
            required={false}
            name="termin"
            options={TERMS}
            value={when}
            onChange={(event) => setWhen(event.target.value)}
          />
        )}
      </Field>
      <Button type="submit" variant="primary" className="md:col-span-2">
        <Icon icon={Search} />
        Szukam
      </Button>
    </Form>
  )
}
