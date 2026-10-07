import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

// „Wszystkie wartości wyłącznie z tokenów” (CLAUDE.md, DESIGN.md): kolory i wymiary pochodzą z @theme
// w globals.css. Skan blokuje arbitralne klasy Tailwinda i kolory wpisane wprost w komponentach.
const SRC = join(import.meta.dirname, '../..')
// kierunki: próby poza systemem tokenów – po wyborze kolory trafią do globals.css.
const SKIPPED_DIRS = ['app/(payload)', 'app/(frontend)/kierunki', 'migrations', 'tests']
const SKIPPED_FILES = [
  'app/(frontend)/globals.css', // definicje tokenów
  'payload-types.ts', // generowany
  'lib/theme/index.ts', // meta theme-color wymaga literału; wartości = token bg obu motywów
]

const RULES = [
  { name: 'arbitralna klasa Tailwinda', pattern: /[\w-]+-\[[^\]\n]*\](?!:)/g },
  { name: 'kolor hex', pattern: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'kolor funkcją', pattern: /\b(?:rgba?|hsla?|oklch)\(/g },
]

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    const rel = relative(SRC, path)
    if (entry.isDirectory()) return SKIPPED_DIRS.includes(rel) ? [] : sourceFiles(path)
    return /\.(tsx?|css)$/.test(entry.name) && !SKIPPED_FILES.includes(rel) ? [rel] : []
  })
}

describe('tokeny', () => {
  it('komponenty i style używają tylko tokenów', () => {
    const violations = sourceFiles(SRC).flatMap((file) =>
      readFileSync(join(SRC, file), 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          RULES.flatMap(({ name, pattern }) =>
            [...line.matchAll(pattern)].map((match) => `${file}:${index + 1} ${name}: ${match[0]}`),
          ),
        ),
    )
    expect(violations).toEqual([])
  })
})
