'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/** W trybie podglądu odświeża stronę po każdym zapisie w panelu (komunikat z ramki /admin). */
export function LivePreviewRefresh() {
  const router = useRouter()
  // Adres panelu = adres serwisu, z którego wczytano stronę (także za proxy, np. Codespaces).
  const origin = useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => '',
  )
  if (!origin) return null
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={origin} />
}
