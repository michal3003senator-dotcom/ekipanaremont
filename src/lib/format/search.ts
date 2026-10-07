/** Tekst do porównań bez wielkości liter i polskich znaków: „Łódź” → „lodz” (TERYT, podpowiedzi). */
export function normalizeSearch(text: string): string {
  return text
    .toLocaleLowerCase('pl-PL')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Filtruje podpowiedzi po fragmencie tekstu; dopasowania od początku są pierwsze. */
export function filterByQuery<T>(
  items: readonly T[],
  query: string,
  text: (item: T) => string,
): T[] {
  const needle = normalizeSearch(query)
  if (!needle) return [...items]
  const scored = items.flatMap((item) => {
    const position = normalizeSearch(text(item)).indexOf(needle)
    return position === -1 ? [] : [{ item, position }]
  })
  return scored.sort((a, b) => a.position - b.position).map(({ item }) => item)
}
