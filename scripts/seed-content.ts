/**
 * Treści startowe (faza 6): szkice kalkulatorów (bez cen) i stron (dokumenty do przeglądu przez
 * prawnika) – redakcja uzupełnia je w panelu i publikuje. Demo (tylko lokalnie): kategoria i artykuł.
 */
import type { Payload } from 'payload'

import { type DocRefs, toBlocks } from './demo/doc'
import { SEED_PAGES } from './demo/pages'

const system = { overrideAccess: true, depth: 0 } as const
const NO_REFS: DocRefs = { calculators: {}, services: {}, localities: {} }

/** Minimalny dokument Lexical z akapitów. */
export function richText(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [
          { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' },
        ],
      })),
    },
  }
}

async function serviceId(payload: Payload, slug: string) {
  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    ...system,
  })
  return docs[0]?.id
}

const DISCLAIMER = 'Wynik jest orientacyjny. Dokładną cenę poda firma po obejrzeniu pomieszczenia.'

const CALCULATORS = [
  { type: 'bathroomCost', title: 'Kalkulator kosztu remontu łazienki', service: 'remont-lazienki' },
  { type: 'tiles', title: 'Kalkulator płytek', service: 'glazurnik' },
  { type: 'paint', title: 'Kalkulator farby', service: 'malarz' },
  { type: 'skimCoat', title: 'Kalkulator gładzi', service: 'malarz' },
] as const

/** Szkice 4 kalkulatorów bez parametrów (ceny i zużycia wpisuje redakcja, ADR 0022). */
export async function seedCalculators(payload: Payload) {
  let created = 0
  for (const calculator of CALCULATORS) {
    const exists = await payload.count({
      collection: 'calculators',
      where: { type: { equals: calculator.type } },
      ...system,
    })
    if (exists.totalDocs) continue
    await payload.create({
      collection: 'calculators',
      data: {
        title: calculator.title,
        type: calculator.type,
        disclaimer: DISCLAIMER,
        linkedService: await serviceId(payload, calculator.service),
        _status: 'draft',
      },
      draft: true,
      ...system,
    })
    created += 1
  }
  return created
}

/**
 * Szkice stron podlinkowanych w stopce (regulamin, polityka, …) – treść do przeglądu przez prawnika.
 * Stopka pokazuje je dopiero po publikacji w panelu.
 */
export async function seedPages(payload: Payload) {
  let created = 0
  for (const page of SEED_PAGES) {
    const exists = await payload.count({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      ...system,
    })
    if (exists.totalDocs) continue
    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        legalKind: page.legalKind,
        legalVersion: page.legalVersion,
        effectiveFrom: page.effectiveFrom,
        content: toBlocks(page.parts, NO_REFS) as never,
        _status: 'draft',
      },
      draft: true,
      ...system,
    })
    created += 1
  }
  return created
}

/**
 * Demo (tylko lokalna baza): parametry testowe kalkulatora łazienki, kategoria i opublikowany
 * artykuł z blokami – do obejrzenia stron treści. Na produkcji parametry wpisuje redakcja.
 */
export async function seedDemoContent(payload: Payload) {
  const exists = await payload.count({
    collection: 'articles',
    where: { slug: { equals: 'remont-lazienki-od-czego-zaczac' } },
    ...system,
  })
  if (exists.totalDocs) return 'bez zmian'

  const { docs: calculators } = await payload.find({
    collection: 'calculators',
    where: { type: { equals: 'bathroomCost' } },
    draft: true,
    limit: 1,
    ...system,
  })
  const calculator = calculators[0]
  if (calculator) {
    await payload.update({
      collection: 'calculators',
      id: calculator.id,
      data: {
        intro:
          'Podaj powierzchnię podłogi łazienki – pokażemy orientacyjny koszt robocizny i materiałów.',
        // Wartości testowe tylko w lokalnej bazie demo.
        bathroomCost: {
          labourPerM2: { min: 100_000, max: 180_000 },
          materialsPerM2: { min: 80_000, max: 200_000 },
        },
        _status: 'published',
      },
      ...system,
    })
  }

  const category = await payload.create({
    collection: 'articleCategories',
    data: { name: 'Łazienka', description: 'Remont łazienki: planowanie, koszty, wybór ekipy.' },
    ...system,
  })
  const [service, locality] = await Promise.all([
    serviceId(payload, 'remont-lazienki'),
    payload
      .find({ collection: 'localities', where: { slug: { equals: 'lodz' } }, limit: 1, ...system })
      .then(({ docs }) => docs[0]?.id),
  ])

  await payload.create({
    collection: 'articles',
    data: {
      title: 'Remont łazienki: od czego zacząć',
      excerpt:
        'Kolejność prac, rzeczy do ustalenia z ekipą przed startem i pytania, które warto zadać przy wycenie.',
      category: category.id,
      tags: ['łazienka', 'planowanie'],
      authorName: 'Redakcja Ekipy na Termin',
      relatedServices: service ? [service] : [],
      _status: 'published',
      content: [
        {
          blockType: 'text',
          body: richText(
            'Remont łazienki to kilka ekip w jednym pomieszczeniu: hydraulik, elektryk, glazurnik, czasem stolarz. Najwięcej czasu traci się na czekanie między nimi, dlatego zacznij od terminu, a dopiero potem wybieraj płytki.',
          ),
        },
        { blockType: 'heading', text: 'Kolejność prac', level: 'h2' },
        {
          blockType: 'table',
          caption: 'Typowa kolejność prac przy remoncie łazienki',
          header: ['Etap', 'Kto', 'Uwagi'],
          rows: [
            {
              cells: [
                'Skucie płytek i demontaż',
                'ekipa ogólnobudowlana',
                'wywóz gruzu ustal wcześniej',
              ],
            },
            { cells: ['Instalacje', 'hydraulik, elektryk', 'odpływy i podejścia przed tynkiem'] },
            { cells: ['Hydroizolacja', 'glazurnik', 'w strefie prysznica i przy podłodze'] },
            { cells: ['Płytki i fugi', 'glazurnik', 'zostaw zapas płytek na poprawki'] },
            { cells: ['Biały montaż', 'hydraulik', 'na końcu, po fugowaniu'] },
          ],
        },
        ...(calculator ? [{ blockType: 'calculator' as const, calculator: calculator.id }] : []),
        { blockType: 'heading', text: 'Najczęstsze pytania', level: 'h2' },
        {
          blockType: 'faq',
          items: [
            {
              question: 'Czy da się wyremontować łazienkę bez wyprowadzki?',
              answer:
                'Tak, jeśli w mieszkaniu jest druga toaleta albo ekipa zostawi działające WC do ostatnich dni. Ustal to przed podpisaniem umowy.',
            },
            {
              question: 'O co zapytać przy wycenie?',
              answer:
                'O termin rozpoczęcia, czas trwania, co jest w cenie (materiały, wywóz gruzu, sprzątanie) i jak firma rozlicza prace dodatkowe.',
            },
          ],
        },
        { blockType: 'recommendedFirms', service, locality, limit: 3 },
      ],
    },
    ...system,
  })
  return 'utworzone'
}
