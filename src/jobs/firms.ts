import type { PayloadRequest, TaskConfig } from 'payload'

import {
  availabilityExpired,
  availabilityReminder,
  type EmailTemplate,
  trialEnding,
} from '@/emails/templates'
import { sendEmail, siteUrl } from '@/emails/send'
import { signLink } from '@/lib/auth/links'
import {
  addDays,
  formatInstantDate,
  formatShortDate,
  todayInWarsaw,
  type CalendarDate,
} from '@/lib/format/date'
import type { Firm } from '@/payload-types'

const DAILY = [{ cron: '0 15 2 * * *', queue: 'daily' }]
const DAY_MS = 24 * 60 * 60 * 1000
type Output = { input: object; output: { sent: number } }

async function settings(req: PayloadRequest) {
  return req.payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true, req })
}

/** E-mail do kont firmy, które nie wyłączyły danego powiadomienia. */
async function notifyFirm(
  req: PayloadRequest,
  firm: Firm,
  template: EmailTemplate,
  pref?: 'availabilityReminders',
) {
  const { docs } = await req.payload.find({
    collection: 'firmAccounts',
    where: {
      firm: { equals: firm.id },
      ...(pref ? { [`notificationPrefs.${pref}`]: { not_equals: false } } : {}),
    },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  await Promise.all(docs.map((account) => sendEmail(req.payload, account.email, template)))
}

const markSent = (req: PayloadRequest, firm: Firm, field: keyof NonNullable<Firm['mailLog']>) =>
  req.payload.update({
    collection: 'firms',
    id: firm.id,
    data: { mailLog: { [field]: new Date().toISOString() } },
    overrideAccess: true,
    context: { skipAudit: true },
    req,
  })

/** Link „Potwierdź termin” – jednorazowy: po potwierdzeniu zmienia się `confirmedAt`. */
export const availabilityLinkSubject = (firm: Pick<Firm, 'id' | 'availability'>) =>
  `${firm.id}:${firm.availability?.confirmedAt ?? ''}`

/** Po `availabilityReminderDays` od potwierdzenia: prośba o potwierdzenie (SPEC 3.5). */
export const remindAvailability: TaskConfig<Output> = {
  slug: 'remindAvailability',
  label: 'Przypomnienia o potwierdzeniu terminu',
  schedule: DAILY,
  retries: 2,
  handler: async ({ req }) => {
    const { availabilityReminderDays = 10, availabilityExpiryDays = 14 } = await settings(req)
    const today = todayInWarsaw()
    const { docs } = await req.payload.find({
      collection: 'firms',
      where: {
        status: { equals: 'active' },
        'availability.date': { greater_than_equal: today },
        'availability.confirmedAt': {
          less_than_equal: new Date(Date.now() - availabilityReminderDays * DAY_MS).toISOString(),
        },
        'mailLog.availabilityReminderAt': { exists: false },
      },
      depth: 0,
      pagination: false,
      overrideAccess: true,
      req,
    })
    for (const firm of docs) {
      const confirmedAt = new Date(firm.availability!.confirmedAt!)
      const expires = new Date(confirmedAt.getTime() + availabilityExpiryDays * DAY_MS)
      const token = signLink('confirm-availability', availabilityLinkSubject(firm), expires)
      const template = availabilityReminder(
        siteUrl(`/termin/potwierdz/${token}`),
        siteUrl('/panel/termin'),
        formatShortDate(firm.availability!.date as CalendarDate),
      )
      await notifyFirm(req, firm, template, 'availabilityReminders')
      await markSent(req, firm, 'availabilityReminderAt')
    }
    return { output: { sent: docs.length } }
  },
}

/** Termin po dacie albo bez potwierdzenia przez `availabilityExpiryDays`: e-mail raz (SPEC 3.5). */
export const expireAvailability: TaskConfig<Output> = {
  slug: 'expireAvailability',
  label: 'Wygaszanie terminów',
  schedule: DAILY,
  retries: 2,
  handler: async ({ req }) => {
    const { availabilityExpiryDays = 14 } = await settings(req)
    const today = todayInWarsaw()
    const { docs } = await req.payload.find({
      collection: 'firms',
      where: {
        status: { equals: 'active' },
        'availability.date': { exists: true },
        'mailLog.availabilityExpiredAt': { exists: false },
        or: [
          { 'availability.date': { less_than: today } },
          {
            'availability.confirmedAt': {
              less_than: new Date(Date.now() - availabilityExpiryDays * DAY_MS).toISOString(),
            },
          },
        ],
      },
      depth: 0,
      pagination: false,
      overrideAccess: true,
      req,
    })
    for (const firm of docs) {
      await notifyFirm(
        req,
        firm,
        availabilityExpired(siteUrl('/panel/termin')),
        'availabilityReminders',
      )
      await markSent(req, firm, 'availabilityExpiredAt')
    }
    return { output: { sent: docs.length } }
  },
}

/** Koniec okresu próbnego za 7 dni i za 1 dzień (SPEC 3.15). */
export const remindTrialEnding: TaskConfig<Output> = {
  slug: 'remindTrialEnding',
  label: 'Przypomnienia o końcu okresu próbnego',
  schedule: DAILY,
  retries: 2,
  handler: async ({ req }) => {
    let sent = 0
    for (const [days, field] of [
      [1, 'trialEnding1At'],
      [7, 'trialEnding7At'],
    ] as const) {
      const until = addDays(todayInWarsaw(), days + 1)
      const { docs } = await req.payload.find({
        collection: 'firms',
        where: {
          subscriptionStatus: { equals: 'trial' },
          trialEndsAt: {
            greater_than: new Date().toISOString(),
            less_than: `${until}T00:00:00.000Z`,
          },
          [`mailLog.${field}`]: { exists: false },
        },
        depth: 0,
        pagination: false,
        overrideAccess: true,
        req,
      })
      for (const firm of docs) {
        await notifyFirm(
          req,
          firm,
          trialEnding(siteUrl('/panel'), days, formatInstantDate(firm.trialEndsAt!)),
        )
        await markSent(req, firm, field)
        // Firma blisko końca dostaje tylko przypomnienie „za 1 dzień”, bez zaległego „za 7 dni”.
        if (days === 1) await markSent(req, firm, 'trialEnding7At')
        sent += 1
      }
    }
    return { output: { sent } }
  },
}
