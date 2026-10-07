'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { idOf } from '@/access'
import { type ActionResult, invalid } from '@/lib/actions'
import { UPLOAD_IMAGE_TYPES } from '@/lib/images'
import { actionContext } from '@/lib/panel/guard'
import { MAX_PROJECT_PHOTOS } from '@/lib/panel/profile'
import { rateLimit } from '@/lib/rate-limit'
import { projectSchema, reorderSchema } from '@/lib/validation/forms'

const id = z.uuid()
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const refresh = () => revalidatePath('/panel', 'layout')

export async function saveProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  if (!ctx.firmId) return { ok: false, message: 'Najpierw podaj NIP firmy.' }
  const parsed = projectSchema.extend({ id: id.optional() }).safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { id: projectId, ...data } = parsed.data
  const fields = {
    title: data.title,
    service: data.service ?? null,
    locality: data.locality ?? null,
    completedMonth: data.completedMonth ?? null,
    description: data.description ?? null,
  }
  try {
    const doc = projectId
      ? await ctx.payload.update({ collection: 'projects', id: projectId, data: fields, ...ctx.as })
      : await ctx.payload.create({
          collection: 'projects',
          // Firmę ustawia hook z sesji; publikacja od razu – profil i tak przechodzi moderację.
          data: { ...fields, firm: ctx.firmId, status: 'published' },
          ...ctx.as,
        })
    refresh()
    return { ok: true, data: { id: doc.id } }
  } catch (error) {
    const message =
      error instanceof Error && /najwyżej/i.test(error.message)
        ? error.message
        : 'Nie udało się zapisać realizacji.'
    return { ok: false, message }
  }
}

export async function deleteProjectAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = id.safeParse((input as { id?: unknown })?.id)
  if (!parsed.success) return { ok: false, message: 'Nie znaleziono realizacji.' }
  try {
    const project = await ctx.payload.findByID({
      collection: 'projects',
      id: parsed.data,
      depth: 0,
      ...ctx.as,
    })
    await ctx.payload.delete({ collection: 'projects', id: project.id, ...ctx.as })
    const images = (project.images ?? [])
      .map(idOf)
      .filter((value): value is string => Boolean(value))
    if (images.length)
      await ctx.payload.delete({ collection: 'media', where: { id: { in: images } }, ...ctx.as })
  } catch {
    return { ok: false, message: 'Nie znaleziono realizacji.' }
  }
  refresh()
  return { ok: true, message: 'Realizacja usunięta.' }
}

/**
 * Jedno zdjęcie na wywołanie (zmniejszone w przeglądarce). Treść sprawdza i koduje ponownie
 * Payload z sharp (WebP, bez EXIF, kilka rozmiarów); tu – właściciel, limit i rozmiar.
 */
export async function uploadProjectPhotoAction(
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string | null }>> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const limit = await rateLimit('upload', ctx.session.id)
  if (!limit.ok) return { ok: false, message: 'Za dużo zdjęć naraz. Spróbuj za kilka minut.' }

  const projectId = id.safeParse(formData.get('projectId'))
  const file = formData.get('file')
  if (!projectId.success || !(file instanceof File))
    return { ok: false, message: 'Nieprawidłowe zdjęcie.' }
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES || !UPLOAD_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: 'Dodaj zdjęcie JPG, PNG, WebP lub AVIF do 5 MB.' }
  }

  try {
    const project = await ctx.payload.findByID({
      collection: 'projects',
      id: projectId.data,
      depth: 0,
      ...ctx.as,
    })
    const images = (project.images ?? [])
      .map(idOf)
      .filter((value): value is string => Boolean(value))
    if (images.length >= MAX_PROJECT_PHOTOS)
      return { ok: false, message: `Realizacja może mieć najwyżej ${MAX_PROJECT_PHOTOS} zdjęć.` }

    const media = await ctx.payload.create({
      collection: 'media',
      data: {
        alt: `${project.title} – zdjęcie ${images.length + 1}`,
        purpose: 'project',
        firm: ctx.firmId,
      },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name || 'zdjecie.webp',
        size: file.size,
      },
      ...ctx.as,
    })
    await ctx.payload.update({
      collection: 'projects',
      id: project.id,
      data: { images: [...images, media.id] },
      ...ctx.as,
    })
    refresh()
    return { ok: true, data: { id: media.id, url: media.sizes?.thumb?.url ?? media.url ?? null } }
  } catch {
    return { ok: false, message: 'To nie wygląda na zdjęcie. Spróbuj innego pliku.' }
  }
}

export async function removeProjectPhotoAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = z.object({ projectId: id, mediaId: id }).safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  try {
    const project = await ctx.payload.findByID({
      collection: 'projects',
      id: parsed.data.projectId,
      depth: 0,
      ...ctx.as,
    })
    const images = (project.images ?? [])
      .map(idOf)
      .filter((value): value is string => Boolean(value))
    if (!images.includes(parsed.data.mediaId))
      return { ok: false, message: 'Nie znaleziono zdjęcia.' }
    await ctx.payload.update({
      collection: 'projects',
      id: project.id,
      data: { images: images.filter((image) => image !== parsed.data.mediaId) },
      ...ctx.as,
    })
    await ctx.payload.delete({ collection: 'media', id: parsed.data.mediaId, ...ctx.as })
  } catch {
    return { ok: false, message: 'Nie znaleziono zdjęcia.' }
  }
  refresh()
  return { ok: true }
}

/** Kolejność zdjęć po przeciągnięciu – dokładnie te same zdjęcia, inna kolejność. */
export async function reorderPhotosAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = reorderSchema.extend({ projectId: id }).safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  try {
    const project = await ctx.payload.findByID({
      collection: 'projects',
      id: parsed.data.projectId,
      depth: 0,
      ...ctx.as,
    })
    const current = (project.images ?? [])
      .map(idOf)
      .filter((value): value is string => Boolean(value))
    const same =
      current.length === parsed.data.ids.length &&
      current.every((image) => parsed.data.ids.includes(image))
    if (!same) return { ok: false, message: 'Lista zdjęć się zmieniła. Odśwież stronę.' }
    await ctx.payload.update({
      collection: 'projects',
      id: project.id,
      data: { images: parsed.data.ids },
      ...ctx.as,
    })
  } catch {
    return { ok: false, message: 'Nie znaleziono realizacji.' }
  }
  refresh()
  return { ok: true }
}

/** Kolejność realizacji na profilu. */
export async function reorderProjectsAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = reorderSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  try {
    await Promise.all(
      parsed.data.ids.map((projectId, order) =>
        ctx.payload.update({ collection: 'projects', id: projectId, data: { order }, ...ctx.as }),
      ),
    )
  } catch {
    return { ok: false, message: 'Nie udało się zapisać kolejności.' }
  }
  refresh()
  return { ok: true }
}
