/**
 * Świat przykładowy (tylko lokalna baza, `pnpm seed demo`): firmy z realizacjami, zdjęciami
 * i opiniami, artykuły z okładkami, opublikowane kalkulatory i dokumenty. Idempotentny – istniejących
 * rekordów nie dubluje. Administrator usuwa firmy w /admin (razem z ich treściami).
 */
import type { Payload } from 'payload'

import { addDays, todayInWarsaw } from '@/lib/format/date'
import { isValidNip } from '@/lib/validation'

import { SEED_ARTICLES, SEED_CATEGORIES } from './articles'
import { type CalculatorType, type DocRefs, lexical, toBlocks } from './doc'
import { DEMO_FIRMS, type DemoFirm } from './firms'
import { SEED_PAGES } from './pages'
import { photoFile, photoPicker, SERVICE_PHOTO_KIND } from './photos'

const system = { overrideAccess: true, depth: 0 } as const
const DAY_MS = 24 * 60 * 60 * 1000
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString()

const paragraphs = (texts: readonly string[]) =>
  lexical(
    texts.map((text) => ({
      type: 'paragraph',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      children: [
        { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' },
      ],
    })),
  )

const LOCALITY_SLUGS = new Set([
  'lodz',
  ...DEMO_FIRMS.flatMap((firm) => [
    firm.baseLocality,
    ...firm.serviceArea,
    ...firm.projects.map((project) => project.locality),
  ]),
  ...SEED_ARTICLES.flatMap((article) =>
    article.parts.flatMap((part) =>
      'firms' in part && part.firms.locality ? [part.firms.locality] : [],
    ),
  ),
])

/** Id usług, miejscowości i kalkulatorów po slugach – dla bloków i relacji. */
async function loadRefs(payload: Payload): Promise<DocRefs> {
  const [services, localities, calculators] = await Promise.all([
    payload.find({ collection: 'services', pagination: false, ...system }),
    payload.find({
      collection: 'localities',
      where: { slug: { in: [...LOCALITY_SLUGS] } },
      pagination: false,
      ...system,
    }),
    payload.find({ collection: 'calculators', pagination: false, draft: true, ...system }),
  ])
  return {
    services: Object.fromEntries(services.docs.map((doc) => [doc.slug, doc.id])),
    localities: Object.fromEntries(localities.docs.map((doc) => [doc.slug, doc.id])),
    calculators: Object.fromEntries(calculators.docs.map((doc) => [doc.type, doc.id])) as Partial<
      Record<CalculatorType, string>
    >,
  }
}

/** NIP-y z prefiksem 000 (taki urząd skarbowy nie istnieje) – nie trafimy w prawdziwą firmę. */
function demoNips(count: number): string[] {
  const nips: string[] = []
  for (let n = 2_000_000; nips.length < count; n += 1) {
    const nip = String(n).padStart(10, '0')
    if (isValidNip(nip)) nips.push(nip)
  }
  return nips
}

async function uploadPhoto(
  payload: Payload,
  id: number,
  data: { alt: string; purpose: 'project' | 'article'; firm?: string },
) {
  const file = await photoFile(id)
  if (!file) return null
  const media = await payload.create({ collection: 'media', data, file, ...system })
  return media.id
}

async function createFirm(
  payload: Payload,
  firm: DemoFirm,
  nip: string,
  index: number,
  refs: DocRefs,
  pick: ReturnType<typeof photoPicker>,
) {
  const ids = (slugs: readonly string[], map: Record<string, string>) =>
    slugs.map((slug) => map[slug]).filter((id): id is string => Boolean(id))
  const today = todayInWarsaw()
  const created = await payload.create({
    collection: 'firms',
    data: {
      name: firm.name,
      nip,
      status: 'active',
      subscriptionStatus: 'trial',
      registryVerifiedAt: new Date().toISOString(),
      shortDescription: firm.shortDescription,
      about: paragraphs(firm.about),
      services: ids(firm.services, refs.services),
      serviceArea: ids(firm.serviceArea, refs.localities),
      baseLocality: refs.localities[firm.baseLocality],
      phone: `600 2${String(index).padStart(2, '0')} 3${String(index).padStart(2, '0')}`,
      yearsExperience: firm.yearsExperience,
      teamSize: firm.teamSize,
      warrantyMonths: firm.warrantyMonths,
      vatInvoice: firm.vatInvoice,
      availability: {
        date: firm.availabilityDays === null ? null : addDays(today, firm.availabilityDays),
      },
    },
    context: { confirmAvailability: true },
    ...system,
  })

  for (const [order, project] of firm.projects.entries()) {
    const photos: string[] = []
    for (const [n, photo] of pick(project.photoKind, project.photos).entries()) {
      const media = await uploadPhoto(payload, photo, {
        alt: `${project.title} – zdjęcie ${n + 1}`,
        purpose: 'project',
        firm: created.id,
      })
      if (media) photos.push(media)
    }
    await payload.create({
      collection: 'projects',
      data: {
        firm: created.id,
        title: project.title,
        service: refs.services[project.service],
        locality: refs.localities[project.locality],
        completedMonth: project.completedMonth,
        description: project.description,
        images: photos,
        order,
        status: 'published',
      },
      ...system,
    })
  }

  for (const [n, review] of firm.reviews.entries()) {
    const firstName = review.author.split(',')[0]!.trim()
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        firm: created.id,
        service: refs.services[firm.services[0]!],
        description: `Zapytanie przykładowe do firmy ${firm.name}.`,
        clientName: firstName,
        clientEmail: `klient-${index}-${n}@example.com`,
        consentTextVersion: 'demo',
        consentAt: daysAgo(review.daysAgo + 30),
        status: 'closed',
      },
      ...system,
    })
    const doc = await payload.create({
      collection: 'reviews',
      data: {
        firm: created.id,
        inquiry: inquiry.id,
        rating: review.rating,
        body: review.body,
        authorDisplayName: review.author,
        firmReply: review.reply,
        status: 'approved',
      },
      ...system,
    })
    // Data publikacji w przeszłości – hook ustawia ją tylko przy pierwszej akceptacji.
    await payload.update({
      collection: 'reviews',
      id: doc.id,
      data: {
        publishedAt: daysAgo(review.daysAgo),
        firmReplyAt: review.reply ? daysAgo(Math.max(review.daysAgo - 2, 1)) : null,
      },
      ...system,
    })
  }
}

export async function seedDemoFirms(payload: Payload, refs: DocRefs) {
  const nips = demoNips(DEMO_FIRMS.length)
  const pick = photoPicker()
  let created = 0
  for (const [index, firm] of DEMO_FIRMS.entries()) {
    const exists = await payload.count({
      collection: 'firms',
      where: { nip: { equals: nips[index] } },
      ...system,
    })
    if (exists.totalDocs) continue
    await createFirm(payload, firm, nips[index]!, index, refs, pick)
    created += 1
    process.stdout.write(`  firma ${created}: ${firm.name}\n`)
  }
  return created
}

export async function seedDemoArticles(payload: Payload, refs: DocRefs) {
  const categories: Record<string, string> = {}
  for (const category of SEED_CATEGORIES) {
    const { docs } = await payload.find({
      collection: 'articleCategories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      ...system,
    })
    categories[category.slug] =
      docs[0]?.id ??
      (await payload.create({ collection: 'articleCategories', data: category, ...system })).id
  }

  const pick = photoPicker()
  let created = 0
  for (const article of SEED_ARTICLES) {
    const exists = await payload.count({
      collection: 'articles',
      where: { slug: { equals: article.slug } },
      ...system,
    })
    if (exists.totalDocs) continue
    const kind = SERVICE_PHOTO_KIND[article.relatedServices[0] ?? ''] ?? 'renovation'
    const [photo] = pick(kind, 1)
    const cover = photo
      ? await uploadPhoto(payload, photo, { alt: article.title, purpose: 'article' })
      : null
    await payload.create({
      collection: 'articles',
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        category: categories[article.category],
        tags: article.tags,
        authorName: 'Redakcja Ekipy na Termin',
        relatedServices: article.relatedServices
          .map((slug) => refs.services[slug])
          .filter((id): id is string => Boolean(id)),
        cover,
        publishedAt: daysAgo(article.daysAgo),
        content: toBlocks(article.parts, refs) as never,
        _status: 'published',
      },
      ...system,
    })
    created += 1
  }
  return created
}

/** Parametry testowe kalkulatorów – tylko lokalnie; na produkcji wpisuje je redakcja. */
const DEMO_PARAMS = {
  bathroomCost: {
    labourPerM2: { min: 100_000, max: 180_000 },
    materialsPerM2: { min: 80_000, max: 200_000 },
  },
  tiles: { wastePercent: 10 },
  paint: { coverageM2PerLitre: 10, coats: 2, wastePercent: 10 },
  skimCoat: { kgPerM2PerMm: 1, bagKg: 20, labourPerM2: { min: 2_500, max: 4_500 } },
} as const

export async function publishDemoCalculators(payload: Payload) {
  const { docs } = await payload.find({
    collection: 'calculators',
    draft: true,
    pagination: false,
    ...system,
  })
  let published = 0
  for (const calculator of docs) {
    if (calculator._status === 'published') continue
    await payload.update({
      collection: 'calculators',
      id: calculator.id,
      data: { [calculator.type]: DEMO_PARAMS[calculator.type], _status: 'published' },
      ...system,
    })
    published += 1
  }
  return published
}

/** Dokumenty i strony: treść z `pages.ts`; nie nadpisuje stron już opublikowanych w panelu. */
export async function publishDemoPages(payload: Payload, refs: DocRefs) {
  let published = 0
  for (const page of SEED_PAGES) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      draft: true,
      limit: 1,
      ...system,
    })
    if (docs[0]?._status === 'published') continue
    const data = {
      title: page.title,
      slug: page.slug,
      legalKind: page.legalKind,
      legalVersion: page.legalVersion,
      effectiveFrom: page.effectiveFrom,
      content: toBlocks(page.parts, refs) as never,
      _status: 'published' as const,
    }
    if (docs[0]) await payload.update({ collection: 'pages', id: docs[0].id, data, ...system })
    else await payload.create({ collection: 'pages', data, ...system })
    published += 1
  }
  return published
}

export async function seedDemoWorld(payload: Payload) {
  const refs = await loadRefs(payload)
  return {
    // Najpierw kalkulatory: bloki artykułów pokazują tylko opublikowane.
    'kalkulatory opublikowane': await publishDemoCalculators(payload),
    'strony opublikowane': await publishDemoPages(payload, refs),
    'firmy ze zdjęciami': await seedDemoFirms(payload, refs),
    'artykuły poradnika': await seedDemoArticles(payload, refs),
  }
}
