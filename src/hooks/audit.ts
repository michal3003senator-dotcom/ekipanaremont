import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { isFirmUser, isStaffUser } from '@/access'

const IGNORED = new Set(['updatedAt', 'createdAt', 'id', '_status'])

function actorOf(req: PayloadRequest) {
  const { user } = req
  if (!user) return { actor: 'system', actorType: 'system' as const }
  return {
    actor: String(user.id),
    actorType: isStaffUser(user)
      ? ('staff' as const)
      : isFirmUser(user)
        ? ('firm' as const)
        : ('system' as const),
  }
}

/** Nazwy zmienionych pól – bez wartości, więc bez danych osobowych (SPEC 4: auditLog). */
export function changedFields(
  doc: Record<string, unknown>,
  previous: Record<string, unknown> | undefined,
): string[] {
  const keys = new Set([...Object.keys(doc), ...Object.keys(previous ?? {})])
  return [...keys]
    .filter((key) => !IGNORED.has(key))
    .filter((key) => JSON.stringify(doc[key]) !== JSON.stringify(previous?.[key]))
    .sort()
}

/** Dopisuje wpis do auditLog po każdej zmianie (tylko dopisywanie, w tej samej transakcji). */
export const auditChange: CollectionAfterChangeHook = async ({
  collection,
  context,
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (context.skipAudit) return doc
  await req.payload.create({
    collection: 'auditLog',
    data: {
      ...actorOf(req),
      action: operation,
      targetCollection: collection.slug,
      docId: String(doc.id),
      changedFields: operation === 'create' ? [] : changedFields(doc, previousDoc),
    },
    overrideAccess: true,
    req,
  })
  return doc
}

export const auditDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  await req.payload.create({
    collection: 'auditLog',
    data: {
      ...actorOf(req),
      action: 'delete',
      targetCollection: collection.slug,
      docId: String(doc.id),
      changedFields: [],
    },
    overrideAccess: true,
    req,
  })
  return doc
}

export const auditHooks = { afterChange: [auditChange], afterDelete: [auditDelete] }
