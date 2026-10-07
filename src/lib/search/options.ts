import type { Payload } from 'payload'
import { cache } from 'react'

import { idOf } from '@/access'
import { type LocalityOption, toOption } from '@/lib/localities'
import type { Service } from '@/payload-types'

import type { SearchParams } from './params'

export type ServiceOption = { value: string; label: string; description?: string }

/** Wszystkie usługi (kilkadziesiąt) – podpowiedzi filtrowane w przeglądarce bez zapytań. */
export const allServices = cache(async (payload: Payload): Promise<Service[]> => {
  const { docs } = await payload.find({
    collection: 'services',
    depth: 0,
    pagination: false,
    sort: 'name',
    overrideAccess: true,
  })
  return docs
})

export function serviceOptions(services: Service[]): ServiceOption[] {
  const names = new Map(services.map((service) => [service.id, service.name]))
  return services
    .filter((service) => service.slug)
    .map((service) => {
      const parent = idOf(service.parent)
      return {
        value: service.slug!,
        label: service.name,
        description: parent ? names.get(parent) : undefined,
      }
    })
    .sort(
      (a, b) =>
        Number(Boolean(a.description)) - Number(Boolean(b.description)) ||
        a.label.localeCompare(b.label, 'pl'),
    )
}

export type ResolvedSearch = {
  service: Service | null
  /** Podusługi wybranej usługi – opcje filtra „zakres prac”. */
  children: Service[]
  serviceIds?: string[]
  locality: LocalityOption | null
  localityId?: string
}

/** Slugi z adresu → rekordy i id do zapytania (usługa z podusługami albo wybrany zakres). */
export async function resolveSearch(
  payload: Payload,
  params: SearchParams,
): Promise<ResolvedSearch> {
  const services = await allServices(payload)
  const service = services.find((item) => item.slug === params.usluga) ?? null
  const children = service ? services.filter((item) => idOf(item.parent) === service.id) : []
  const scope = children.filter((child) => child.slug && params.zakres?.includes(child.slug))
  const serviceIds = service
    ? (scope.length ? scope : [service, ...children]).map((item) => item.id)
    : undefined

  let locality: LocalityOption | null = null
  if (params.gdzie) {
    const { docs } = await payload.find({
      collection: 'localities',
      where: { slug: { equals: params.gdzie } },
      depth: 2,
      limit: 1,
      overrideAccess: true,
    })
    locality = docs[0] ? { ...toOption(docs[0]), value: docs[0].slug ?? docs[0].id } : null
    return { service, children, serviceIds, locality, localityId: docs[0]?.id }
  }
  return { service, children, serviceIds, locality }
}
