import { describe, expect, it } from 'vitest'

import { isTheme, readTheme, themeAttribute } from '../../lib/theme'

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

  it('tylko znane motywy', () => {
    expect(isTheme('jasny')).toBe(true)
    expect(isTheme('<script>')).toBe(false)
  })
})
