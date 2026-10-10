import type { Payload, Where } from 'payload'

import { idOf } from '@/access'
import { lexicalText } from '@/lib/content/text'
import { formatInstantDate } from '@/lib/format/date'
import type { Firm, Report, Review } from '@/payload-types'

import { type QueueTab, REPORT_REASONS, REPORT_TARGETS, type ReportTarget } from './options'

/**
 * Kolejka centrum moderacji (SPEC 3.11): dane kart bez danych osobowych zgłaszających
 * (e-mail zgłaszającego zostaje w rekordzie, moderator go nie potrzebuje do decyzji).
 */
const system = { overrideAccess: true, depth: 0 } as const
const PAGE = 20

const WAITING: Record<QueueTab, { collection: 'firms' | 'reviews' | 'reports'; where: Where }> = {
  firmy: { collection: 'firms', where: { status: { equals: 'pending_review' } } },
  opinie: { collection: 'reviews', where: { status: { equals: 'pending' } } },
  zgloszenia: { collection: 'reports', where: { status: { in: ['new', 'in_review'] } } },
}

export async function pendingCounts(payload: Payload) {
  const [firms, reviews, reports] = await Promise.all(
    (Object.keys(WAITING) as QueueTab[]).map((tab) =>
      payload.count({ collection: WAITING[tab].collection, where: WAITING[tab].where, ...system }),
    ),
  )
  return { firms: firms!.totalDocs, reviews: reviews!.totalDocs, reports: reports!.totalDocs }
}

export type Fact = { label: string; value: string }

/** Konto firmy jako kontekst decyzji: do sankcji i historii (bez adresu e-mail). */
export type AccountContext = { id: string; label: string; sanctions: number }

export type QueueItem = {
  kind: 'firm' | 'review' | 'report'
  id: string
  title: string
  subtitle: string
  body: string | null
  facts: Fact[]
  links: { label: string; href: string }[]
  accounts: AccountContext[]
  /** Wcześniejsze decyzje dotyczące tej samej treści. */
  history: number
  appeal: boolean
  target?: { type: ReportTarget; id: string }
}

async function accountsOf(payload: Payload, firmId: string): Promise<AccountContext[]> {
  const { docs } = await payload.find({
    collection: 'firmAccounts',
    where: { firm: { equals: firmId } },
    select: { createdAt: true },
    pagination: false,
    ...system,
  })
  return Promise.all(
    docs.map(async (account, index) => ({
      id: account.id,
      label: `Konto ${index + 1} (od ${formatInstantDate(account.createdAt)})`,
      sanctions: (
        await payload.count({
          collection: 'sanctions',
          where: { account: { equals: account.id } },
          ...system,
        })
      ).totalDocs,
    })),
  )
}

const decisionsFor = async (payload: Payload, targetId: string, except?: string) =>
  (
    await payload.count({
      collection: 'reports',
      where: {
        targetId: { equals: targetId },
        status: { in: ['resolved', 'rejected'] },
        ...(except ? { id: { not_equals: except } } : {}),
      },
      ...system,
    })
  ).totalDocs

const names = (items: unknown) =>
  (Array.isArray(items) ? items : [])
    .map((item) => (item && typeof item === 'object' && 'name' in item ? String(item.name) : null))
    .filter(Boolean)
    .join(', ')

async function firmItem(payload: Payload, firm: Firm): Promise<QueueItem> {
  const base = typeof firm.baseLocality === 'object' ? firm.baseLocality?.name : null
  return {
    kind: 'firm',
    id: firm.id,
    title: firm.name,
    subtitle: `Wysłany ${formatInstantDate(firm.updatedAt)}`,
    body: [firm.shortDescription, lexicalText(firm.about)].filter(Boolean).join('\n\n') || null,
    facts: [
      { label: 'NIP', value: firm.nip },
      {
        label: 'Rejestr',
        value: firm.registryVerifiedAt
          ? `${(firm.registrySource ?? '').toUpperCase()} – zweryfikowany`
          : 'niezweryfikowany',
      },
      { label: 'Siedziba', value: base ?? '–' },
      { label: 'Usługi', value: names(firm.services) || '–' },
      { label: 'Telefon', value: firm.phone ?? '–' },
    ],
    links: [{ label: 'Pełny profil w panelu', href: `/admin/collections/firms/${firm.id}` }],
    accounts: await accountsOf(payload, firm.id),
    history: await decisionsFor(payload, firm.id),
    appeal: false,
  }
}

async function reviewItem(review: Review): Promise<QueueItem> {
  const firm = typeof review.firm === 'object' ? review.firm : null
  return {
    kind: 'review',
    id: review.id,
    title: `${review.rating}/5 · ${firm?.name ?? 'firma'}`,
    subtitle: `${review.authorDisplayName} · ${formatInstantDate(review.createdAt)}`,
    body: [review.title, review.body].filter(Boolean).join('\n\n'),
    facts: [],
    links: firm?.slug ? [{ label: 'Profil firmy', href: `/firma/${firm.slug}` }] : [],
    accounts: [],
    history: 0,
    appeal: false,
  }
}

/** Podgląd zgłoszonej treści – tylko to, co moderator musi zobaczyć. */
async function targetPreview(payload: Payload, type: ReportTarget, id: string) {
  const find = (collection: 'firms' | 'reviews' | 'articles') =>
    payload.findByID({ collection, id, ...system, depth: 1, disableErrors: true })
  if (type === 'firms') {
    const firm = (await find('firms')) as Firm | null
    if (!firm) return null
    return {
      body: firm.shortDescription ?? null,
      facts: [{ label: 'Status profilu', value: firm.status }],
      links: [{ label: 'Profil', href: `/firma/${firm.slug}` }],
      firmId: firm.id,
    }
  }
  if (type === 'reviews') {
    const review = (await find('reviews')) as Review | null
    if (!review) return null
    const firm = typeof review.firm === 'object' ? review.firm : null
    return {
      body: review.body,
      facts: [
        { label: 'Ocena', value: `${review.rating}/5` },
        { label: 'Status opinii', value: review.status },
      ],
      links: firm?.slug ? [{ label: 'Profil firmy', href: `/firma/${firm.slug}` }] : [],
      firmId: null,
    }
  }
  if (type === 'articles') {
    const article = await payload.findByID({
      collection: 'articles',
      id,
      ...system,
      disableErrors: true,
    })
    if (!article) return null
    return {
      body: article.excerpt ?? null,
      facts: [],
      links: [{ label: 'Artykuł', href: `/artykuly/${article.slug}` }],
      firmId: null,
    }
  }
  return null
}

async function reportItem(payload: Payload, report: Report): Promise<QueueItem> {
  const type = report.targetType as ReportTarget
  const preview = await targetPreview(payload, type, report.targetId)
  const appeal = report.reason === 'appeal'
  const original = appeal ? idOf(report.appealOf) : null
  return {
    kind: 'report',
    id: report.id,
    title: report.targetTitle || REPORT_TARGETS[type],
    subtitle: `${REPORT_TARGETS[type]} · ${formatInstantDate(report.createdAt)}`,
    body: report.description ?? null,
    facts: [
      { label: 'Powód', value: REPORT_REASONS[report.reason as keyof typeof REPORT_REASONS] },
      ...(preview?.body ? [{ label: 'Zgłoszona treść', value: preview.body }] : []),
      ...(preview?.facts ?? []),
      ...(preview ? [] : [{ label: 'Treść', value: 'usunięta lub niedostępna' }]),
    ],
    links: [
      ...(preview?.links ?? []),
      ...(original
        ? [
            {
              label: 'Decyzja, od której się odwołano',
              href: `/admin/collections/reports/${original}`,
            },
          ]
        : []),
    ],
    accounts: preview?.firmId ? await accountsOf(payload, preview.firmId) : [],
    history: await decisionsFor(payload, report.targetId, report.id),
    appeal,
    target: { type, id: report.targetId },
  }
}

/** Najstarsze najpierw – kolejka, nie skrzynka (SPEC 3.11). */
/** Zawężenie kolejki: profile po nazwie lub NIP, zgłoszenia po tym, czego dotyczą. */
function searchWhere(tab: QueueTab, query: string): Where | null {
  const q = query.trim().slice(0, 80)
  if (!q) return null
  if (tab === 'firmy')
    return { or: [{ name: { like: q } }, { nip: { equals: q.replace(/\D/g, '') } }] }
  if (tab === 'zgloszenia') return { targetTitle: { like: q } }
  return { 'firm.name': { like: q } }
}

export async function loadQueue(payload: Payload, tab: QueueTab, page = 1, query = '') {
  const { collection, where } = WAITING[tab]
  const search = searchWhere(tab, query)
  const result = await payload.find({
    collection,
    where: search ? { and: [where, search] } : where,
    sort: 'createdAt',
    limit: PAGE,
    page,
    ...system,
    depth: 1,
  })
  const items = await Promise.all(
    result.docs.map((doc) =>
      collection === 'firms'
        ? firmItem(payload, doc as Firm)
        : collection === 'reviews'
          ? reviewItem(doc as Review)
          : reportItem(payload, doc as Report),
    ),
  )
  return {
    items,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? 1,
  }
}
