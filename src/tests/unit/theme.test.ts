import { describe, expect, it } from 'vitest'

import { readTheme, themeAttribute, themeSchema } from '../../lib/theme'

describe('motyw', () => {
  it('domyślnie ciemny, także przy nieznanej wartości ciasteczka', () => {
    expect(readTheme(undefined)).toBe('ciemny')
    expect(readTheme('fioletowy')).toBe('ciemny')
    expect(readTheme('jasny')).toBe('jasny')
  })

  it('jasny motyw włącza atrybut data-theme', () => {
    expect(themeAttribute('jasny')).toBe('light')
    expect(themeAttribute('ciemny')).toBeUndefined()
  })

  it('akcja przyjmuje tylko znane motywy', () => {
    expect(themeSchema.safeParse('jasny').success).toBe(true)
    expect(themeSchema.safeParse('<script>').success).toBe(false)
  })
})
