'use server'

import { randomBytes } from 'node:crypto'

import config from '@payload-config'
import { logout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { verifyEmail } from '@/emails/templates'
import { sendEmail, siteUrl } from '@/emails/send'
import { type ActionResult, invalid } from '@/lib/actions'
import { isStrongPassword } from '@/lib/auth/password'
import { actionContext, verifyPassword } from '@/lib/panel/guard'
import {
  changePasswordSchema,
  confirmWithPasswordSchema,
  notificationsSchema,
} from '@/lib/validation/forms'

const WRONG_PASSWORD = { ok: false, fieldErrors: { password: 'Nieprawidłowe hasło.' } } as const

export async function saveNotificationsAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = notificationsSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  await ctx.payload.update({
    collection: 'firmAccounts',
    id: ctx.session.id,
    data: { notificationPrefs: parsed.data },
    ...ctx.as,
  })
  return { ok: true, message: 'Powiadomienia zapisane.' }
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  if (!(await verifyPassword(ctx.payload, ctx.session.email, parsed.data.current))) {
    return { ok: false, fieldErrors: { current: 'Nieprawidłowe obecne hasło.' } }
  }
  if (!isStrongPassword(parsed.data.next, [ctx.session.email.split('@')[0] ?? ''])) {
    return {
      ok: false,
      fieldErrors: { next: 'To hasło łatwo odgadnąć. Ułóż je z 3–4 niezwiązanych słów.' },
    }
  }
  await ctx.payload.update({
    collection: 'firmAccounts',
    id: ctx.session.id,
    data: { password: parsed.data.next },
    ...ctx.as,
  })
  return { ok: true, message: 'Hasło zmienione.' }
}

const emailChangeSchema = confirmWithPasswordSchema.extend({
  email: z.string().trim().toLowerCase().pipe(z.email('Podaj adres e-mail.')),
})

/** Zmiana e-maila: hasło, potem link na nowy adres; do potwierdzenia logowanie nowym adresem jest zablokowane. */
export async function changeEmailAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext()
  if ('error' in ctx) return ctx.error
  const parsed = emailChangeSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  if (!(await verifyPassword(ctx.payload, ctx.session.email, parsed.data.password)))
    return WRONG_PASSWORD
  const taken = await ctx.payload.count({
    collection: 'firmAccounts',
    where: { email: { equals: parsed.data.email } },
    overrideAccess: true,
  })
  if (taken.totalDocs > 0) return { ok: false, fieldErrors: { email: 'Ten adres ma już konto.' } }

  const token = randomBytes(20).toString('hex')
  await ctx.payload.update({
    collection: 'firmAccounts',
    id: ctx.session.id,
    data: {
      email: parsed.data.email,
      _verified: false,
      _verificationToken: token,
      verificationSentAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })
  await sendEmail(ctx.payload, parsed.data.email, verifyEmail(siteUrl(`/potwierdz/${token}`)))
  return {
    ok: true,
    message: `Wysłaliśmy link na ${parsed.data.email}. Kliknij go, zanim zalogujesz się nowym adresem.`,
  }
}

/** Eksport danych konta i firmy w JSON (RODO, art. 20). Zapytania z odszyfrowanymi danymi – to dane firmy. */
export async function exportDataAction(input: unknown): Promise<ActionResult<{ json: string }>> {
  const ctx = await actionContext({ allowBanned: true })
  if ('error' in ctx) return ctx.error
  const parsed = confirmWithPasswordSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  if (!(await verifyPassword(ctx.payload, ctx.session.email, parsed.data.password)))
    return WRONG_PASSWORD

  const list = async <T extends 'projects' | 'inquiries' | 'reviews' | 'firmStatsDaily'>(
    collection: T,
  ) =>
    ctx.firmId
      ? (
          await ctx.payload.find({
            collection,
            where: { firm: { equals: ctx.firmId } },
            depth: 0,
            pagination: false,
            ...ctx.as,
          })
        ).docs
      : []
  const account = await ctx.payload.findByID({
    collection: 'firmAccounts',
    id: ctx.session.id,
    depth: 0,
    ...ctx.as,
  })
  const firm = ctx.firmId
    ? await ctx.payload.findByID({ collection: 'firms', id: ctx.firmId, depth: 0, ...ctx.as })
    : null
  const data = {
    exportedAt: new Date().toISOString(),
    account,
    firm,
    projects: await list('projects'),
    inquiries: await list('inquiries'),
    reviews: await list('reviews'),
    statistics: await list('firmStatsDaily'),
  }
  return { ok: true, data: { json: JSON.stringify(data, null, 2) } }
}

/** Usunięcie konta i profilu firmy z treściami (SPEC 3.4). Nieodwracalne – wymaga hasła. */
export async function deleteAccountAction(input: unknown): Promise<ActionResult> {
  const ctx = await actionContext({ allowBanned: true })
  if ('error' in ctx) return ctx.error
  const parsed = confirmWithPasswordSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  if (!(await verifyPassword(ctx.payload, ctx.session.email, parsed.data.password)))
    return WRONG_PASSWORD

  const system = { overrideAccess: true } as const
  // Treści firmy (realizacje, zdjęcia, opinie, …) usuwa hook kolekcji firm.
  if (ctx.firmId) await ctx.payload.delete({ collection: 'firms', id: ctx.firmId, ...system })
  const byAccount = { account: { equals: ctx.session.id } }
  await ctx.payload.delete({ collection: 'forumReactions', where: byAccount, ...system })
  await ctx.payload.delete({ collection: 'sanctions', where: byAccount, ...system })
  await ctx.payload.delete({ collection: 'firmAccounts', id: ctx.session.id, ...system })
  await logout({ config })
  redirect('/?konto=usuniete')
}
