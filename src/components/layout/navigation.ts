import { cache } from 'react'

import { calculatorsEnabled, listCalculators } from '@/lib/content/calculators'
import { publishedPageSlugs } from '@/lib/content/pages'
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
