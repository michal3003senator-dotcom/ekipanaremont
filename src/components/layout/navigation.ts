import { cache } from 'react'

import { calculatorsEnabled, listCalculators } from '@/lib/content/calculators'
import { publishedPageSlugs } from '@/lib/content/pages'
import { localPagePairs } from '@/lib/local-pages'
import { publicContext } from '@/lib/search/context'

import { LEGAL_NAV, type NavLink, SITE_NAV } from './nav'

/** Menu: Poradnik i Kalkulatory tylko wtedy, gdy jest co pokazać (bez pustych działów). */
export const siteNav = cache(async (): Promise<NavLink[]> => {
  const { payload } = await publicContext()
  const [articles, calculators] = await Promise.all([
    payload.count({
      collection: 'articles',
      where: { _status: { equals: 'published' } },
      overrideAccess: false,
    }),
    calculatorsEnabled().then((enabled) => (enabled ? listCalculators(payload) : [])),
  ])
  const [search, ...rest] = SITE_NAV
  return [
    search!,
    ...(articles.totalDocs > 0 ? [{ href: '/artykuly', label: 'Poradnik' }] : []),
    ...(calculators.length > 0 ? [{ href: '/kalkulatory', label: 'Kalkulatory' }] : []),
    ...rest,
  ]
})

/** Stopka: tylko opublikowane strony (regulamin, polityka, …). */
export const footerNav = cache(async (): Promise<NavLink[]> => {
  const { payload } = await publicContext()
  const published = await publishedPageSlugs(payload)
  return LEGAL_NAV.filter((link) => published.has(link.href.slice(1)))
})

export type NavGroup = { title: string; links: NavLink[] }

/** Kategorie poradnika z co najmniej jednym opublikowanym artykułem. */
const categoryLinks = cache(async (): Promise<NavLink[]> => {
  const { payload } = await publicContext()
  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    select: { category: true },
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  const ids = [...new Set(articles.map((article) => article.category).filter(Boolean))]
  if (!ids.length) return []
  const { docs } = await payload.find({
    collection: 'articleCategories',
    where: { id: { in: ids } },
    sort: 'name',
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return docs.map((category) => ({
    href: `/artykuly/kategoria/${category.slug}`,
    label: category.name,
  }))
})

const POPULAR_LIMIT = 6

/** Usługi ze stroną lokalną dla Łodzi (co najmniej jedna aktywna firma). */
const popularInLodz = cache(async (): Promise<NavLink[]> => {
  const { payload } = await publicContext()
  const slugs = (await localPagePairs(payload))
    .filter((pair) => pair.locality === 'lodz')
    .map((pair) => pair.service)
  if (!slugs.length) return []
  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { in: slugs } },
    sort: 'name',
    limit: POPULAR_LIMIT,
    depth: 0,
    overrideAccess: false,
  })
  return docs.map((service) => ({ href: `/${service.slug}/lodz`, label: service.name }))
})

/** Stopka w kolumnach – puste grupy znikają. */
export const footerGroups = cache(async (): Promise<NavGroup[]> => {
  const [site, categories, popular, info] = await Promise.all([
    siteNav(),
    categoryLinks(),
    popularInLodz(),
    footerNav(),
  ])
  return [
    { title: 'Serwis', links: site },
    { title: 'Poradnik', links: categories },
    { title: 'Popularne w Łodzi', links: popular },
    { title: 'Informacje', links: info },
  ].filter((group) => group.links.length > 0)
})
