import { z } from 'zod'

/** Ciasteczko z wyborem motywu (wartości po polsku, jak w adresach). */
export const THEME_COOKIE = 'motyw'

export const themeSchema = z.enum(['ciemny', 'jasny'])
export type Theme = z.infer<typeof themeSchema>

/** Jasny motyw jest domyślny (ADR 0020); nieznana wartość ciasteczka też daje jasny. */
export function readTheme(value: string | undefined): Theme {
  const result = themeSchema.safeParse(value)
  return result.success ? result.data : 'jasny'
}

/** Wartość atrybutu `data-theme` – ciemny motyw włączają tokeny w globals.css. */
export const themeAttribute = (theme: Theme) => (theme === 'ciemny' ? 'dark' : undefined)

/** Kolor paska przeglądarki na telefonie = token `bg` danego motywu. */
export const themeColor = (theme: Theme) => (theme === 'jasny' ? '#f7f7f4' : '#0b0910')
