import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { pl } from '@payloadcms/translations/languages/pl'
import { buildConfig, type Plugin } from 'payload'
import { payloadTotp } from 'payload-totp'
import sharp from 'sharp'

import { ArticleCategories, Articles } from './collections/Articles'
import { Calculators } from './collections/Calculators'
import { FirmAccounts } from './collections/FirmAccounts'
import { Firms } from './collections/Firms'
import { ForumCategories, ForumPosts, ForumReactions, ForumThreads } from './collections/Forum'
import { Inquiries } from './collections/Inquiries'
import { Leads } from './collections/Leads'
import { ListingMessages, Listings } from './collections/Listings'
import { Localities } from './collections/Localities'
import { Media, MAX_UPLOAD_BYTES } from './collections/Media'
import { AuditLog, FirmStatsDaily, Reports, Sanctions } from './collections/Moderation'
import { LocalIntros, Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Reviews } from './collections/Reviews'
import { Services } from './collections/Services'
import { Staff } from './collections/Staff'
import { Settings } from './globals/Settings'
import { jobs } from './jobs'
import { encryptedFieldHooks } from './lib/crypto'
import { emailAdapter } from './lib/email/adapter'
import { env } from './lib/env'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Sekret TOTP personelu (S): wtyczka czyta i zapisuje go przez Local API, więc hooki pola działają. */
const encryptTotpSecret: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) =>
    collection.slug !== Staff.slug
      ? collection
      : {
          ...collection,
          fields: collection.fields.map((field) =>
            'name' in field && field.name === 'totpSecret'
              ? { ...field, hooks: encryptedFieldHooks('staff.totpSecret') }
              : field,
          ),
        },
  ),
})

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
  collections: [
    Firms,
    Projects,
    Inquiries,
    Reviews,
    Articles,
    ArticleCategories,
    Pages,
    LocalIntros,
    Calculators,
    Leads,
    ForumCategories,
    ForumThreads,
    ForumPosts,
    ForumReactions,
    Listings,
    ListingMessages,
    Reports,
    Sanctions,
    Services,
    Localities,
    Media,
    FirmStatsDaily,
    FirmAccounts,
    Staff,
    AuditLog,
  ],
  globals: [Settings],
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
  email: emailAdapter(),
  graphQL: { disable: true },
  i18n: { fallbackLanguage: 'pl', supportedLanguages: { pl } },
  jobs,
  maxDepth: 3,
  // Kolejność ważna: najpierw wtyczka dodaje pole `totpSecret`, potem dokładamy mu szyfrowanie.
  // Dostęp personelu sprawdzają nasze reguły (`staff()` wymaga `_strategy === 'totp'`, ADR 0016).
  plugins: [
    payloadTotp({ collection: 'staff', forceSetup: true, disableAccessWrapper: true }),
    encryptTotpSecret,
  ],
  sharp,
  telemetry: false,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  upload: { limits: { fileSize: MAX_UPLOAD_BYTES } },
})
