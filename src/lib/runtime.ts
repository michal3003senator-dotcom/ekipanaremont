type EnvSource = Readonly<Record<string, string | undefined>>

/** Wdrożenie produkcyjne na Vercel. Lokalnie, w CI i na stagingu zwraca false (ADR 0012). */
export function isProductionDeployment(env: EnvSource = process.env): boolean {
  return env.VERCEL_ENV === 'production'
}

/**
 * GitHub Codespaces: publiczny adres przekierowanego portu (proxy podaje serwerowi Host localhost).
 * Poza Codespaces undefined.
 */
export function codespaceUrl(env: EnvSource = process.env, port = 3000): string | undefined {
  const { CODESPACE_NAME: name, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: domain } = env
  return name && domain ? `https://${name}-${port}.${domain}` : undefined
}

/** W Codespaces adres serwisu z localhost zamieniamy na adres portu – bez ręcznej konfiguracji. */
export function withCodespaceUrl(env: EnvSource = process.env): EnvSource {
  const url = codespaceUrl(env)
  const current = env.NEXT_PUBLIC_SERVER_URL
  const isLocal = !current || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(current)
  return url && isLocal ? { ...env, NEXT_PUBLIC_SERVER_URL: url } : env
}
