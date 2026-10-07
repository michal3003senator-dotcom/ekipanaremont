import { describe, expect, it } from 'vitest'

import { fitWithin, mediaSrc } from '../../lib/images'

describe('mediaSrc', () => {
  it('pliki Payload jako ścieżka względna – niezależnie od adresu serwera', () => {
    expect(mediaSrc('http://localhost:3000/api/media/file/a-960x640.webp')).toBe(
      '/api/media/file/a-960x640.webp',
    )
    expect(mediaSrc('https://robot-3000.app.github.dev/api/media/file/b.webp')).toBe(
      '/api/media/file/b.webp',
    )
  })

  it('inne adresy bez zmian, brak adresu → undefined', () => {
    expect(mediaSrc('/api/media/file/c.webp')).toBe('/api/media/file/c.webp')
    expect(mediaSrc('https://cdn.example.com/x.webp')).toBe('https://cdn.example.com/x.webp')
    expect(mediaSrc(null)).toBeUndefined()
  })
})

describe('fitWithin', () => {
  it('zmniejsza po dłuższym boku, bez powiększania', () => {
    expect(fitWithin(4800, 3200)).toEqual({ width: 2400, height: 1600 })
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 })
  })
})
