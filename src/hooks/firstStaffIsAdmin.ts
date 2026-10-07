import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Pierwsze konto personelu (ekran „utwórz pierwszego użytkownika” w /admin) zawsze jest
 * administratorem – inaczej domyślna rola „redaktor” zostawiłaby serwis bez nikogo, kto zatwierdza firmy.
 */
export const firstStaffIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const { totalDocs } = await req.payload.count({ collection: 'staff', overrideAccess: true, req })
  return totalDocs === 0 ? { ...data, role: 'admin' } : data
}
