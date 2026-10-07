/** Ciasteczko z wyborem motywu (wartości po polsku, jak w adresach). */
export const THEME_COOKIE = 'motyw'

// Bez Zod: moduł trafia do przeglądarki (przełącznik motywu), schemat Zod jest w akcji serwerowej.
export const THEMES = ['ciemny', 'jasny'] as const
export type Theme = (typeof THEMES)[number]

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value)

/** Jasny motyw jest domyślny (ADR 0020); nieznana wartość ciasteczka też daje jasny. */
export const readTheme = (value: string | undefined): Theme => (isTheme(value) ? value : 'jasny')

/** Wartość atrybutu `data-theme` – ciemny motyw włączają tokeny w globals.css. */
export const themeAttribute = (theme: Theme) => (theme === 'ciemny' ? 'dark' : undefined)

/** Kolor paska przeglądarki na telefonie = token `bg` danego motywu. */
export const themeColor = (theme: Theme) => (theme === 'jasny' ? '#f7f7f4' : '#0b0910')
