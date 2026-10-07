import { describe, expect, it } from 'vitest'

import { readTheme, themeAttribute, themeSchema } from '../../lib/theme'

describe('motyw', () => {
  it('domyślnie jasny, także przy nieznanej wartości ciasteczka (ADR 0020)', () => {
    expect(readTheme(undefined)).toBe('jasny')
    expect(readTheme('fioletowy')).toBe('jasny')
    expect(readTheme('ciemny')).toBe('ciemny')
  })

  it('ciemny motyw włącza atrybut data-theme', () => {
    expect(themeAttribute('ciemny')).toBe('dark')
    expect(themeAttribute('jasny')).toBeUndefined()
  })

  it('akcja przyjmuje tylko znane motywy', () => {
    expect(themeSchema.safeParse('jasny').success).toBe(true)
    expect(themeSchema.safeParse('<script>').success).toBe(false)
  })
})
