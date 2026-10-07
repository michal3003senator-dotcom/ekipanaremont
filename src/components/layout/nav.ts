export type NavLink = { href: string; label: string }

export const SITE_NAV: readonly NavLink[] = [
  { href: '/szukaj', label: 'Szukaj firm' },
  // Poradnik i Kalkulatory dokłada siteNav(), gdy są opublikowane treści.
  { href: '/rejestracja', label: 'Dla firm' },
]

export const LEGAL_NAV: readonly NavLink[] = [
  { href: '/regulamin', label: 'Regulamin' },
  { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
  { href: '/jak-sprawdzamy-opinie', label: 'Jak sprawdzamy opinie' },
  { href: '/zasady-moderacji', label: 'Zasady moderacji' },
  { href: '/kontakt', label: 'Kontakt' },
  { href: '/o-nas', label: 'O nas' },
]
