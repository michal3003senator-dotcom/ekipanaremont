'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'

import { saveServicesAction, searchLocalitiesAction } from '../../actions'
import { stepHref } from './steps'

export type ServiceGroup = { id: string; name: string; children: { id: string; name: string }[] }

type Props = {
  groups: ServiceGroup[]
  selected: string[]
  base: ComboboxOption | null
  area: ComboboxOption[]
  next?: string
}

/** Podpowiedzi z serwera z opóźnieniem 250 ms – bez zapytania na każdy znak. */
function useLocalitySearch() {
  const [options, setOptions] = useState<ComboboxOption[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const search = (query: string) => {
    clearTimeout(timer.current)
    if (query.trim().length < 2) return setOptions([])
    setLoading(true)
    timer.current = setTimeout(() => {
      void searchLocalitiesAction(query).then((found) => {
        setOptions(found)
        setLoading(false)
      })
    }, 250)
  }
  return { options, loading, search }
}

/** Krok 2: usługi (z podusługami) i obszar działania z TERYT. */
export function ServicesStep({
  groups,
  selected: initialSelected,
  base: initialBase,
  area: initialArea,
  next = stepHref('o-firmie'),
}: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState(() => new Set(initialSelected))
  const [base, setBase] = useState<ComboboxOption | null>(initialBase)
  const [area, setArea] = useState<ComboboxOption[]>(initialArea)
  const [adding, setAdding] = useState<ComboboxOption | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()
  const baseSearch = useLocalitySearch()
  const areaSearch = useLocalitySearch()

  const toggle = (id: string, on: boolean, children: string[] = []) =>
    setSelected((current) => {
      const nextSet = new Set(current)
      if (on) nextSet.add(id)
      else [id, ...children].forEach((value) => nextSet.delete(value))
      return nextSet
    })

  const addArea = (option: ComboboxOption | null) => {
    setAdding(null)
    if (option && !area.some((item) => item.value === option.value))
      setArea((current) => [...current, option])
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveServicesAction({
        services: [...selected],
        serviceArea: area.map((item) => item.value),
        baseLocality: base?.value ?? '',
      })
      if (result.ok) router.push(next)
      else setErrors(result.fieldErrors ?? { form: result.message ?? 'Nie udało się zapisać.' })
    })

  return (
    <div className="flex flex-col gap-10">
      {errors.form && <FormNotice tone="error">{errors.form}</FormNotice>}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-lead font-medium">Czym się zajmujesz?</legend>
        <p className="mb-2 text-small text-text-muted">
          Zaznacz usługi, a pod nimi zakres prac. Klienci filtrują po nich wyniki.
        </p>
        {errors.services && <p className="text-small text-danger">{errors.services}</p>}
        <ul className="flex flex-col border-t border-line">
          {groups.map((group) => {
            const on = selected.has(group.id)
            return (
              <li key={group.id} className="border-b border-line">
                <CheckboxField
                  id={`usluga-${group.id}`}
                  label={group.name}
                  checked={on}
                  onCheckedChange={(checked) =>
                    toggle(
                      group.id,
                      checked === true,
                      group.children.map((child) => child.id),
                    )
                  }
                />
                {on && group.children.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-4 ps-9">
                    {group.children.map((child) => {
                      const active = selected.has(child.id)
                      return (
                        <button
                          key={child.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggle(child.id, !active)}
                          className="min-h-11 rounded-badge border border-line-strong px-4 text-small transition-colors duration-150 hover:border-text-muted aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-bg"
                        >
                          {child.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="mb-2 text-lead font-medium">Gdzie pracujesz?</legend>
        <Field id="siedziba" label="Siedziba firmy" required error={errors.baseLocality}>
          {(control) => (
            <Combobox
              {...control}
              label="Siedziba firmy"
              options={baseSearch.options}
              loading={baseSearch.loading}
              onQueryChange={baseSearch.search}
              value={base}
              onValueChange={setBase}
              placeholder="np. Zgierz"
            />
          )}
        </Field>
        <Field
          id="obszar"
          label="Obszar działania"
          required
          hint="Dodaj miejscowości, w których przyjmujesz zlecenia. Siedziba dojdzie sama."
          error={errors.serviceArea}
        >
          {(control) => (
            <Combobox
              // Nowy klucz po dodaniu – pole czyści się na kolejną miejscowość.
              key={area.length}
              {...control}
              label="Obszar działania"
              options={areaSearch.options}
              loading={areaSearch.loading}
              onQueryChange={areaSearch.search}
              value={adding}
              onValueChange={addArea}
              placeholder="Dodaj miejscowość"
            />
          )}
        </Field>
        {area.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Wybrane miejscowości">
            {area.map((item) => (
              <li
                key={item.value}
                className="flex items-center gap-1 rounded-badge border border-line bg-surface-2 ps-3 text-small"
              >
                {item.label}
                <button
                  type="button"
                  onClick={() =>
                    setArea((current) => current.filter((value) => value.value !== item.value))
                  }
                  className="flex size-11 items-center justify-center text-text-muted hover:text-text"
                  aria-label={`Usuń ${item.label}`}
                >
                  <Icon icon={X} className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <Button
        variant="primary"
        loading={pending}
        onClick={save}
        className="self-start max-sm:w-full"
      >
        Zapisuję i przechodzę dalej
      </Button>
    </div>
  )
}
