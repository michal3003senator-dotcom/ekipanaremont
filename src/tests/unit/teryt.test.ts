import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { type TerytRow, townIds } from '../../lib/teryt'

const rows = JSON.parse(readFileSync('data/teryt-lodzkie.json', 'utf8')) as TerytRow[]

describe('miasta z TERYT', () => {
  it('rozpoznaje wszystkie 60 miast województwa łódzkiego, bez wsi o tej samej nazwie co gmina wiejska', () => {
    const towns = rows.filter((row) => townIds(rows).has(row.terytId)).map((row) => row.name)
    expect(towns).toHaveLength(60)
    for (const name of ['Łódź', 'Piotrków Trybunalski', 'Bełchatów', 'Kutno', 'Wolbórz', 'Żarnów'])
      expect(towns).toContain(name)
    // Gmina wiejska Bełchatów nie robi z żadnej wsi miasta.
    expect(new Set(towns).size).toBe(60)
  })
})
