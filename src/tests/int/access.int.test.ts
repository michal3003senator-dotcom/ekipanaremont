import { randomBytes } from 'node:crypto'

import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { rotateEncryptedFields } from '../../lib/crypto/rotate'

import { as, createFixtures, type Fixtures, NIP } from './fixtures'

let f: Fixtures
let payload: Payload
const system = { overrideAccess: true } as const

beforeAll(async () => {
  f = await createFixtures()
  payload = f.payload
})

afterAll(async () => {
  await payload.destroy()
})

const png = async () => ({
  data: await sharp({ create: { width: 8, height: 8, channels: 3, background: '#808080' } })
    .png()
    .toBuffer(),
  mimetype: 'image/png',
  name: 'zdjecie.png',
  size: 0,
})

/** Surowa wartość kolumny z bazy – do sprawdzenia, że dane (S) są zaszyfrowane. */
async function rawColumn(table: string, column: string, id: string): Promise<string> {
  const db = payload.db as unknown as {
    drizzle: { execute: (query: unknown) => Promise<{ rows: Record<string, string>[] }> }
  }
  const result = await db.drizzle.execute(
    sql.raw(`SELECT "${column}" AS value FROM "${table}" WHERE id = '${id}'`),
  )
  return result.rows[0]!.value!
}

describe('personel', () => {
  it('gość nie czyta ani nie tworzy kont personelu', async () => {
    await expect(payload.find({ collection: 'staff', ...as() })).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'staff',
        data: { email: 'x@ekipa.test', name: 'X', role: 'admin', password: 'Haslo-testowe-123!' },
        ...as(),
      }),
    ).rejects.toThrow()
  })

  it('administrator bez kodu TOTP widzi tylko własne konto i nic nie zmienia', async () => {
    const list = await payload.find({ collection: 'staff', ...as(f.users.adminWithoutTotp) })
    expect(list.docs.map((doc) => doc.id)).toEqual([f.users.adminWithoutTotp.id])
    await expect(
      payload.update({
        collection: 'staff',
        id: f.users.adminWithoutTotp.id,
        data: { name: 'Zmiana' },
        ...as(f.users.adminWithoutTotp),
      }),
    ).rejects.toThrow()
    await expect(
      payload.find({
        collection: 'firms',
        where: { status: { equals: 'suspended' } },
        ...as(f.users.adminWithoutTotp),
      }),
    ).resolves.toMatchObject({
      totalDocs: 0,
    })
  })

  it('administrator po kodzie TOTP zarządza personelem', async () => {
    const created = await payload.create({
      collection: 'staff',
      data: {
        email: 'nowy@ekipa.test',
        name: 'Nowy',
        role: 'editor',
        password: 'Haslo-testowe-123!',
      },
      ...as(f.users.admin),
    })
    await payload.delete({ collection: 'staff', id: created.id, ...as(f.users.admin) })
  })

  it('moderator nie nadaje sobie roli administratora', async () => {
    const doc = await payload.update({
      collection: 'staff',
      id: f.users.moderator.id,
      data: { role: 'admin' },
      ...as(f.users.moderator),
    })
    expect(doc.role).toBe('moderator')
  })

  it('nie ujawnia skrótu hasła ani sekretu TOTP', async () => {
    const doc = await payload.findByID({
      collection: 'staff',
      id: f.users.admin.id,
      ...as(f.users.admin),
    })
    expect(doc).not.toHaveProperty('hash')
    expect(doc).not.toHaveProperty('salt')
    expect(doc.totpSecret).toBeUndefined()
  })

  it('sekret TOTP jest w bazie zaszyfrowany, a wtyczka czyta go odszyfrowany', async () => {
    const secret = 'JBSWY3DPEHPK3PXP'
    await payload.update({
      collection: 'staff',
      id: f.users.editor.id,
      data: { totpSecret: secret },
      ...system,
    })
    expect(await rawColumn('staff', 'totp_secret', f.users.editor.id)).toMatch(/^enc:v1:/)
    const doc = await payload.findByID({
      collection: 'staff',
      id: f.users.editor.id,
      showHiddenFields: true,
      ...system,
    })
    expect(doc.totpSecret).toBe(secret)
  })
})

describe('konta firm', () => {
  it('firma czyta tylko własne konto i nie zmienia przypisanej firmy', async () => {
    const list = await payload.find({ collection: 'firmAccounts', ...as(f.users.a) })
    expect(list.docs.map((doc) => doc.id)).toEqual([f.users.a.id])
    const doc = await payload.update({
      collection: 'firmAccounts',
      id: f.users.a.id,
      data: { firm: f.firmB.id },
      depth: 0,
      ...as(f.users.a),
    })
    expect(doc.firm).toBe(f.firmA.id)
    await expect(
      payload.update({
        collection: 'firmAccounts',
        id: f.users.b.id,
        data: { termsVersion: '9' },
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
  })
})

describe('firmy', () => {
  it('gość widzi tylko aktywne profile i bez danych wewnętrznych', async () => {
    // Tylko firmy z fixture – inne pliki testów dopisują własne do tej samej bazy.
    const list = await payload.find({
      collection: 'firms',
      where: { nip: { in: Object.values(NIP) } },
      ...as(),
    })
    expect(list.docs.map((doc) => doc.name).sort()).toEqual(['Firma A', 'Firma B'])
    expect(list.docs[0]).not.toHaveProperty('subscriptionStatus')
    expect(list.docs[0]).not.toHaveProperty('registryData')
  })

  it('firma A edytuje swój profil, ale nie status ani profil firmy B', async () => {
    const doc = await payload.update({
      collection: 'firms',
      id: f.firmA.id,
      data: {
        shortDescription: 'Łazienki i kuchnie',
        status: 'active',
        subscriptionStatus: 'active',
      },
      ...as(f.users.a),
    })
    expect(doc.shortDescription).toBe('Łazienki i kuchnie')
    expect(doc.subscriptionStatus).toBe('trial')
    await expect(
      payload.update({
        collection: 'firms',
        id: f.firmB.id,
        data: { name: 'Przejęta' },
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
  })

  it('termin potwierdzony ustawia confirmedAt i nie może być w przeszłości', async () => {
    const date = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10)
    const doc = await payload.update({
      collection: 'firms',
      id: f.firmA.id,
      data: { availability: { date } },
      ...as(f.users.a),
    })
    expect(doc.availability?.confirmedAt).toBeTruthy()
    await expect(
      payload.update({
        collection: 'firms',
        id: f.firmA.id,
        data: { availability: { date: '2020-01-01' } },
        ...as(f.users.a),
      }),
    ).rejects.toMatchObject({
      data: { errors: [{ message: expect.stringMatching(/przeszłości/) }] },
    })
  })

  it('moderator zmienia status, redaktor nie edytuje firm', async () => {
    const doc = await payload.update({
      collection: 'firms',
      id: f.firmC.id,
      data: { moderationReason: 'Test' },
      ...as(f.users.moderator),
    })
    expect(doc.moderationReason).toBe('Test')
    await expect(
      payload.update({
        collection: 'firms',
        id: f.firmA.id,
        data: { name: 'X' },
        ...as(f.users.editor),
      }),
    ).rejects.toThrow()
  })

  it('odrzuca błędny NIP', async () => {
    await expect(
      payload.create({
        collection: 'firms',
        data: { name: 'Zły NIP', nip: '1234567890', status: 'draft', subscriptionStatus: 'trial' },
        ...system,
      }),
    ).rejects.toThrow(/NIP/)
  })

  it('zmiana firmy trafia do dziennika bez wartości pól', async () => {
    const log = await payload.find({
      collection: 'auditLog',
      where: { docId: { equals: f.firmA.id }, action: { equals: 'update' } },
      ...as(f.users.admin),
    })
    expect(log.docs.flatMap((doc) => doc.changedFields ?? [])).toContain('shortDescription')
    expect(JSON.stringify(log.docs)).not.toContain('Łazienki')
  })
})

describe('realizacje i pliki', () => {
  it('firma tworzy realizację zawsze na swoją firmę, gość widzi tylko opublikowane', async () => {
    const doc = await payload.create({
      collection: 'projects',
      data: { title: 'Łazienka na Bałutach', firm: f.firmB.id, status: 'draft' },
      depth: 0,
      ...as(f.users.a),
    })
    expect(doc.firm).toBe(f.firmA.id)
    expect(
      (
        await payload.find({
          collection: 'projects',
          where: { firm: { equals: f.firmA.id } },
          ...as(),
        })
      ).totalDocs,
    ).toBe(0)
    await expect(
      payload.update({
        collection: 'projects',
        id: doc.id,
        data: { title: 'X' },
        ...as(f.users.b),
      }),
    ).rejects.toThrow()
  })

  it('zdjęcia zapytań widzi tylko firma-adresat i administrator', async () => {
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Zdjęcie od klienta', purpose: 'inquiry', firm: f.firmA.id },
      file: await png(),
      ...system,
    })
    expect(media.mimeType).toBe('image/webp')
    await expect(payload.findByID({ collection: 'media', id: media.id, ...as() })).rejects.toThrow()
    await expect(
      payload.findByID({ collection: 'media', id: media.id, ...as(f.users.b) }),
    ).rejects.toThrow()
    await expect(
      payload.findByID({ collection: 'media', id: media.id, ...as(f.users.a) }),
    ).resolves.toBeTruthy()
  })

  it('odrzuca plik, który nie jest obrazem, nawet z nazwą .png', async () => {
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'Fałszywy obraz', purpose: 'project' },
        file: {
          data: Buffer.from('<script>alert(1)</script>'),
          mimetype: 'image/png',
          name: 'x.png',
          size: 25,
        },
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
  })
})

describe('zapytania (dane zaszyfrowane)', () => {
  let inquiryId: string

  beforeAll(async () => {
    const doc = await payload.create({
      collection: 'inquiries',
      data: {
        firm: f.firmA.id,
        description: 'Remont łazienki 6 m², skucie płytek, nowe płytki.',
        clientName: 'Anna',
        clientEmail: 'Anna@Example.com',
        consentTextVersion: '1',
        consentAt: new Date().toISOString(),
        status: 'new',
      },
      ...system,
    })
    inquiryId = doc.id
  })

  it('gość nie wysyła zapytania z pominięciem formularza', async () => {
    await expect(
      payload.create({
        collection: 'inquiries',
        data: {
          firm: f.firmA.id,
          description: 'x'.repeat(30),
          clientName: 'X',
          clientEmail: 'x@x.pl',
          consentTextVersion: '1',
          consentAt: new Date().toISOString(),
          status: 'new',
        },
        ...as(),
      }),
    ).rejects.toThrow()
  })

  it('w bazie dane kontaktowe są zaszyfrowane, e-mail ma skrót HMAC', async () => {
    expect(await rawColumn('inquiries', 'client_email', inquiryId)).toMatch(/^enc:v1:/)
    expect(await rawColumn('inquiries', 'description', inquiryId)).toMatch(/^enc:v1:/)
    expect(await rawColumn('inquiries', 'client_email_hash', inquiryId)).toMatch(/^[0-9a-f]{64}$/)
  })

  it('firma A czyta swoje zapytanie odszyfrowane, bez skrótów', async () => {
    const doc = await payload.findByID({ collection: 'inquiries', id: inquiryId, ...as(f.users.a) })
    expect(doc.clientEmail).toBe('Anna@Example.com')
    expect(doc).not.toHaveProperty('clientEmailHash')
  })

  it('firma B, moderator i redaktor nie czytają zapytań firmy A', async () => {
    for (const user of [f.users.b, f.users.moderator, f.users.editor]) {
      await expect(
        payload.findByID({ collection: 'inquiries', id: inquiryId, ...as(user) }),
      ).rejects.toThrow()
    }
  })

  it('firma A zmienia tylko status, nie treść zapytania', async () => {
    const doc = await payload.update({
      collection: 'inquiries',
      id: inquiryId,
      data: { status: 'in_contact', clientEmail: 'podmiana@example.com' },
      ...as(f.users.a),
    })
    expect(doc.status).toBe('in_contact')
    expect(doc.clientEmail).toBe('Anna@Example.com')
  })
})

describe('opinie', () => {
  let reviewId: string

  beforeAll(async () => {
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        firm: f.firmB.id,
        description: 'Malowanie mieszkania 50 m².',
        clientName: 'Jan',
        clientEmail: 'jan@example.com',
        consentTextVersion: '1',
        consentAt: new Date().toISOString(),
        status: 'new',
      },
      ...system,
    })
    const review = await payload.create({
      collection: 'reviews',
      data: {
        firm: f.firmB.id,
        inquiry: inquiry.id,
        rating: 5,
        body: 'Solidnie, w terminie i bez bałaganu. Polecam.',
        authorDisplayName: 'Jan, Widzew',
        status: 'pending',
      },
      ...system,
    })
    reviewId = review.id
  })

  it('gość nie widzi opinii przed akceptacją, po akceptacji średnia trafia do firmy', async () => {
    await expect(
      payload.findByID({ collection: 'reviews', id: reviewId, ...as() }),
    ).rejects.toThrow()
    await payload.update({
      collection: 'reviews',
      id: reviewId,
      data: { status: 'approved' },
      ...as(f.users.moderator),
    })
    await expect(
      payload.findByID({ collection: 'reviews', id: reviewId, ...as() }),
    ).resolves.toMatchObject({ rating: 5 })
    const firm = await payload.findByID({ collection: 'firms', id: f.firmB.id, ...system })
    expect(firm).toMatchObject({ ratingAvg: 5, ratingCount: 1 })
  })

  it('firma B odpowiada na opinię, ale nie zmienia oceny ani statusu; firma A nie odpowiada', async () => {
    const doc = await payload.update({
      collection: 'reviews',
      id: reviewId,
      data: { firmReply: 'Dziękujemy!', rating: 1, status: 'rejected' },
      ...as(f.users.b),
    })
    expect(doc).toMatchObject({ firmReply: 'Dziękujemy!', rating: 5, status: 'approved' })
    expect(doc.firmReplyAt).toBeTruthy()
    await expect(
      payload.update({
        collection: 'reviews',
        id: reviewId,
        data: { firmReply: 'Spam' },
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
  })
})

describe('leady, CMS i ustawienia', () => {
  it('leady czyta tylko administrator', async () => {
    await payload.create({
      collection: 'leads',
      data: {
        email: 'lead@example.com',
        consentTextVersion: '1',
        consentAt: new Date().toISOString(),
        status: 'new',
      },
      ...system,
    })
    expect((await payload.find({ collection: 'leads', ...as(f.users.admin) })).docs[0]?.email).toBe(
      'lead@example.com',
    )
    for (const user of [f.users.editor, f.users.moderator, f.users.a]) {
      await expect(payload.find({ collection: 'leads', ...as(user) })).rejects.toThrow()
    }
  })

  it('redaktor tworzy artykuł, gość widzi tylko opublikowany', async () => {
    const draft = await payload.create({
      collection: 'articles',
      data: { title: 'Szkic artykułu', _status: 'draft' },
      draft: true,
      ...as(f.users.editor),
    })
    expect((await payload.find({ collection: 'articles', ...as() })).totalDocs).toBe(0)
    await payload.update({
      collection: 'articles',
      id: draft.id,
      data: { _status: 'published' },
      ...as(f.users.editor),
    })
    expect((await payload.find({ collection: 'articles', ...as() })).totalDocs).toBe(1)
    await expect(
      payload.create({ collection: 'articles', data: { title: 'Reklama' }, ...as(f.users.a) }),
    ).rejects.toThrow()
  })

  it('kalkulator: szkic bez parametrów, publikacja tylko z kompletem, gość widzi opublikowany', async () => {
    const draft = await payload.create({
      collection: 'calculators',
      data: { title: 'Płytki', type: 'tiles', _status: 'draft' },
      draft: true,
      ...as(f.users.editor),
    })
    expect((await payload.find({ collection: 'calculators', ...as() })).totalDocs).toBe(0)
    await expect(
      payload.update({
        collection: 'calculators',
        id: draft.id,
        data: { _status: 'published' },
        ...as(f.users.editor),
      }),
    ).rejects.toThrow(/Rodzaj/)
    await payload.update({
      collection: 'calculators',
      id: draft.id,
      data: { _status: 'published', tiles: { wastePercent: 10 } },
      ...as(f.users.editor),
    })
    expect((await payload.find({ collection: 'calculators', ...as() })).totalDocs).toBe(1)
    await expect(
      payload.create({
        collection: 'calculators',
        data: { title: 'Farba', type: 'paint' },
        draft: true,
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
  })

  it('kategorie i wstępy lokalne: odczyt publiczny, zapis tylko redakcja', async () => {
    const category = await payload.create({
      collection: 'articleCategories',
      data: { name: 'Łazienka' },
      ...as(f.users.editor),
    })
    expect(category.slug).toBe('lazienka')
    expect((await payload.find({ collection: 'articleCategories', ...as() })).totalDocs).toBe(1)
    await expect(
      payload.create({ collection: 'articleCategories', data: { name: 'Spam' }, ...as(f.users.a) }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'articleCategories',
        data: { name: 'Spam' },
        ...as(f.users.moderator),
      }),
    ).rejects.toThrow()
  })

  it('strona nie zajmie adresu usługi ani trasy aplikacji, usługa – adresu strony', async () => {
    const service = await payload.create({
      collection: 'services',
      data: { name: 'Cyklinowanie testowe' },
      ...system,
    })
    await expect(
      payload.create({
        collection: 'pages',
        data: { title: 'Strona', slug: service.slug, _status: 'published' },
        ...as(f.users.editor),
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'pages',
        data: { title: 'Szukaj', _status: 'published' },
        ...as(f.users.editor),
      }),
    ).rejects.toThrow()
    await payload.create({
      collection: 'pages',
      data: { title: 'Cennik usług', _status: 'published' },
      ...as(f.users.editor),
    })
    await expect(
      payload.create({ collection: 'services', data: { name: 'Cennik usług' }, ...system }),
    ).rejects.toThrow()
  })

  it('dokument prawny wymaga wersji i daty; wersja trafia do zgód', async () => {
    const { currentLegalVersion, consentVersion } = await import('../../lib/legal')
    expect(await currentLegalVersion(payload, 'terms')).toBe('brak')
    await expect(
      payload.create({
        collection: 'pages',
        data: { title: 'Regulamin', legalKind: 'terms', _status: 'published' },
        ...as(f.users.editor),
      }),
    ).rejects.toThrow()
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Polityka prywatności',
        legalKind: 'privacy',
        legalVersion: '1.2',
        effectiveFrom: new Date().toISOString(),
        _status: 'published',
      },
      ...as(f.users.editor),
    })
    expect(await currentLegalVersion(payload, 'privacy')).toBe('1.2')
    expect(await consentVersion(payload, 'inquiry')).toBe('zapytanie-1/pp-1.2')
  })

  it('ustawień nie czyta gość ani firma, zmienia tylko administrator', async () => {
    await expect(payload.findGlobal({ slug: 'settings', ...as() })).rejects.toThrow()
    await expect(payload.findGlobal({ slug: 'settings', ...as(f.users.a) })).rejects.toThrow()
    await expect(
      payload.updateGlobal({
        slug: 'settings',
        data: { reviewDelayDays: 1 },
        ...as(f.users.moderator),
      }),
    ).rejects.toThrow()
  })

  it('dziennika zmian nie da się zmienić', async () => {
    const [entry] = (await payload.find({ collection: 'auditLog', limit: 1, ...system })).docs
    await expect(
      payload.update({
        collection: 'auditLog',
        id: entry!.id,
        data: { action: 'create' },
        ...system,
      }),
    ).rejects.toThrow()
  })
})

describe('forum (tylko zweryfikowane, aktywne firmy)', () => {
  /** Próba podszycia się pod inne konto – hook i tak zapisze zalogowaną firmę. */
  const spoofedAuthor = {
    relationTo: 'firmAccounts',
    value: '00000000-0000-4000-8000-000000000000',
  } as const
  let categoryId: string
  let threadId: string

  beforeAll(async () => {
    categoryId = (
      await payload.create({
        collection: 'forumCategories',
        data: { name: 'Glazura' },
        ...as(f.users.moderator),
      })
    ).id
    const thread = await payload.create({
      collection: 'forumThreads',
      data: {
        category: categoryId,
        title: 'Jaki klej do gresu?',
        body: 'Pytanie o klej do dużych formatów.',
        status: 'visible',
        author: spoofedAuthor,
      },
      ...as(f.users.a),
    })
    threadId = thread.id
  })

  it('nowy wątek czeka na moderację, autorem jest zalogowana firma', async () => {
    const thread = await payload.findByID({
      collection: 'forumThreads',
      id: threadId,
      depth: 0,
      ...as(f.users.a),
    })
    expect(thread.status).toBe('pending')
    expect(thread.author).toEqual({ relationTo: 'firmAccounts', value: f.users.a.id })
  })

  it('gość, redaktor i firma zawieszona nie czytają forum', async () => {
    for (const user of [undefined, f.users.editor, f.users.c]) {
      await expect(payload.find({ collection: 'forumCategories', ...as(user) })).rejects.toThrow()
    }
  })

  it('firma B nie widzi cudzego wątku przed akceptacją, potem tak', async () => {
    expect((await payload.find({ collection: 'forumThreads', ...as(f.users.b) })).totalDocs).toBe(0)
    await payload.update({
      collection: 'forumThreads',
      id: threadId,
      data: { status: 'visible' },
      ...as(f.users.moderator),
    })
    expect((await payload.find({ collection: 'forumThreads', ...as(f.users.b) })).totalDocs).toBe(1)
    await expect(
      payload.update({
        collection: 'forumThreads',
        id: threadId,
        data: { title: 'Przejęty' },
        ...as(f.users.b),
      }),
    ).rejects.toThrow()
  })

  it('blokada forum odcina firmę, reakcja „Pomocne” raz na post', async () => {
    const post = await payload.create({
      collection: 'forumPosts',
      data: { thread: threadId, body: 'Klej C2TE S1.', status: 'visible', author: spoofedAuthor },
      ...as(f.users.a),
    })
    await payload.create({
      collection: 'forumReactions',
      data: { post: post.id, type: 'helpful', account: f.users.a.id },
      ...as(f.users.b),
    })
    await expect(
      payload.create({
        collection: 'forumReactions',
        data: { post: post.id, type: 'helpful', account: f.users.a.id },
        ...as(f.users.b),
      }),
    ).rejects.toThrow()

    await payload.create({
      collection: 'sanctions',
      data: { account: f.users.b.id, scope: 'forum', type: 'ban', reason: 'Spam' },
      ...as(f.users.moderator),
    })
    await expect(payload.find({ collection: 'forumThreads', ...as(f.users.b) })).rejects.toThrow()
    const sanctions = await payload.find({ collection: 'sanctions', depth: 0, ...as(f.users.b) })
    expect(sanctions.docs[0]?.createdBy).toBe(f.users.moderator.id)
    expect((await payload.find({ collection: 'sanctions', ...as(f.users.a) })).totalDocs).toBe(0)
  })

  it('wyłączona flaga forum odcina wszystkie firmy', async () => {
    await payload.updateGlobal({
      slug: 'settings',
      data: { featureFlags: { forum: false } },
      ...system,
    })
    await expect(payload.find({ collection: 'forumThreads', ...as(f.users.a) })).rejects.toThrow()
    await payload.updateGlobal({
      slug: 'settings',
      data: { featureFlags: { forum: true } },
      ...system,
    })
  })
})

describe('giełda', () => {
  let listingId: string

  beforeAll(async () => {
    const listing = await payload.create({
      collection: 'listings',
      data: {
        type: 'sell',
        category: 'power_tools',
        title: 'Szlifierka do gładzi',
        description: 'Mało używana.',
        serialNumber: 'SN-123',
        status: 'pending',
        firm: f.firmB.id,
      },
      depth: 0,
      ...as(f.users.a),
    })
    listingId = listing.id
  })

  it('ogłoszenie zapisuje się na firmę autora, numer seryjny czyta tylko moderacja', async () => {
    const own = await payload.findByID({
      collection: 'listings',
      id: listingId,
      depth: 0,
      ...as(f.users.a),
    })
    expect(own.firm).toBe(f.firmA.id)
    expect(own.serialNumber).toBeUndefined()
    expect(await rawColumn('listings', 'serial_number', listingId)).toMatch(/^enc:v1:/)
    const moderated = await payload.findByID({
      collection: 'listings',
      id: listingId,
      ...as(f.users.moderator),
    })
    expect(moderated.serialNumber).toBe('SN-123')
  })

  it('firma nie aktywuje ogłoszenia sama, inna firma nie widzi oczekującego', async () => {
    await expect(
      payload.update({
        collection: 'listings',
        id: listingId,
        data: { status: 'active' },
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
    await expect(
      payload.findByID({ collection: 'listings', id: listingId, ...as(f.users.b) }),
    ).rejects.toThrow()
    await payload.update({
      collection: 'listings',
      id: listingId,
      data: { status: 'active' },
      ...as(f.users.moderator),
    })
    await expect(
      payload.findByID({ collection: 'listings', id: listingId, ...as(f.users.b) }),
    ).resolves.toBeTruthy()
  })

  it('wiadomość czyta nadawca i sprzedający, nikt inny', async () => {
    await payload.updateGlobal({
      slug: 'settings',
      data: { featureFlags: { marketplace: true } },
      ...system,
    })
    const message = await payload.create({
      collection: 'listingMessages',
      data: { listing: listingId, body: 'Czy aktualne? Odbiór w Łodzi.', fromFirm: f.firmA.id },
      depth: 0,
      ...as(f.users.b),
    })
    expect(message.fromFirm).toBe(f.firmB.id)
    await expect(
      payload.findByID({ collection: 'listingMessages', id: message.id, ...as(f.users.a) }),
    ).resolves.toBeTruthy()
    await expect(
      payload.findByID({ collection: 'listingMessages', id: message.id, ...as(f.users.c) }),
    ).rejects.toThrow()
  })
})

describe('zgłoszenia i statystyki', () => {
  it('zgłoszenie tworzy tylko system; dane zgłaszającego zaszyfrowane i widoczne dla moderacji', async () => {
    const data = {
      targetType: 'firms',
      targetId: f.firmA.id,
      reason: 'fake',
      reporterEmail: 'zglaszajacy@example.com',
      goodFaithConfirmed: true,
      status: 'new',
    } as const
    await expect(payload.create({ collection: 'reports', data, ...as() })).rejects.toThrow()
    const report = await payload.create({ collection: 'reports', data, ...system })
    expect(await rawColumn('reports', 'reporter_email', report.id)).toMatch(/^enc:v1:/)
    expect(
      (await payload.findByID({ collection: 'reports', id: report.id, ...as(f.users.moderator) }))
        .reporterEmail,
    ).toBe('zglaszajacy@example.com')
    await expect(
      payload.findByID({ collection: 'reports', id: report.id, ...as(f.users.editor) }),
    ).rejects.toThrow()
    const decided = await payload.update({
      collection: 'reports',
      id: report.id,
      data: { status: 'resolved', statementOfReasons: 'Brak naruszenia.' },
      depth: 0,
      ...as(f.users.moderator),
    })
    expect(decided.decidedBy).toBe(f.users.moderator.id)
  })

  it('firma czyta tylko swoje statystyki i ich nie zapisuje', async () => {
    await payload.create({
      collection: 'firmStatsDaily',
      data: { firm: f.firmB.id, date: '2026-10-01', views: 10 },
      ...system,
    })
    expect((await payload.find({ collection: 'firmStatsDaily', ...as(f.users.a) })).totalDocs).toBe(
      0,
    )
    expect((await payload.find({ collection: 'firmStatsDaily', ...as(f.users.b) })).totalDocs).toBe(
      1,
    )
    await expect(
      payload.create({
        collection: 'firmStatsDaily',
        data: { firm: f.firmA.id, date: '2026-10-01' },
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'firmStatsDaily',
        data: { firm: f.firmB.id, date: '2026-10-01' },
        ...system,
      }),
    ).rejects.toThrow()
  })
})

describe('słowniki', () => {
  it('gość czyta usługi i miejscowości, zmienia je tylko administrator', async () => {
    await payload.create({
      collection: 'services',
      data: { name: 'Glazurnik' },
      ...as(f.users.admin),
    })
    await expect(
      payload.find({ collection: 'services', where: { name: { equals: 'Glazurnik' } }, ...as() }),
    ).resolves.toMatchObject({ totalDocs: 1 })
    await expect(
      payload.create({ collection: 'services', data: { name: 'Spam' }, ...as(f.users.editor) }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'localities',
        data: { terytId: '0000001', name: 'Łódź', type: 'miejscowosc' },
        ...as(f.users.a),
      }),
    ).rejects.toThrow()
  })

  it('usługa nie zajmie adresu strony serwisu', async () => {
    await expect(
      payload.create({ collection: 'services', data: { name: 'Forum' }, ...system }),
    ).rejects.toThrow()
  })
})

describe('rotacja klucza', () => {
  it('przepisuje wartości nowym kluczem, a stare nadal da się odczytać', async () => {
    const before = { ...process.env }
    const lead = await payload.create({
      collection: 'leads',
      data: {
        email: 'rotacja@example.com',
        consentTextVersion: '1',
        consentAt: new Date().toISOString(),
        status: 'new',
      },
      ...system,
    })
    Object.assign(process.env, {
      DATA_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
      DATA_ENCRYPTION_KEY_VERSION: '2',
      DATA_ENCRYPTION_KEYS_PREVIOUS: `1:${before.DATA_ENCRYPTION_KEY}`,
    })
    try {
      expect(await rotateEncryptedFields(payload)).toBeGreaterThan(0)
      expect(await rawColumn('leads', 'email', lead.id)).toMatch(/^enc:v2:/)
      expect(await rawColumn('staff', 'totp_secret', f.users.editor.id)).toMatch(/^enc:v2:/)
      expect((await payload.findByID({ collection: 'leads', id: lead.id, ...system })).email).toBe(
        'rotacja@example.com',
      )
      expect(await rotateEncryptedFields(payload)).toBe(0)
    } finally {
      for (const key of [
        'DATA_ENCRYPTION_KEY',
        'DATA_ENCRYPTION_KEY_VERSION',
        'DATA_ENCRYPTION_KEYS_PREVIOUS',
      ]) {
        if (before[key] === undefined) delete process.env[key]
        else process.env[key] = before[key]
      }
    }
  })
})
