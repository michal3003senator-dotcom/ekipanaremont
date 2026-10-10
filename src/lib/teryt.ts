/** Wiersz słownika `data/teryt-lodzkie.json` (TERC i SIMC). */
export type TerytRow = {
  terytId: string
  name: string
  type: 'wojewodztwo' | 'powiat' | 'gmina' | 'miejscowosc' | 'dzielnica'
  parent: string | null
}

/**
 * Miasta: miejscowość o nazwie swojej gminy miejskiej (rodzaj 1) albo miejsko-wiejskiej (3).
 * Tak TERYT zapisuje miasta będące siedzibami gmin – w łódzkim 60 miast (stan 2026).
 */
export function townIds(rows: readonly TerytRow[]): Set<string> {
  const urbanGminy = new Map(
    rows
      .filter((row) => row.type === 'gmina' && /[13]$/.test(row.terytId))
      .map((row) => [row.terytId, row.name]),
  )
  return new Set(
    rows
      .filter(
        (row) =>
          row.type === 'miejscowosc' &&
          row.parent !== null &&
          urbanGminy.get(row.parent) === row.name,
      )
      .map((row) => row.terytId),
  )
}
