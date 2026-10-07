import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { pl } from '@payloadcms/translations/languages/pl'
import { buildConfig } from 'payload'

import { Staff } from './collections/Staff'
import { env } from './lib/env'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SERVER_URL,
  secret: env.PAYLOAD_SECRET,
  admin: {
    // Bez Gravatara: nie wysyłamy skrótów e-maili personelu do zewnętrznej usługi.
    avatar: 'default',
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' – Ekipa na Termin' },
    user: Staff.slug,
  },
  collections: [Staff],
  cors: [env.NEXT_PUBLIC_SERVER_URL],
  csrf: [env.NEXT_PUBLIC_SERVER_URL],
  db: postgresAdapter({
    idType: 'uuid',
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: { connectionString: env.DATABASE_URL },
    push: false,
  }),
  defaultDepth: 1,
  editor: lexicalEditor(),
  graphQL: { disable: true },
  i18n: { fallbackLanguage: 'pl', supportedLanguages: { pl } },
  maxDepth: 3,
  telemetry: false,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
