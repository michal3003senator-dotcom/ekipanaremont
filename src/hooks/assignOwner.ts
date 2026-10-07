import type { CollectionBeforeValidateHook } from 'payload'

import { firmIdOf, isFirmUser, isStaffUser } from '@/access'

/** Konto firmowe zawsze zapisuje rekordy na swoją firmę – nie da się podać cudzej (SPEC 2). */
export const assignOwnFirm =
  (field = 'firm'): CollectionBeforeValidateHook =>
  ({ data, req: { user } }) => {
    const firm = firmIdOf(user)
    return firm && data ? { ...data, [field]: firm } : data
  }

/** Autor wpisu to zawsze zalogowane konto; `polymorphic` – firma albo personel (forum). */
export const assignAuthor =
  (field = 'author', { polymorphic = false } = {}): CollectionBeforeValidateHook =>
  ({ data, operation, req: { user } }) => {
    if (operation !== 'create' || !user || !data) return data
    if (polymorphic && (isFirmUser(user) || isStaffUser(user))) {
      return { ...data, [field]: { relationTo: user.collection, value: user.id } }
    }
    return isFirmUser(user) ? { ...data, [field]: user.id } : data
  }
