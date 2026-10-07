'use server'

import { revalidatePath } from 'next/cache'

import { type ActionResult, invalid } from '@/lib/actions'
import { type LocalityOption, searchLocalities } from '@/lib/localities'
import { lookupNip } from '@/lib/registry'
import { rateLimit } from '@/lib/rate-limit'
import { actionContext } from '@/lib/panel/guard'
import { countPhotos } from '@/lib/panel/queries'
import { profileGaps } from '@/lib/panel/profile'
import { checkAvailabilityDate } from '@/lib/validation'
import {
  aboutStepSchema,
  availabilitySchema,
  firmNameSchema,
  inquiryStatusSchema,
  nipSchema,
  reviewReplySchema,
  servicesStepSchema,
} from '@/lib/validation/forms'

const NO_FIRM: ActionResult<never> = { ok: false, message: 'Najpierw podaj NIP firmy.' }

/** Sprawdzenie NIP w rejestrach – tylko podgląd, bez zapisu (krok 1 kreatora). */
export async function lookupNipAction(
  input: unknown,
): Promise<ActionResult<{ status: string; name?: string; address?: string | null }>> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = nipSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const limit = await rateLimit('nipLookup', ctx.session.id)
  if (!limit.ok) return { ok: false, message: 'Za dużo sprawdzeń NIP. Spróbuj za godzinę.' }

  const taken = await ctx.payload.count({
    collection: 'firms',
    where: { nip: { equals: parsed.data.nip } },
    overrideAccess: true,
  })
  if (taken.totalDocs > 0) {
    return {
      ok: false,
      fieldErrors: {
        nip: 'Ten NIP ma już profil w serwisie. Jeśli to Twoja firma, napisz do nas przez stronę Kontakt.',
      },
    }
  }
  const result = await lookupNip(parsed.data.nip)
  if (result.status !== 'found') return { ok: true, data: { status: result.status } }
  return {
    ok: true,
    data: { status: 'found', name: result.record.name, address: result.record.address },
  }
}

/** Utworzenie profilu z NIP. Dane rejestru pobierane ponownie na serwerze – klientowi nie ufamy. */
export async function createFirmAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  if (ctx.firmId) return { ok: false, message: 'Konto ma już profil firmy.' }
  const parsed = nipSchema.extend(firmNameSchema.partial().shape).safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const result = await lookupNip(parsed.data.nip)
  const record = result.status === 'found' ? result.record : null
  const name = record?.name ?? parsed.data.name
  if (!name)
    return {
      ok: false,
      fieldErrors: { name: 'Podaj nazwę firmy – nie znaleźliśmy jej w rejestrach.' },
    }

  // Jeden NIP = jeden profil (SPEC 3.3); sprawdzenie przed zapisem, unikalny indeks pilnuje wyścigu.
  const taken = await ctx.payload.count({
    collection: 'firms',
    where: { nip: { equals: parsed.data.nip } },
    overrideAccess: true,
  })
  if (taken.totalDocs > 0)
    return { ok: false, fieldErrors: { nip: 'Ten NIP ma już profil w serwisie.' } }

  const firm = await ctx.payload.create({
    collection: 'firms',
    data: {
      name: record ? toTitleCase(record.name) : name,
      nip: parsed.data.nip,
      status: 'draft',
      subscriptionStatus: 'trial',
      registrySource: record?.source,
      registryData: record ? { ...record } : undefined,
      // Weryfikacja automatyczna tylko dla firmy aktywnej w rejestrze; inaczej sprawdza moderator.
      registryVerifiedAt: record?.active ? record.checkedAt : undefined,
    },
    overrideAccess: true,
  })
  await ctx.payload.update({
    collection: 'firmAccounts',
    id: ctx.session.id,
    data: { firm: firm.id },
    overrideAccess: true,
  })
  revalidatePath('/panel', 'layout')
  return { ok: true }
}

/** „GLAZURA SP. Z O.O.” → „Glazura Sp. z o.o.” – rejestry podają nazwy wersalikami. */
function toTitleCase(name: string): string {
  if (name !== name.toUpperCase()) return name
  return name
    .toLowerCase()
    .replace(
      /(^|[\s\-"„(])(\p{L})/gu,
      (_, before: string, letter: string) => before + letter.toUpperCase(),
    )
    .replace(/\bSp\. Z O\.O\./giu, 'Sp. z o.o.')
    .replace(/\bS\.C\./giu, 's.c.')
}

export async function saveServicesAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  if (!ctx.firmId) return NO_FIRM
  const parsed = servicesStepSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const area = new Set(parsed.data.serviceArea)
  area.add(parsed.data.baseLocality)
  await ctx.payload.update({
    collection: 'firms',
    id: ctx.firmId,
    data: { ...parsed.data, serviceArea: [...area] },
    ...ctx.as,
  })
  revalidatePath('/panel', 'layout')
  return { ok: true }
}

export async function saveAboutAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  if (!ctx.firmId) return NO_FIRM
  const parsed = aboutStepSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { phone, website, ...rest } = parsed.data
  await ctx.payload.update({
    collection: 'firms',
    id: ctx.firmId,
    data: { ...rest, phone: phone || null, website: website || null },
    ...ctx.as,
  })
  revalidatePath('/panel', 'layout')
  return { ok: true }
}

/** Wysłanie do akceptacji: tylko kompletny profil w szkicu albo po odrzuceniu (SPEC 3.3 pkt 6). */
export async function submitForReviewAction(): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  if (!ctx.firmId) return NO_FIRM
  const firm = await ctx.payload.findByID({
    collection: 'firms',
    id: ctx.firmId,
    depth: 0,
    ...ctx.as,
  })
  if (firm.status !== 'draft' && firm.status !== 'rejected')
    return { ok: false, message: 'Profil jest już wysłany.' }
  const gaps = profileGaps(firm, await countPhotos(ctx.payload, ctx.firmId))
  if (gaps.length)
    return {
      ok: false,
      message: `Uzupełnij profil: ${gaps.map((gap) => gap.label.toLowerCase()).join(', ')}.`,
    }
  await ctx.payload.update({
    collection: 'firms',
    id: ctx.firmId,
    data: { status: 'pending_review' },
    overrideAccess: true,
  })
  revalidatePath('/panel', 'layout')
  return { ok: true, message: 'Profil wysłany do akceptacji.' }
}

/**
 * Potwierdzenie terminu jednym dotknięciem (SPEC 3.4, 3.5). Bez daty – potwierdza obecną;
 * z datą – ustawia nową (dziś do +180 dni). Zawsze odświeża `confirmedAt`.
 */
export async function confirmAvailabilityAction(
  input: unknown,
): Promise<ActionResult<{ date: string; confirmedAt: string }>> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  if (!ctx.firmId) return NO_FIRM
  const parsed = availabilitySchema.partial().safeParse(input ?? {})
  if (!parsed.success) return invalid(parsed.error)

  const firm = await ctx.payload.findByID({
    collection: 'firms',
    id: ctx.firmId,
    depth: 0,
    ...ctx.as,
  })
  const date = parsed.data.date ?? firm.availability?.date
  if (!date) return { ok: false, message: 'Wybierz datę terminu.' }
  const check = checkAvailabilityDate(date, null)
  if (check !== true) return { ok: false, fieldErrors: { date: check } }

  const updated = await ctx.payload.update({
    collection: 'firms',
    id: ctx.firmId,
    data: { availability: { date } },
    context: { confirmAvailability: true },
    ...ctx.as,
  })
  await ctx.payload.update({
    collection: 'firms',
    id: ctx.firmId,
    data: { mailLog: { availabilityReminderAt: null, availabilityExpiredAt: null } },
    overrideAccess: true,
    context: { skipAudit: true },
  })
  revalidatePath('/panel', 'layout')
  return {
    ok: true,
    data: { date, confirmedAt: updated.availability?.confirmedAt ?? new Date().toISOString() },
  }
}

export async function clearAvailabilityAction(): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  if (!ctx.firmId) return NO_FIRM
  await ctx.payload.update({
    collection: 'firms',
    id: ctx.firmId,
    data: { availability: { date: null } },
    ...ctx.as,
  })
  revalidatePath('/panel', 'layout')
  return { ok: true, message: 'Termin usunięty.' }
}

export async function setInquiryStatusAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = inquiryStatusSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  try {
    await ctx.payload.update({
      collection: 'inquiries',
      id: parsed.data.id,
      data: { status: parsed.data.status },
      ...ctx.as,
    })
  } catch {
    return { ok: false, message: 'Nie znaleziono zapytania.' }
  }
  revalidatePath('/panel', 'layout')
  return { ok: true }
}

export async function replyToReviewAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = reviewReplySchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  try {
    const doc = await ctx.payload.update({
      collection: 'reviews',
      id: parsed.data.id,
      data: { firmReply: parsed.data.reply },
      ...ctx.as,
    })
    if (doc.firmReply !== parsed.data.reply)
      return { ok: false, message: 'Odpowiedź można poprawiać tylko przez 24 godziny.' }
  } catch {
    return { ok: false, message: 'Nie znaleziono opinii.' }
  }
  revalidatePath('/panel/opinie')
  return { ok: true, message: 'Odpowiedź opublikowana.' }
}

/** Podpowiedzi miejscowości dla kreatora (dane publiczne, ale akcja tylko dla zalogowanych firm). */
export async function searchLocalitiesAction(query: unknown): Promise<LocalityOption[]> {
  const ctx = await actionContext()
  if ('error' in ctx || typeof query !== 'string') return []
  return searchLocalities(ctx.payload, query.slice(0, 60))
}
