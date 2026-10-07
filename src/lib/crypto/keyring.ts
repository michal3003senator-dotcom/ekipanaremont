type EnvSource = Readonly<Record<string, string | undefined>>

export type Keyring = {
  current: { version: number; key: Buffer }
  byVersion: ReadonlyMap<number, Buffer>
}

const KEY_BYTES = 32

function decodeKey(value: string, name: string): Buffer {
  const key = Buffer.from(value, 'base64')
  // Komunikat nigdy nie zawiera wartości klucza.
  if (key.length !== KEY_BYTES) throw new Error(`${name} musi mieć 32 bajty zakodowane w base64`)
  return key
}

/**
 * Klucze AES-256-GCM pól (S) z env (ADR 0007): bieżący `DATA_ENCRYPTION_KEY` w wersji
 * `DATA_ENCRYPTION_KEY_VERSION` oraz poprzednie, tylko do odczytu: `DATA_ENCRYPTION_KEYS_PREVIOUS="1:base64,2:base64"`.
 */
export function loadKeyring(env: EnvSource = process.env): Keyring {
  const raw = env.DATA_ENCRYPTION_KEY
  if (!raw) throw new Error('Brak DATA_ENCRYPTION_KEY')
  const version = Number(env.DATA_ENCRYPTION_KEY_VERSION ?? '1')
  if (!Number.isInteger(version) || version < 1)
    throw new Error('DATA_ENCRYPTION_KEY_VERSION musi być liczbą od 1')

  const byVersion = new Map<number, Buffer>()
  for (const entry of (env.DATA_ENCRYPTION_KEYS_PREVIOUS ?? '').split(',').filter(Boolean)) {
    const [versionText, keyText] = entry.split(':')
    const previous = Number(versionText)
    if (!Number.isInteger(previous) || previous < 1 || !keyText || previous === version) {
      throw new Error(
        'DATA_ENCRYPTION_KEYS_PREVIOUS ma format "wersja:klucz,wersja:klucz" bez bieżącej wersji',
      )
    }
    byVersion.set(previous, decodeKey(keyText, `Klucz w wersji ${previous}`))
  }

  const key = decodeKey(raw, 'DATA_ENCRYPTION_KEY')
  byVersion.set(version, key)
  return { current: { version, key }, byVersion }
}

let cached: { signature: string; keyring: Keyring } | null = null

/** Klucze z bieżącego env, wczytane raz na proces (ponownie po zmianie zmiennych, np. w testach). */
export function getKeyring(env: EnvSource = process.env): Keyring {
  const signature = [
    env.DATA_ENCRYPTION_KEY,
    env.DATA_ENCRYPTION_KEY_VERSION,
    env.DATA_ENCRYPTION_KEYS_PREVIOUS,
  ].join('|')
  if (cached?.signature !== signature) cached = { signature, keyring: loadKeyring(env) }
  return cached.keyring
}
