'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

import { THEME_COOKIE, THEMES } from '.'

const themeSchema = z.enum(THEMES)

const ONE_YEAR_S = 60 * 60 * 24 * 365

/** Zapisuje wybór motywu (wejście walidowane po stronie serwera). */
export async function setTheme(input: unknown): Promise<void> {
  const theme = themeSchema.parse(input)
  const store = await cookies()
  store.set(THEME_COOKIE, theme, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR_S,
  })
}
