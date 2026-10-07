/**
 * Buduje słownik miejscowości województwa łódzkiego (`data/teryt-lodzkie.json`) z plików GUS i GUGiK.
 * Wynik jest w repozytorium, więc import do bazy (`pnpm seed`) nie potrzebuje tych plików.
 *
 * Pliki źródłowe (otwarte dane):
 * - TERC i SIMC, wersja „Urzędowy”, CSV: eteryt.stat.gov.pl → Pobieranie → Pliki pełne,
 * - PRNG miejscowości, GML: https://opendata.geoportal.gov.pl/prng/PRNG_MIEJSCOWOSCI_GML.zip
 *
 * Zakres (PLAN pyt. 7–8): powiaty, gminy, miasta i wsie (bez części miejscowości, kolonii, przysiółków,
 * osad) oraz 5 dzielnic Łodzi. Współrzędne z PRNG po identyfikatorze SIMC.
 *
 * Użycie: node scripts/teryt/build.ts <TERC.csv> <SIMC.csv> <PRNG.xml>
 */
import { createReadStream, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'

import { slugify } from '../../src/lib/validation/slug.ts'

const WOJ = '10'
const OUTPUT = 'data/teryt-lodzkie.json'

type LocalityType = 'wojewodztwo' | 'powiat' | 'gmina' | 'miejscowosc' | 'dzielnica'
type Entry = {
  terytId: string
  name: string
  type: LocalityType
  parent: string | null
  slug: string
  lat: number | null
  lng: number | null
}

const GMINA_KIND: Record<string, string> = {
  '1': 'miejska',
  '2': 'wiejska',
  '3': 'miejsko-wiejska',
}
const CITY = '96'
const VILLAGE = '01'
const DISTRICT = '98'

function readCsv(path: string): Record<string, string>[] {
  const [header, ...rows] = readFileSync(path, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/)
  const keys = header!.split(';')
  return rows
    .map((row) => row.split(';'))
    .filter((cells) => cells[0] === WOJ)
    .map((cells) => Object.fromEntries(keys.map((key, index) => [key, cells[index] ?? ''])))
}

/** Współrzędne punktu głównego miejscowości z PRNG (strumieniowo – plik ma ok. 300 MB). */
async function readCoordinates(path: string): Promise<Map<string, [number, number]>> {
  const coordinates = new Map<string, [number, number]>()
  let id: string | null = null
  let point: [number, number] | null = null
  let lodzkie = false
  for await (const line of createInterface({ input: createReadStream(path, 'utf8') })) {
    if (line.includes('<rng:NG_NazwaGeograficznaRP')) {
      id = null
      point = null
      lodzkie = false
    } else if (line.includes('<rng:identyfikatorZewnetrzny>')) {
      id = /<rng:identyfikatorZewnetrzny>(\d{7})</.exec(line)?.[1] ?? null
    } else if (line.includes('<rng:wojewodztwo>łódzkie<')) {
      lodzkie = true
    } else if (line.includes('<rng:wspolrzedneGeograficzne')) {
      const match = />([\d.]+) ([\d.]+)</.exec(line)
      if (match) point = [Number(match[1]), Number(match[2])]
    } else if (line.includes('</rng:NG_NazwaGeograficznaRP>') && lodzkie && id && point) {
      coordinates.set(id, point)
    }
  }
  return coordinates
}

const round = (value: number) => Math.round(value * 1e5) / 1e5

async function main() {
  const [tercPath, simcPath, prngPath] = process.argv.slice(2)
  if (!tercPath || !simcPath || !prngPath)
    throw new Error('Podaj ścieżki: TERC.csv SIMC.csv PRNG.xml')

  const terc = readCsv(tercPath)
  const simc = readCsv(simcPath)
  const coordinates = await readCoordinates(prngPath)
  const entries: Entry[] = [
    {
      terytId: `terc:${WOJ}`,
      name: 'łódzkie',
      type: 'wojewodztwo',
      parent: null,
      slug: 'wojewodztwo-lodzkie',
      lat: null,
      lng: null,
    },
  ]

  for (const row of terc.filter((r) => r.POW && !r.GMI)) {
    entries.push({
      terytId: `terc:${WOJ}${row.POW}`,
      name: row.NAZWA!,
      type: 'powiat',
      parent: `terc:${WOJ}`,
      slug: `powiat-${slugify(row.NAZWA!)}`,
      lat: null,
      lng: null,
    })
  }

  const gminy = terc.filter((r) => r.GMI && GMINA_KIND[r.RODZ!])
  const gminaNames = new Map<string, number>()
  for (const row of gminy) gminaNames.set(row.NAZWA!, (gminaNames.get(row.NAZWA!) ?? 0) + 1)
  const gminaById = new Map<string, string>()
  for (const row of gminy) {
    const terytId = `terc:${WOJ}${row.POW}${row.GMI}${row.RODZ}`
    const unique = gminaNames.get(row.NAZWA!) === 1
    gminaById.set(terytId, row.NAZWA!)
    entries.push({
      terytId,
      name: row.NAZWA!,
      type: 'gmina',
      parent: `terc:${WOJ}${row.POW}`,
      slug: `gmina-${slugify(row.NAZWA!)}${unique ? '' : `-${GMINA_KIND[row.RODZ!]}`}`,
      lat: null,
      lng: null,
    })
  }

  /** Miasto lub obszar wiejski gminy miejsko-wiejskiej (4, 5) należy do gminy rodzaju 3. */
  const gminaOf = (row: Record<string, string>) =>
    `terc:${WOJ}${row.POW}${row.GMI}${row.RODZ_GMI === '4' || row.RODZ_GMI === '5' ? '3' : row.RODZ_GMI}`

  const places = simc.filter((r) => (r.RM === CITY || r.RM === VILLAGE) && r.SYM === r.SYMPOD)
  const nameCount = new Map<string, number>()
  for (const row of places)
    nameCount.set(slugify(row.NAZWA!), (nameCount.get(slugify(row.NAZWA!)) ?? 0) + 1)
  const cities = new Set(places.filter((r) => r.RM === CITY).map((r) => slugify(r.NAZWA!)))

  const used = new Set(entries.map((entry) => entry.slug))
  const placeSlug = (row: Record<string, string>) => {
    const base = slugify(row.NAZWA!)
    const isCity = row.RM === CITY
    let slug =
      isCity || (nameCount.get(base) === 1 && !cities.has(base))
        ? base
        : `${base}-${slugify(gminaById.get(gminaOf(row)) ?? '')}`
    if (used.has(slug)) slug = `${slug}-${row.SYM}`
    used.add(slug)
    return slug
  }

  // Najpierw miasta: zajmują krótkie adresy (np. /glazurnik/lodz).
  for (const row of [...places].sort((a, b) => Number(b.RM === CITY) - Number(a.RM === CITY))) {
    const parent = gminaOf(row)
    if (!gminaById.has(parent))
      throw new Error(`Brak gminy ${parent} dla ${row.NAZWA} (${row.SYM})`)
    const point = coordinates.get(row.SYM!)
    entries.push({
      terytId: `simc:${row.SYM}`,
      name: row.NAZWA!,
      type: 'miejscowosc',
      parent,
      slug: placeSlug(row),
      lat: point ? round(point[0]) : null,
      lng: point ? round(point[1]) : null,
    })
  }

  const lodz = places.find((r) => r.RM === CITY && r.NAZWA === 'Łódź')
  if (!lodz) throw new Error('Brak Łodzi w SIMC')
  for (const row of simc.filter((r) => r.RM === DISTRICT)) {
    const name = row.NAZWA!.replace(/^Łódź-/, '')
    const point = coordinates.get(row.SYM!)
    entries.push({
      terytId: `simc:${row.SYM}`,
      name,
      type: 'dzielnica',
      parent: `simc:${lodz.SYM}`,
      slug: `lodz-${slugify(name)}`,
      lat: point ? round(point[0]) : null,
      lng: point ? round(point[1]) : null,
    })
  }

  // Jeden rekord w wierszu: czytelne różnice w git przy aktualizacji TERYT.
  writeFileSync(OUTPUT, `[\n${entries.map((entry) => JSON.stringify(entry)).join(',\n')}\n]\n`)
  const count = (type: LocalityType) => entries.filter((entry) => entry.type === type).length
  const missing = entries.filter(
    (entry) => (entry.type === 'miejscowosc' || entry.type === 'dzielnica') && entry.lat === null,
  )
  process.stdout.write(
    `${OUTPUT}: powiaty ${count('powiat')}, gminy ${count('gmina')}, miejscowości ${count('miejscowosc')}, dzielnice ${count('dzielnica')}; bez współrzędnych: ${missing.length}\n`,
  )
}

await main()
