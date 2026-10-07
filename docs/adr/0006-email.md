# 0006. E-maile transakcyjne

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md: Brevo + React Email. Payload potrzebuje adaptera e-mail (weryfikacja konta, reset hasła).

## Decyzja
- Szablony w React Email (`src/emails`), renderowane do HTML i tekstu.
- Wysyłka przez oficjalny `@payloadcms/email-nodemailer` i Brevo SMTP relay – jeden kanał dla e-maili Payload i własnych.
- Lokalnie Mailpit w Dockerze.
- E-maile powiadomień bez danych osobowych klienta (SPEC 3.6).

## Konsekwencje
- SDK Brevo niepotrzebne; zmiana dostawcy SMTP to zmiana zmiennych środowiskowych.

## Odrzucone alternatywy
- Własny adapter na API Brevo: więcej kodu bez zysku.
- `payload-email-brevo@1.0.0`: zbyt młoda paczka.
