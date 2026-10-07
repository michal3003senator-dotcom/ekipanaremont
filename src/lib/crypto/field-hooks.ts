import type { FieldHook } from 'payload'

import { decryptField, encryptField, isEncrypted } from './fields'
import { getKeyring } from './keyring'

/**
 * Hooki pola (S): szyfrowanie przed zapisem, odszyfrowanie po odczycie (ADR 0007).
 * `aad` = `kolekcja.pole`. Kto nie ma `access.read` na polu, w ogóle go nie dostaje.
 */
export function encryptedFieldHooks(aad: string): {
  beforeChange: FieldHook[]
  afterRead: FieldHook[]
} {
  const encrypt: FieldHook = ({ value }) =>
    typeof value === 'string' && value !== '' && !isEncrypted(value)
      ? encryptField(value, aad, getKeyring())
      : value

  const decrypt: FieldHook = ({ value }) =>
    typeof value === 'string' && isEncrypted(value) ? decryptField(value, aad, getKeyring()) : value

  return { beforeChange: [encrypt], afterRead: [decrypt] }
}
