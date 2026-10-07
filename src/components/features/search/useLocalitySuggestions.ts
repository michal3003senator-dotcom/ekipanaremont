'use client'

import { useEffect, useRef, useState } from 'react'

import type { ComboboxOption } from '@/components/ui/Combobox'

import { suggestLocalitiesAction } from '../../../app/(frontend)/(serwis)/actions'

/** Podpowiedzi miejscowości z serwera (TERYT, literówki) z opóźnieniem 200 ms po wpisaniu. */
export function useLocalitySuggestions(initial: ComboboxOption | null = null) {
  const [places, setPlaces] = useState<ComboboxOption[]>(initial ? [initial] : [])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const search = (query: string) => {
    clearTimeout(timer.current)
    if (query.trim().length < 2) return setPlaces([])
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
