import { describe, expect, it } from 'vitest'

import { cn } from '../../lib/cn'

describe('cn', () => {
  it('nie myli rozmiaru tekstu z kolorem tekstu', () => {
    expect(cn('text-micro text-text-muted')).toBe('text-micro text-text-muted')
    expect(cn('text-small font-data text-text')).toBe('text-small font-data text-text')
  })

  it('późniejsza klasa z tej samej grupy wygrywa', () => {
    expect(cn('text-small', 'text-micro')).toBe('text-micro')
    expect(cn('bg-surface-1', 'bg-accent')).toBe('bg-accent')
    expect(cn('rounded-card', 'rounded-control')).toBe('rounded-control')
    expect(cn('text-text', 'text-accent-soft')).toBe('text-accent-soft')
  })

  it('pomija puste wartości', () => {
    expect(cn('px-4', false, undefined, null, 'py-2')).toBe('px-4 py-2')
  })
})
