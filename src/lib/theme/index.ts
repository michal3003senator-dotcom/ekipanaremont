import { z } from 'zod'

/** Ciasteczko z wyborem motywu (wartości po polsku, jak w adresach). */
export const THEME_COOKIE = 'motyw'

export const themeSchema = z.enum(['ciemny', 'jasny'])
export type Theme = z.infer<typeof themeSchema>

/** Ciemny motyw jest domyślny (DESIGN §3); nieznana wartość ciasteczka też daje ciemny. */
export function readTheme(value: string | undefined): Theme {
  const result = themeSchema.safeParse(value)
  return result.success ? result.data : 'ciemny'
}

/** Wartość atrybutu `data-theme` – jasny motyw włączają tokeny w globals.css. */
export const themeAttribute = (theme: Theme) => (theme === 'jasny' ? 'light' : undefined)

/** Kolor paska przeglądarki na telefonie = token `bg` danego motywu. */
export const themeColor = (theme: Theme) => (theme === 'jasny' ? '#f6f5f9' : '#0b0910')
