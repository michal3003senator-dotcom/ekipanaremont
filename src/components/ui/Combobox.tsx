'use client'

import { LoaderCircle, Search } from 'lucide-react'
import { type KeyboardEvent, useState } from 'react'

import { cn } from '@/lib/cn'
import { filterByQuery } from '@/lib/format/search'

import type { FieldControlProps } from './Field'
import { Icon } from './Icon'
import { fieldClasses } from './Input'

export type ComboboxOption = { value: string; label: string; description?: string }

type Props = FieldControlProps & {
  /** Nazwa listy dla czytników ekranu, zwykle taka jak etykieta pola. */
  label: string
  options: readonly ComboboxOption[]
  value: ComboboxOption | null
  onValueChange: (option: ComboboxOption | null) => void
  /** Tryb z serwera: rodzic pobiera podpowiedzi dla frazy. Bez tego lista filtruje się lokalnie. */
  onQueryChange?: (query: string) => void
  loading?: boolean
  placeholder?: string
  /** Pole ukryte z wybraną wartością – do wysłania formularzem. */
  name?: string
  className?: string
  /** Lista rozwija się już po wejściu w puste pole – do przeglądania (miasta, kategorie usług). */
  browseOnFocus?: boolean
}

/**
 * Pole z podpowiedziami według wzorca WAI-ARIA (combobox + listbox, ADR 0014).
 * Klawiatura: strzałki wybierają, Enter zatwierdza, Esc zamyka listę, a przy zamkniętej czyści pole.
 */
export function Combobox({
  label,
  options,
  value,
  onValueChange,
  onQueryChange,
  loading = false,
  browseOnFocus = false,
  placeholder,
  name,
  className,
  ...control
}: Props) {
  const [query, setQuery] = useState(value?.label ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const listId = `${control.id}-lista`
  const results = onQueryChange
    ? [...options]
    : filterByQuery(options, query, (option) => option.label)
  const optionId = (index: number) => `${control.id}-opcja-${index}`
  const browsing = browseOnFocus && query.trim().length === 0 && results.length > 0
  const expanded = open && (query.trim().length > 0 || browsing)

  function choose(option: ComboboxOption) {
    onValueChange(option)
    setQuery(option.label)
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setOpen(true)
        setActive((index) => Math.min(index + 1, results.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((index) => Math.max(index - 1, 0))
        break
      case 'Enter': {
        const option = expanded ? results[active] : undefined
        if (option) {
          event.preventDefault()
          choose(option)
        }
        break
      }
      case 'Escape':
        if (expanded) setOpen(false)
        else {
          setQuery('')
          onValueChange(null)
        }
        break
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Icon
        icon={Search}
        className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <input
        {...control}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActive(0)
          onQueryChange?.(event.target.value)
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (browseOnFocus) setOpen(true)
        }}
        onBlur={() => {
          setOpen(false)
          // Wartość tylko z listy: tekst bez wyboru wraca do wybranej pozycji.
          setQuery(value?.label ?? '')
        }}
        className={cn(fieldClasses, 'h-12 ps-11 pe-11')}
      />
      {loading && (
        <Icon
          icon={LoaderCircle}
          className="absolute end-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-text-muted"
        />
      )}
      {name && <input type="hidden" name={name} value={value?.value ?? ''} />}
      <ul
        id={listId}
        role="listbox"
        aria-label={label}
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-control border border-line bg-surface-1 p-1 shadow-float"
      >
        {/* Opcje tylko przy rozwiniętej liście – bez kilkudziesięciu ukrytych pozycji w HTML strony. */}
        {expanded &&
          results.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === active}
              // mousedown zamiast click: pole nie traci fokusu przed wyborem.
              onMouseDown={(event) => {
                event.preventDefault()
                choose(option)
              }}
              onMouseMove={() => setActive(index)}
              className={cn(
                'flex min-h-11 cursor-pointer flex-col justify-center rounded-badge px-3 py-2',
                index === active && 'bg-surface-2',
              )}
            >
              <span>{option.label}</span>
              {option.description && (
                <span className="text-small text-text-muted">{option.description}</span>
              )}
            </li>
          ))}
        {expanded && !loading && results.length === 0 && (
          <li role="presentation" className="px-3 py-3 text-small text-text-muted">
            Brak wyników dla „{query.trim()}”
          </li>
        )}
      </ul>
      <p className="sr-only" aria-live="polite">
        {expanded && !loading ? `Podpowiedzi: ${results.length}` : ''}
      </p>
    </div>
  )
}
