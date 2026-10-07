/** Publiczny adres dokumentu z CMS (linki w treści, podgląd na żywo, mapa strony). */
export function contentPath(collection: string | undefined, slug: string | null | undefined) {
  if (!slug) return null
  switch (collection) {
    case 'articles':
      return `/artykuly/${slug}`
    case 'articleCategories':
      return `/artykuly/kategoria/${slug}`
    case 'calculators':
      return `/kalkulatory/${slug}`
    case 'pages':
      return `/${slug}`
    default:
      return null
  }
}

/** Ścieżka w serwisie (bez `//` i schematów) – przekierowanie z `/podglad` nie wyjdzie poza domenę. */
export const SAFE_PATH = /^\/(?!\/)[\w\-/]*$/
