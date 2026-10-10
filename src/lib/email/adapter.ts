import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { EmailAdapter, SendEmailOptions } from 'payload'

const FROM_NAME = 'Ekipa na Termin'

/** Ostatnie wiadomości adaptera w pamięci – do testów i lokalnej pracy bez SMTP. */
export const outbox: SendEmailOptions[] = []

/** Bez SMTP: wiadomości zostają w pamięci, w logu tylko temat (bez adresata i treści – dane osobowe). */
const memoryAdapter =
  (from: string): EmailAdapter =>
  () => ({
    name: 'memory',
    defaultFromAddress: from,
    defaultFromName: FROM_NAME,
    sendEmail: async (message) => {
      outbox.push(message)
      if (outbox.length > 50) outbox.shift()
      if (process.env.NODE_ENV !== 'test')
        console.warn(`E-mail niewysłany (brak SMTP_HOST): ${String(message.subject)}`)
    },
  })

/** Brevo przez SMTP (ADR 0018), lokalnie Mailpit; bez `SMTP_HOST` – adapter w pamięci. */
export function emailAdapter(env = process.env) {
  const from = env.EMAIL_FROM || 'powiadomienia@ekipanatermin.pl'
  if (!env.SMTP_HOST || env.NODE_ENV === 'test') return memoryAdapter(from)
  const port = Number(env.SMTP_PORT || 587)
  // Mailpit nie ma TLS ani logowania; Brevo: port 587 ze STARTTLS i loginem. `auth` należy do
  // opcji transportu SMTP – typ adaptera Payload (Nodemailer 10) opisuje tylko połączenie.
  const transportOptions = {
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  }
  return nodemailerAdapter({
    defaultFromAddress: from,
    defaultFromName: FROM_NAME,
    transportOptions,
    skipVerify: true,
  })
}
