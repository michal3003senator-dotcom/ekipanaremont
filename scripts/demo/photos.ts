/**
 * Zdjęcia do danych przykładowych (tylko lokalnie): wybrane ręcznie z Pexels (licencja Pexels –
 * bezpłatne użycie, bez wymogu podpisu). Pobierane przy `pnpm seed demo` do `.cache/demo-photos`.
 * Na produkcji realizacje firm to wyłącznie ich własne zdjęcia (DESIGN §7).
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type PhotoKind =
  | 'bathroom'
  | 'tiles'
  | 'painting'
  | 'plaster'
  | 'drywall'
  | 'kitchen'
  | 'floor'
  | 'electrical'
  | 'plumbing'
  | 'windows'
  | 'carpentry'
  | 'roof'
  | 'facade'
  | 'brick'
  | 'renovation'

const BATHROOM = [
  8082194, 16113325, 7534184, 8089093, 2988865, 6436787, 7005268, 7031878, 19227243, 19846350,
  6430748, 11076068,
]

/** Id zdjęć Pexels według rodzaju prac. */
export const PHOTO_POOL: Record<PhotoKind, readonly number[]> = {
  bathroom: BATHROOM,
  tiles: [7794427, 19846350, 11076068, 7534184, 2988865, 8089093, 6436787, 7005268],
  painting: [
    5583116, 7509752, 5799084, 7218004, 7218007, 7218014, 7218016, 6474346, 6474344, 6474339,
    6474465, 6474450, 5691630, 5691624, 5493658, 5799043, 5691592,
  ],
  plaster: [6474343, 5493652, 6474471, 5691586, 5691613, 5691594, 5691601, 5691625, 5691482],
  drywall: [5493663, 5493675, 5493677, 5493664, 5493661, 6474343],
  kitchen: [1080721, 3623785, 4221389, 6283970, 6301168],
  floor: [6364752, 7027720, 8583697, 5691493, 5691495],
  electrical: [5691583, 5691633, 14319099, 5691590, 5691588, 5691642, 5691487],
  plumbing: [6419128, 6419127, 6419126],
  windows: [
    5691531, 5691544, 5691550, 5691499, 5691501, 5691503, 5691515, 5691559, 5691534, 6124242,
    8293699, 5768107,
  ],
  carpentry: [5973984, 5974413, 27520661, 6790078, 5691552, 5691541, 5691502, 5691518, 5691555],
  roof: [5503983, 33404248, 33404981, 7788259, 7788266, 7788264, 15321060, 8482681],
  facade: [11435856, 35172803, 2209529, 6124239, 5503983],
  brick: [11429199, 16468074, 15798781, 10410009],
  renovation: [
    804392, 15798784, 15798781, 5691494, 5691495, 5691510, 6474457, 6474459, 6474469, 6474478,
    5691496,
  ],
}

/** Rodzaj zdjęć dla usługi (okładki artykułów, realizacje bez wskazanego rodzaju). */
export const SERVICE_PHOTO_KIND: Record<string, PhotoKind> = {
  'remont-mieszkania': 'renovation',
  'remont-lazienki': 'bathroom',
  glazurnik: 'tiles',
  malarz: 'painting',
  tynkarz: 'plaster',
  'sucha-zabudowa': 'drywall',
  posadzki: 'floor',
  podlogi: 'floor',
  hydraulik: 'plumbing',
  elektryk: 'electrical',
  stolarz: 'carpentry',
  'okna-i-drzwi': 'windows',
  elewacje: 'facade',
  dekarz: 'roof',
  murarz: 'brick',
}

const CACHE_DIR = path.resolve('.cache/demo-photos')

/** Plik zdjęcia (pobiera raz, potem z pamięci podręcznej); `null`, gdy brak sieci. */
export async function photoFile(id: number) {
  const file = path.join(CACHE_DIR, `${id}.jpg`)
  if (!existsSync(file)) {
    const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`
    const response = await fetch(url).catch(() => null)
    if (!response?.ok) return null
    await mkdir(CACHE_DIR, { recursive: true })
    await writeFile(file, Buffer.from(await response.arrayBuffer()))
  }
  const data = await readFile(file)
  return { data, mimetype: 'image/jpeg', name: `realizacja-${id}.jpg`, size: data.length }
}

/** Kolejne zdjęcia danego rodzaju – rotacja, żeby sąsiednie firmy nie miały tych samych. */
export function photoPicker() {
  const cursor = new Map<PhotoKind, number>()
  return (kind: PhotoKind, count: number): number[] => {
    const pool = PHOTO_POOL[kind]
    const start = cursor.get(kind) ?? 0
    cursor.set(kind, start + count)
    return Array.from(
      { length: Math.min(count, pool.length) },
      (_, i) => pool[(start + i) % pool.length]!,
    )
  }
}
