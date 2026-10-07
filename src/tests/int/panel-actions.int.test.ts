import path from 'node:path'

import type { Payload } from 'payload'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '../../payload.config'

// Sesja z prawdziwego tokenu Payload w ciasteczku; zmieniana między „firmą A” i „firmą B”.
let cookie = ''
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ cookie, 'x-forwarded-for': '198.51.100.9' }),
  cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }),
}))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))
vi.mock('@payloadcms/next/auth', () => ({ login: async () => ({}), logout: async () => ({}) }))
// Rejestry NIP poza testem (sieć) – zawsze „nie znaleziono”, firma podaje nazwę ręcznie.
vi.mock('../../lib/registry', () => ({ lookupNip: async () => ({ status: 'not_found' }) }))

const panel = await import('../../app/(frontend)/panel/actions')
const projects = await import('../../app/(frontend)/panel/realizacje/actions')
const settings = await import('../../app/(frontend)/panel/ustawienia/actions')
const { firmForLink } = await import('../../lib/panel/availability-link')
const { outbox } = await import('../../lib/email/adapter')
const { resetMemoryLimits } = await import('../../lib/rate-limit')

const PASSWORD = 'Fuga-Gres-Kielnia-48!'
let payload: Payload
const accounts: Record<'a' | 'b', { id: string; email: string; token: string }> = {} as never

async function account(key: 'a' | 'b') {
  const email = `panel-${key}@firma.test`
  const doc = await payload.create({
    collection: 'firmAccounts',
    data: { email, password: PASSWORD, _verified: true },
    disableVerificationEmail: true,
    overrideAccess: true,
  })
  const { token } = await payload.login({
    collection: 'firmAccounts',
    data: { email, password: PASSWORD },
  })
  accounts[key] = { id: doc.id, email, token: token! }
}
const as = (key: 'a' | 'b') => (cookie = `payload-token=${accounts[key].token}`)
const firmOf = async (key: 'a' | 'b') =>
  (
    await payload.findByID({
      collection: 'firmAccounts',
      id: accounts[key].id,
      depth: 0,
      overrideAccess: true,
    })
  ).firm as string

beforeAll(async () => {
  payload = await getPayload({ config })
  await account('a')
  await account('b')
})
beforeEach(() => resetMemoryLimits())
afterAll(async () => {
  await payload.destroy()
})

describe('kreator profilu', () => {
  it('tworzy profil z NIP i nazwą, drugi raz ten sam NIP jest zajęty', async () => {
    as('a')
    const created = await panel.createFirmAction({ nip: '0000000081', name: 'Glazura Test' })
    expect(created).toEqual({ ok: true })
    const firm = await payload.findByID({
      collection: 'firms',
      id: await firmOf('a'),
      overrideAccess: true,
    })
    expect(firm).toMatchObject({ name: 'Glazura Test', status: 'draft', registryVerifiedAt: null })

    as('b')
    expect(await panel.lookupNipAction({ nip: '0000000081' })).toMatchObject({
      ok: false,
      fieldErrors: { nip: expect.stringMatching(/ma już profil/) },
    })
    expect(await panel.createFirmAction({ nip: '0000000098', name: 'Hydraulika Test' })).toEqual({
      ok: true,
    })
  })

  it('nie wysyła niekompletnego profilu do akceptacji', async () => {
    as('a')
    const result = await panel.submitForReviewAction()
    expect(result).toMatchObject({ ok: false, message: expect.stringMatching(/usługi/) })
  })

  it('opis firmy zapisuje się, status zmienia tylko system', async () => {
    as('a')
    expect(
      await panel.saveAboutAction({
        shortDescription: 'Łazienki i kuchnie pod klucz w Łodzi i okolicy.',
        vatInvoice: true,
        phone: '600 100 200',
      }),
    ).toEqual({ ok: true })
    const firm = await payload.findByID({
      collection: 'firms',
      id: await firmOf('a'),
      overrideAccess: true,
    })
    expect(firm).toMatchObject({ vatInvoice: true, phone: '600 100 200', status: 'draft' })
  })
})

describe('termin', () => {
  it('potwierdzenie ustawia confirmedAt; data w przeszłości jest odrzucana', async () => {
    as('a')
    const date = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)
    const result = await panel.confirmAvailabilityAction({ date })
    expect(result).toMatchObject({ ok: true, data: { date } })
    expect(await panel.confirmAvailabilityAction({ date: '2020-01-01' })).toMatchObject({
      ok: false,
      fieldErrors: { date: expect.any(String) },
    })
  })

  it('bez sesji akcja odmawia', async () => {
    cookie = ''
    expect(await panel.confirmAvailabilityAction({})).toMatchObject({
      ok: false,
      message: expect.stringMatching(/Zaloguj/),
    })
  })
})

describe('zapytania i realizacje (firma A vs firma B)', () => {
  it('firma B nie zmienia statusu zapytania firmy A', async () => {
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        firm: await firmOf('a'),
        description: 'Remont łazienki 4 m².',
        clientName: 'Ewa',
        clientEmail: 'ewa@example.com',
        consentTextVersion: '1',
        consentAt: new Date().toISOString(),
        status: 'new',
      },
      overrideAccess: true,
    })
    as('b')
    expect(await panel.setInquiryStatusAction({ id: inquiry.id, status: 'spam' })).toMatchObject({
      ok: false,
    })
    as('a')
    expect(await panel.setInquiryStatusAction({ id: inquiry.id, status: 'in_contact' })).toEqual({
      ok: true,
    })
  })

  it('zdjęcie realizacji: WebP bez EXIF, limit właściciela, kolejność tylko z tych samych zdjęć', async () => {
    as('a')
    const created = await projects.saveProjectAction({ title: 'Łazienka na Bałutach' })
    expect(created.ok).toBe(true)
    const projectId = (created as { data: { id: string } }).data.id

    const jpeg = await sharp({
      create: { width: 1200, height: 900, channels: 3, background: '#a0a0a0' },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Copyright: 'Test', Artist: 'Jan Kowalski' } } })
      .toBuffer()
    const upload = (key: 'a' | 'b') => {
      as(key)
      const data = new FormData()
      data.set('projectId', projectId)
      data.set('file', new File([new Uint8Array(jpeg)], 'zdjecie.jpg', { type: 'image/jpeg' }))
      return projects.uploadProjectPhotoAction(data)
    }
    const first = await upload('a')
    const second = await upload('a')
    expect(first.ok && second.ok).toBe(true)
    expect(await upload('b')).toMatchObject({ ok: false })

    const media = await payload.findByID({
      collection: 'media',
      id: (first as { data: { id: string } }).data.id,
      overrideAccess: true,
    })
    expect(media.mimeType).toBe('image/webp')
    const stored = await sharp(path.join(process.cwd(), 'media', media.filename!)).metadata()
    expect(stored.exif).toBeUndefined()
    expect(stored.format).toBe('webp')
    expect(media.sizes?.thumb?.width).toBe(480)

    as('a')
    const ids = [
      (second as { data: { id: string } }).data.id,
      (first as { data: { id: string } }).data.id,
    ]
    expect(await projects.reorderPhotosAction({ projectId, ids })).toEqual({ ok: true })
    expect(await projects.reorderPhotosAction({ projectId, ids: [ids[0]] })).toMatchObject({
      ok: false,
    })
    as('b')
    expect(await projects.deleteProjectAction({ id: projectId })).toMatchObject({ ok: false })
  })
})

describe('zadania i link z e-maila', () => {
  it('przypomnienie o terminie wysyła się raz, link potwierdza tylko raz', async () => {
    const firmId = await firmOf('a')
    const date = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10)
    await payload.update({
      collection: 'firms',
      id: firmId,
      data: { status: 'active', availability: { date }, mailLog: { availabilityReminderAt: null } },
      overrideAccess: true,
    })
    // Potwierdzenie sprzed 11 dni (przypomnienie po 10).
    await payload.db.updateOne({
      collection: 'firms',
      id: firmId,
      data: {
        availability: { date, confirmedAt: new Date(Date.now() - 11 * 864e5).toISOString() },
      },
    })

    const before = outbox.length
    await payload.jobs.queue({ task: 'remindAvailability', input: {}, queue: 'test' })
    await payload.jobs.run({ queue: 'test' })
    const reminder = outbox.slice(before).find((message) => message.to === accounts.a.email)
    expect(reminder?.subject).toMatch(/nadal wolny/)

    await payload.jobs.queue({ task: 'remindAvailability', input: {}, queue: 'test' })
    await payload.jobs.run({ queue: 'test' })
    expect(outbox.slice(before).filter((message) => message.to === accounts.a.email)).toHaveLength(
      1,
    )

    const token = /\/termin\/potwierdz\/([\w.-]+)/.exec(String(reminder?.text))![1]!
    expect(await firmForLink(token)).toMatchObject({ id: firmId })
    as('a')
    await panel.confirmAvailabilityAction({})
    expect(await firmForLink(token)).toBeNull()
  })
})

describe('ustawienia', () => {
  it('eksport wymaga hasła i zawiera dane firmy; usunięcie konta kasuje profil', async () => {
    as('b')
    expect(await settings.exportDataAction({ password: 'zle' })).toMatchObject({
      ok: false,
      fieldErrors: { password: expect.any(String) },
    })
    const exported = await settings.exportDataAction({ password: PASSWORD })
    expect(
      exported.ok && JSON.parse((exported as { data: { json: string } }).data.json).firm.name,
    ).toBe('Hydraulika Test')

    const firmId = await firmOf('b')
    await expect(settings.deleteAccountAction({ password: PASSWORD })).rejects.toThrow('REDIRECT:/')
    expect(
      await payload.findByID({
        collection: 'firms',
        id: firmId,
        overrideAccess: true,
        disableErrors: true,
      }),
    ).toBeNull()
  })
})
