'use client'

import { useEffect, useRef, useState } from 'react'

import type { ComboboxOption } from '@/components/ui/Combobox'

import { suggestLocalitiesAction } from '../../../app/(frontend)/(serwis)/actions'

/**
 * Podpowiedzi miejscowości z serwera (TERYT, literówki) z opóźnieniem 200 ms po wpisaniu.
 * Puste pole pokazuje `defaults` – listę miast województwa – żeby można było wybrać bez pisania.
 */
export function useLocalitySuggestions(
  initial: ComboboxOption | null = null,
  defaults: readonly ComboboxOption[] = [],
) {
  const start = initial
    ? [initial, ...defaults.filter((item) => item.value !== initial.value)]
    : [...defaults]
  const [places, setPlaces] = useState<ComboboxOption[]>(start)
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const search = (query: string) => {
    clearTimeout(timer.current)
    if (query.trim().length < 2) return setPlaces([...defaults])
    setLoading(true)
    timer.current = setTimeout(() => {
      void suggestLocalitiesAction(query).then((found) => {
        setPlaces(found)
        setLoading(false)
      })
    }, 200)
  }

  return { places, loading, search }
}
