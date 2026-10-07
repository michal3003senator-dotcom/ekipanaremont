import { execSync } from 'node:child_process'

/**
 * Czysta baza testowa przed każdym uruchomieniem: usunięcie tabel i wszystkie migracje.
 * Osobny proces – Payload w procesie głównym Vitest zostawiałby otwarte uchwyty.
 */
export default function setup() {
  execSync('pnpm payload migrate:fresh --force-accept-warning', { stdio: 'inherit' })
}
