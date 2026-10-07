type EnvSource = Readonly<Record<string, string | undefined>>

/** Wdrożenie produkcyjne na Vercel. Lokalnie, w CI i na stagingu zwraca false (ADR 0012). */
export function isProductionDeployment(env: EnvSource = process.env): boolean {
  return env.VERCEL_ENV === 'production'
}
