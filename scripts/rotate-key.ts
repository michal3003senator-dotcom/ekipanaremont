/**
 * Rotacja klucza pól (S) (ADR 0007). Kolejność:
 * 1. W env: nowy `DATA_ENCRYPTION_KEY`, `DATA_ENCRYPTION_KEY_VERSION` +1, stary klucz dopisany do
 *    `DATA_ENCRYPTION_KEYS_PREVIOUS` (np. "1:stary"). Po wdrożeniu odczyt działa na obu kluczach.
 * 2. `pnpm rotate-key` – przepisuje wartości zaszyfrowane starszą wersją kluczem bieżącym.
 * 3. Gdy skrypt zgłosi 0 przepisanych, stary klucz można usunąć z env.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { getKeyring } from '@/lib/crypto'
import { rotateEncryptedFields } from '@/lib/crypto/rotate'

const payload = await getPayload({ config })
const rotated = await rotateEncryptedFields(payload)
process.stdout.write(
  `Rotacja do wersji ${getKeyring().current.version}: przepisano ${rotated} wartości.\n`,
)
await payload.destroy()
process.exit(0)
