import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import { getPayload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '../../payload.config'
import type { Firm, FirmAccount, Staff } from '../../payload-types'

type StaffUser = Staff & { collection: 'staff'; _strategy: string }

// Moderator „po kodzie TOTP” bez prawdziwej sesji: centrum moderacji pyta tylko `getModerator`.
let moderator: StaffUser | null = null
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '198.51.100.21' }),
  cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }),
}))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))
vi.mock('../../lib/auth/session', () => ({
  getModerator: async () => moderator,
  getFirmSession: async () => null,
}))

const { decideAction, sanctionAction } = await import('../../app/(frontend)/moderacja/actions')
const { reportAction, appealAction } =
  await import('../../app/(frontend)/(serwis)/zgloszenie/actions')
const { loadQueue, pendingCounts } = await import('../../lib/moderation/queue')
const { hasActiveBan } = await import('../../lib/moderation/sanctions')
const { outbox } = await import('../../lib/email/adapter')
const { resetMemoryLimits } = await import('../../lib/rate-limit')
const { isValidNip } = await import('../../lib/validation')

let payload: Payload
let staff: StaffUser
let account: FirmAccount
const system = { overrideAccess: true, depth: 0 } as const

/** Poprawne NIP-y spoza innych testów (prefiks 000 – nie istnieje taki urząd). */
function nips(count: number, from = 3_100_000) {
  const result: string[] = []
  for (let n = from; result.length < count; n += 1) {
    const nip = String(n).padStart(10, '0')
    if (isValidNip(nip)) result.push(nip)
  }
  return result
}
const NIPS = nips(20)
let nipIndex = 0

async function firm(status: Firm['status'], name = `Moderowana ${nipIndex}`) {
  return payload.create({
    collection: 'firms',
    data: {
      name,
      nip: NIPS[nipIndex++]!,
      status,
      subscriptionStatus: 'trial',
      registryVerifiedAt: new Date().toISOString(),
      shortDescription: 'Remonty łazienek i kuchni.',
    },
    ...system,
  })
}

const report = (targetId: string, extra: Record<string, unknown> = {}) => ({
  targetType: 'firms',
  targetId,
  reason: 'fake',
  description: 'Firma podaje nieprawdziwe dane o realizacjach.',
  reporterEmail: 'zglaszajacy@example.com',
  goodFaith: true,
  ...extra,
})

const lastMail = (subject: string) =>
  [...outbox].reverse().find((mail) => String(mail.subject).includes(subject))
const appealToken = (text: string) => /\/odwolanie\/([A-Za-z0-9_.-]+)/.exec(text)?.[1]

beforeAll(async () => {
  payload = await getPayload({ config })
  const created = await payload.create({
    collection: 'staff',
    data: {
      email: 'moderacja@ekipa.test',
      name: 'Moderator',
      role: 'moderator',
      password: 'Haslo-testowe-123!',
    },
    ...system,
  })
  staff = { ...created, collection: 'staff', _strategy: 'totp' }
})

beforeEach(() => {
  resetMemoryLimits()
  moderator = staff
})

afterAll(async () => {
  await payload.destroy()
})

describe('zgłoszenia (DSA)', () => {
  it('gość zgłasza profil: zapis z zaszyfrowanym e-mailem i potwierdzenie', async () => {
    const target = await firm('active')
    expect(await reportAction(report(target.id))).toMatchObject({ ok: true })

    const { docs } = await payload.find({
      collection: 'reports',
      where: { targetId: { equals: target.id } },
      ...system,
    })
    expect(docs[0]).toMatchObject({
      status: 'new',
      reason: 'fake',
      reporterEmail: 'zglaszajacy@example.com',
    })
    const db = (payload.db as unknown as PostgresAdapter).drizzle
    const raw = await db.execute(sql`SELECT reporter_email FROM reports WHERE id = ${docs[0]!.id}`)
    expect(String(raw.rows[0]?.reporter_email)).not.toContain('@')
    expect(lastMail('Przyjęliśmy zgłoszenie')?.to).toBe('zglaszajacy@example.com')
  })

  it('niepubliczna treść, złe dane i limit', async () => {
    const hidden = await firm('suspended')
    expect(await reportAction(report(hidden.id))).toMatchObject({ ok: false })
    expect(await reportAction(report(hidden.id, { goodFaith: false }))).toMatchObject({
      ok: false,
      fieldErrors: { goodFaith: expect.any(String) },
    })
    const target = await firm('active')
    for (let i = 0; i < 5; i += 1) await reportAction(report(target.id))
    expect(await reportAction(report(target.id))).toMatchObject({ ok: false })
  })
})

describe('centrum moderacji', () => {
  it('bez moderatora po 2FA żadna decyzja nie przechodzi', async () => {
    moderator = null
    const pending = await firm('pending_review')
    const result = await decideAction({
      kind: 'firm',
      id: pending.id,
      decision: 'approve',
      reason: '',
    })
    expect(result).toMatchObject({ ok: false })
    const after = await payload.findByID({ collection: 'firms', id: pending.id, ...system })
    expect(after.status).toBe('pending_review')
  })

  it('zatwierdzenie profilu jednym kliknięciem, odrzucenie tylko z uzasadnieniem', async () => {
    const approved = await firm('pending_review')
    expect(
      await decideAction({ kind: 'firm', id: approved.id, decision: 'approve', reason: '' }),
    ).toMatchObject({ ok: true })
    expect(
      (await payload.findByID({ collection: 'firms', id: approved.id, ...system })).status,
    ).toBe('active')

    const rejected = await firm('pending_review')
    expect(
      await decideAction({ kind: 'firm', id: rejected.id, decision: 'reject', reason: 'krótko' }),
    ).toMatchObject({ ok: false, fieldErrors: { reason: expect.any(String) } })
    const reason = 'Opis zawiera dane kontaktowe innej firmy. Usuń je i wyślij ponownie.'
    expect(
      await decideAction({ kind: 'firm', id: rejected.id, decision: 'reject', reason }),
    ).toMatchObject({ ok: true })

    // Rejestr decyzji i dziennik zmian (kryterium fazy 7).
    const { docs } = await payload.find({
      collection: 'reports',
      where: { targetId: { equals: rejected.id }, reason: { equals: 'moderator' } },
      ...system,
    })
    expect(docs[0]).toMatchObject({ status: 'resolved', statementOfReasons: reason })
    expect(docs[0]?.decidedBy).toBe(staff.id)
    const audit = await payload.find({
      collection: 'auditLog',
      where: { docId: { equals: rejected.id }, actor: { equals: staff.id } },
      ...system,
    })
    expect(audit.totalDocs).toBeGreaterThan(0)
  })

  it('panel Payload też wymaga uzasadnienia przy zawieszeniu', async () => {
    const active = await firm('active')
    await expect(
      payload.update({
        collection: 'firms',
        id: active.id,
        data: { status: 'suspended' },
        ...system,
      }),
    ).rejects.toThrow()
  })

  it('ukrycie po zgłoszeniu, e-maile z uzasadnieniem i odwołanie z uchyleniem', async () => {
    const target = await firm('active', 'Firma ze zgłoszeniem')
    account = await payload.create({
      collection: 'firmAccounts',
      data: {
        email: 'zgloszona@firma.test',
        password: 'Haslo-testowe-123!',
        firm: target.id,
        _verified: true,
      },
      disableVerificationEmail: true,
      ...system,
    })
    await reportAction(report(target.id))
    const queue = await loadQueue(payload, 'zgloszenia')
    const item = queue.items.find((entry) => entry.target?.id === target.id)!
    expect(JSON.stringify(item)).not.toContain('zglaszajacy@example.com')
    expect(item.accounts).toHaveLength(1)

    const reason = 'Zdjęcia realizacji pochodzą z cudzej strony internetowej.'
    expect(
      await decideAction({ kind: 'report', id: item.id, decision: 'hidden', reason }),
    ).toMatchObject({
      ok: true,
    })
    const hidden = await payload.findByID({ collection: 'firms', id: target.id, ...system })
    expect(hidden).toMatchObject({ status: 'suspended', moderationReason: reason })

    const toFirm = lastMail('Decyzja moderatora')
    expect(toFirm?.to).toBe('zgloszona@firma.test')
    expect(String(toFirm?.text)).toContain(reason)
    expect(lastMail('Decyzja w sprawie zgłoszenia')?.to).toBe('zglaszajacy@example.com')

    // Odwołanie z linku w e-mailu – raz.
    const token = appealToken(String(toFirm?.text))!
    const appeal = {
      token,
      description: 'Zdjęcia są nasze, mamy oryginały z datą i umowę z klientem.',
      email: 'zgloszona@firma.test',
    }
    expect(await appealAction(appeal)).toMatchObject({ ok: true })
    expect(await appealAction(appeal)).toMatchObject({ ok: false })
    expect(await appealAction({ ...appeal, token: `${token}x` })).toMatchObject({ ok: false })

    const appeals = await loadQueue(payload, 'zgloszenia')
    const appealItem = appeals.items.find(
      (entry) => entry.appeal && entry.target?.id === target.id,
    )!
    expect(
      await decideAction({
        kind: 'report',
        id: appealItem.id,
        decision: 'revert',
        reason: 'Firma przedstawiła oryginały zdjęć – decyzja uchylona.',
      }),
    ).toMatchObject({ ok: true })
    expect((await payload.findByID({ collection: 'firms', id: target.id, ...system })).status).toBe(
      'active',
    )
  })

  it('blokada konta: rejestr, e-mail i aktywna blokada', async () => {
    expect(
      await sanctionAction({
        accountId: account.id,
        scope: 'account',
        type: 'ban',
        days: 7,
        reason: 'Powtarzające się fałszywe dane w profilu mimo ostrzeżenia.',
      }),
    ).toMatchObject({ ok: true })
    expect(await hasActiveBan(payload, account.id, 'account')).toBe(true)
    expect(await hasActiveBan(payload, account.id, 'forum')).toBe(true)
    expect(String(lastMail('Decyzja moderatora')?.text)).toContain('/odwolanie/')
    const { docs } = await payload.find({
      collection: 'reports',
      where: { decision: { equals: 'banned' }, targetTitle: { equals: `konto ${account.email}` } },
      ...system,
    })
    expect(docs).toHaveLength(1)
  })

  it('liczniki kolejek', async () => {
    const counts = await pendingCounts(payload)
    expect(counts.firms).toBeGreaterThanOrEqual(0)
    expect(counts.reports).toBeGreaterThanOrEqual(1)
  })
})

describe('retencja zapytań (RODO)', () => {
  it('po okresie przechowywania dane klienta i zdjęcia znikają, rekord zostaje', async () => {
    const target = await firm('active', 'Firma z dawnym zapytaniem')
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        firm: target.id,
        description: 'Remont łazienki 6 m², płytki i biały montaż.',
        clientName: 'Anna',
        clientEmail: 'anna@example.com',
        clientPhone: '600100200',
        consentTextVersion: 'test',
        consentAt: new Date().toISOString(),
        status: 'closed',
      },
      ...system,
    })
    const fresh = await payload.create({
      collection: 'inquiries',
      data: {
        firm: target.id,
        description: 'Malowanie mieszkania 50 m².',
        clientName: 'Jan',
        clientEmail: 'jan@example.com',
        consentTextVersion: 'test',
        consentAt: new Date().toISOString(),
        status: 'new',
      },
      ...system,
    })
    const db = (payload.db as unknown as PostgresAdapter).drizzle
    await db.execute(
      sql`UPDATE inquiries SET created_at = now() - interval '25 months' WHERE id = ${inquiry.id}`,
    )

    await payload.jobs.queue({ task: 'anonymizeInquiries', input: {}, queue: 'retencja' })
    await payload.jobs.run({ queue: 'retencja' })

    const old = await payload.findByID({ collection: 'inquiries', id: inquiry.id, ...system })
    expect(old).toMatchObject({ clientName: 'Usunięto', status: 'closed' })
    expect(old.clientPhone ?? null).toBeNull()
    expect(old.anonymizedAt).toBeTruthy()
    expect(JSON.stringify(old)).not.toContain('anna@example.com')
    const kept = await payload.findByID({ collection: 'inquiries', id: fresh.id, ...system })
    expect(kept.clientEmail).toBe('jan@example.com')
  })
})
