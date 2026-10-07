# 0018. Uwierzytelnianie firm: Server Actions na Local API Payload

- Status: zaakceptowana (plan fazy 4)
- Data: 2026-10-07

## Kontekst
Firmy logują się w serwisie, nie w panelu Payload. Formularze muszą mieć Turnstile, limity prób, walidację Zod i e-maile z wersją tekstową (SPEC 3.3, 3.15).

## Decyzja
- Rejestracja, logowanie, reset hasła i weryfikacja e-maila to Server Actions wywołujące Local API Payload (`payload.create`, `login` z `@payloadcms/next/auth`, `forgotPassword` / `resetPassword` z `disableEmail`, `verifyEmail`). Ciasteczko sesji ustawia Payload (HttpOnly, Secure, SameSite=Lax).
- E-maile wysyłamy sami (`payload.sendEmail`, React Email, HTML + tekst) zamiast wbudowanych szablonów Payload, które mają tylko HTML. Link weryfikacyjny ważny 24 h (`verificationSentAt` w koncie), reset hasła 1 h.
- Hasło: min. 12 znaków i ocena `@zxcvbn-ts` z polskim słownikiem (wynik ≥ 3). Słowniki ładuje tylko serwer.
- Limity (`src/lib/rate-limit`): Upstash Redis w UE, bez niego licznik w pamięci (tylko lokalnie). Klucz to HMAC adresu IP lub e-maila, nigdy surowa wartość.
- Odpowiedzi nie zdradzają, czy konto istnieje (rejestracja na zajęty e-mail i reset hasła kończą się tym samym komunikatem).
- Podpisane linki (`src/lib/auth/links.ts`): HMAC-SHA256 kluczem `LINK_SIGNING_KEY` z celem i datą ważności; jednorazowość przez stan rekordu (np. data potwierdzenia terminu w treści linku).

## Konsekwencje
- Jedno źródło prawdy o kontach i sesjach (Payload), bez osobnej biblioteki auth.
- Nowa zależność `@zxcvbn-ts/*` (ok. 1 MB słowników, tylko na serwerze).

## Odrzucone alternatywy
- Auth.js / Better Auth: druga warstwa kont obok Payload, podwójne sesje i reguły dostępu.
- Wbudowane e-maile Payload: brak wersji tekstowej i ważności linku weryfikacyjnego.
