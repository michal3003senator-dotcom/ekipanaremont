export type PageItem = number | 'gap'

/**
 * Numery stron z wielokropkami: zawsze pierwsza, ostatnia i sąsiedzi bieżącej,
 * np. strona 6 z 20 → 1 … 5 6 7 … 20.
 */
export function paginationRange(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const pages = new Set([1, total, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page))
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page))

  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1]
    return previous !== undefined && page - previous > 1 ? ['gap' as const, page] : [page]
  })
}
