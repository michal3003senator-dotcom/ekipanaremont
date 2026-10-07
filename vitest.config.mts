import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

// Testy zawsze na osobnej bazie (docker-compose.yml tworzy `ekipa_test`), nigdy na bazie z .env.local.
Object.assign(process.env, {
  DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://ekipa:ekipa@127.0.0.1:5432/ekipa_test',
  NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
  PAYLOAD_SECRET: randomBytes(32).toString('hex'),
  DATA_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
  DATA_HMAC_KEY: randomBytes(32).toString('base64'),
  LINK_SIGNING_KEY: randomBytes(32).toString('base64'),
})

export default defineConfig({
  // Ten sam alias co w tsconfig.json (`@/` → `src/`).
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'int',
          environment: 'node',
          include: ['src/tests/int/**/*.int.test.ts'],
          globalSetup: ['src/tests/int/global-setup.ts'],
          fileParallelism: false,
          hookTimeout: 60_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
})
