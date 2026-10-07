# 0008. Ochrona przed nadużyciami

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md: Turnstile i limity żądań w warstwie aplikacji (np. Upstash Redis, region UE) na logowaniu, rejestracji, formularzach, forum i giełdzie.

## Decyzja
- Cloudflare Turnstile na formularzach publicznych, token weryfikowany po stronie serwera, bez SDK.
- `@upstash/ratelimit` w regionie eu-central-1; limity z CLAUDE.md i SPEC (np. 5 zapytań na godzinę z jednego IP).
- Wbudowana blokada logowania Payload (`maxLoginAttempts`, `lockTime`) plus limit po IP.
- Adres IP tylko z nagłówków Vercel i zapisywany wyłącznie jako HMAC.

## Konsekwencje
- Lokalnie klucze testowe Turnstile i Redis z emulacją REST w Dockerze.

## Odrzucone alternatywy
- Limity w pamięci procesu: nie działają w środowisku serverless.
