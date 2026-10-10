import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

/**
 * Reguły dostępu według tabeli ról (SPEC 2). Domyślnie brak dostępu.
 * Personel zawsze z weryfikacją TOTP: bez kodu w tej sesji – brak dostępu (CLAUDE.md, ADR 0016).
 * Sprawdzamy to sami (`_strategy === 'totp'`), bo wrapper wtyczki odcina też publiczny odczyt gości.
 */
export type StaffRole = 'admin' | 'moderator' | 'editor'

type AnyUser = PayloadRequest['user']

export const idOf = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id
  return null
}

const roleOf = (user: AnyUser): StaffRole | null =>
  user?.collection === 'staff' ? user.role : null

export const isStaffUser = (user: AnyUser, ...roles: StaffRole[]): boolean => {
  const role = roleOf(user)
  return role !== null && (roles.length === 0 || roles.includes(role))
}

/** Personel po weryfikacji kodu TOTP w tej sesji. Kluczy API nie włączamy, więc innej drogi nie ma. */
export const isVerifiedStaff = (user: AnyUser, ...roles: StaffRole[]): boolean =>
  // Payload ustawia `_strategy` w czasie działania, ale nie ma go w typie użytkownika.
  isStaffUser(user, ...roles) && (user as { _strategy?: string } | null)?._strategy === 'totp'

export const isFirmUser = (user: AnyUser): boolean => user?.collection === 'firmAccounts'

/** ID firmy zalogowanego konta firmowego albo null. */
export const firmIdOf = (user: AnyUser): string | null =>
  user?.collection === 'firmAccounts' ? idOf(user.firm) : null

export const nobody: Access = () => false
export const anyone: Access = () => true

/** Personel w podanych rolach (pusta lista = każda rola), zawsze po weryfikacji TOTP. */
export const staff =
  (...roles: StaffRole[]): Access =>
  ({ req: { user } }) =>
    isVerifiedStaff(user, ...roles)

export const admin = staff('admin')
export const moderation = staff('admin', 'moderator')
export const editorial = staff('admin', 'editor')

/** Konto firmowe – tylko rekordy własnej firmy (pole relacji `field`). */
export const ownFirm =
  (field = 'firm'): Access =>
  ({ req: { user } }) => {
    const firm = firmIdOf(user)
    return firm ? { [field]: { equals: firm } } : false
  }

/** Treść firmy widoczna publicznie tylko przy aktywnym profilu (ukrycie przez moderatora działa też w REST). */
export const ACTIVE_FIRM: Where = { 'firm.status': { equals: 'active' } }

/** Stały warunek zapytania, np. publicznie tylko opublikowane. */
export const where =
  (constraint: Where): Access =>
  () =>
    constraint

/** Suma reguł: `true` wygrywa od razu, warunki zapytania łączymy przez `or`. */
export const either =
  (...rules: Access[]): Access =>
  async (args) => {
    const constraints: Where[] = []
    for (const rule of rules) {
      const result = await rule(args)
      if (result === true) return true
      if (result) constraints.push(result)
    }
    if (constraints.length === 0) return false
    return constraints.length === 1 ? constraints[0]! : { or: constraints }
  }

/** Iloczyn reguł: każda musi coś przyznać, warunki zapytania łączymy przez `and`. */
export const all =
  (...rules: Access[]): Access =>
  async (args) => {
    const constraints: Where[] = []
    for (const rule of rules) {
      const result = await rule(args)
      if (!result) return false
      if (result !== true) constraints.push(result)
    }
    if (constraints.length === 0) return true
    return constraints.length === 1 ? constraints[0]! : { and: constraints }
  }

/** Rekordy, których autorem jest zalogowane konto firmowe. */
export const ownAccount =
  (field: string): Access =>
  ({ req: { user } }) =>
    isFirmUser(user) && user ? { [field]: { equals: user.id } } : false

/** Dowolne zalogowane konto firmowe (dalsze ograniczenia w hookach i warunkach). */
export const firmAccount: Access = ({ req: { user } }) => isFirmUser(user)

/** Dostęp do pola: true, gdy którykolwiek warunek pasuje do użytkownika. */
export const fieldFor =
  (...checks: Array<(user: AnyUser) => boolean>): FieldAccess =>
  ({ req: { user } }) =>
    checks.some((check) => check(user))

export const verifiedAdmin = (user: AnyUser) => isVerifiedStaff(user, 'admin')
export const verifiedModeration = (user: AnyUser) => isVerifiedStaff(user, 'admin', 'moderator')
