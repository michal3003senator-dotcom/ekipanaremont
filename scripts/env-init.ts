/**
 * Tworzy `.env.local` z `.env.example` i uzupełnia puste sekrety losowymi wartościami.
 * Istniejących sekretów nie zmienia; w Codespaces ustawia adres serwisu. Sekretów nie wypisuje.
 * Użycie: pnpm env:init
 */
import { randomBytes } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

const TARGET = '.env.local'
const GENERATED: Record<string, () => string> = {
  PAYLOAD_SECRET: () => randomBytes(32).toString('base64'),
  DATA_ENCRYPTION_KEY: () => randomBytes(32).toString('base64'),
  DATA_HMAC_KEY: () => randomBytes(32).toString('base64'),
  CRON_SECRET: () => randomBytes(32).toString('base64url'),
  LINK_SIGNING_KEY: () => randomBytes(32).toString('base64'),
  // Hasło konta demo z `pnpm seed demo` (tylko lokalnie).
  SEED_DEMO_PASSWORD: () => `demo-${randomBytes(9).toString('base64url')}`,
}

if (!existsSync(TARGET)) copyFileSync('.env.example', TARGET)

const lines = readFileSync(TARGET, 'utf8').split(/\r?\n/)
const filled: string[] = []

for (const [name, generate] of Object.entries(GENERATED)) {
  const index = lines.findIndex((line) => new RegExp(`^#?\\s*${name}=`).test(line))
  const current = index >= 0 ? lines[index]! : ''
  if (/^[A-Z_]+=.+/.test(current)) continue
  const entry = `${name}=${generate()}`
  if (index >= 0) lines[index] = entry
  else lines.push(entry)
  filled.push(name)
}

// GitHub Codespaces: serwis działa pod adresem przekierowanego portu, nie localhost (panel /admin,
// linki w e-mailach i akcje serwera muszą znać prawdziwy adres).
const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: FORWARDING } = process.env
if (CODESPACE_NAME && FORWARDING) {
  const url = `https://${CODESPACE_NAME}-3000.${FORWARDING}`
  const index = lines.findIndex((line) => line.startsWith('NEXT_PUBLIC_SERVER_URL='))
  if (index >= 0 && lines[index] !== `NEXT_PUBLIC_SERVER_URL=${url}`) {
    lines[index] = `NEXT_PUBLIC_SERVER_URL=${url}`
    filled.push('NEXT_PUBLIC_SERVER_URL (Codespaces)')
  }
}

writeFileSync(TARGET, lines.join('\n'))
process.stdout.write(
  filled.length
    ? `Uzupełniono w ${TARGET}: ${filled.join(', ')}\n`
    : `${TARGET} ma już wszystkie sekrety.\n`,
)
