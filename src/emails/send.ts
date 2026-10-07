import { render } from '@react-email/components'
import type { Payload } from 'payload'

import type { EmailTemplate } from './templates'

/** Wysyła e-mail z wersją HTML i tekstową (SPEC 3.15). Treści nie logujemy (dane osobowe). */
export async function sendEmail(payload: Payload, to: string, { subject, body }: EmailTemplate) {
  const [html, text] = await Promise.all([render(body), render(body, { plainText: true })])
  await payload.sendEmail({ to, subject, html, text })
}

/** Pełny adres w serwisie (linki w e-mailach). */
export const siteUrl = (path: string) =>
  new URL(path, process.env.NEXT_PUBLIC_SERVER_URL).toString()
