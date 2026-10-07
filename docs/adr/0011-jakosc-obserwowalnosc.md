# 0011. Jakość i obserwowalność

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md: Vitest, Playwright, axe; Sentry (UE); Plausible; po każdej zmianie lint, typecheck i testy.

## Decyzja
- Vitest: testy jednostkowe i integracyjne (osobna baza testowa, migracje przed testami). Playwright z axe dla e2e i dostępności.
- CI w GitHub Actions przy każdym pull requeście: lint, typecheck, testy z usługą PostgreSQL, build z testem dymnym na zbudowanej aplikacji, skan sekretów (gitleaks). Akcje przypięte do SHA, uprawnienia tylko do odczytu, CI bez sekretów.
- Sentry w regionie UE: tylko błędy, bez Session Replay; w `dataCollection` (Sentry 11) wyłączone ciasteczka, nagłówki, treść żądań, parametry URL, zmienne lokalne i dane użytkownika; ruch z przeglądarki przez tunel `/monitoring` (CSP zostaje przy `'self'`, IP użytkownika nie trafia do Sentry). Bez DSN Sentry jest wyłączony.
- Plausible przez proxy pod ścieżką spoza `/api`.

## Konsekwencje
- Mapy źródłowe wysyłane tylko z tokenem (Vercel, CI) i niepubliczne.

## Odrzucone alternatywy
- Sentry Session Replay: nagrywanie ekranów użytkowników to zbędne ryzyko RODO.
