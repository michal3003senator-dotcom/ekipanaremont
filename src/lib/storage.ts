import { s3Storage } from '@payloadcms/storage-s3'

type EnvSource = Readonly<Record<string, string | undefined>>

/**
 * Pliki w Cloudflare R2 (jurysdykcja UE, CLAUDE.md). Jeden prywatny kubełek: pliki idą przez
 * `/api/media/file/…`, więc reguły dostępu Payload działają (zdjęcia zapytań widzi tylko firma).
 * Lokalnie bez R2 – dysk (`media/`). Na Vercelu dysk jest ulotny, więc R2 jest wymagany.
 */
export function r2Storage(env: EnvSource = process.env) {
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = env
  const enabled = Boolean(R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET)
  if (!enabled && env.VERCEL === '1')
    throw new Error(
      'Na Vercelu pliki wymagają R2: ustaw R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY i R2_BUCKET.',
    )
  return s3Storage({
    enabled,
    // Ten sam schemat bazy z R2 i bez (pole `prefix`), więc migracje są wspólne.
    alwaysInsertFields: true,
    bucket: R2_BUCKET ?? 'media',
    collections: { media: true },
    config: {
      endpoint: R2_ENDPOINT,
      region: 'auto',
      forcePathStyle: true,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: R2_SECRET_ACCESS_KEY ?? '',
      },
    },
  })
}
