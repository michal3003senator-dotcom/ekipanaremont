import { draftMode } from 'next/headers'

import { getEditorialStaff } from '@/lib/auth/session'

import type { ContentReader } from './articles'

/**
 * Szkic tylko w trybie podglądu i tylko dla redakcji z 2FA (ADR 0023) – samo ciasteczko
 * trybu podglądu nie wystarcza; każde żądanie sprawdza sesję.
 */
export async function contentReader(): Promise<ContentReader> {
  if (!(await draftMode()).isEnabled) return { draft: false }
  const user = await getEditorialStaff()
  return user ? { draft: true, user } : { draft: false }
}
