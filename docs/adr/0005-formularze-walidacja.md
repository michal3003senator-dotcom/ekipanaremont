# 0005. Formularze i walidacja

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md: React Hook Form + Zod 4, jeden schemat dla klienta i serwera; każde wejście walidowane po stronie serwera.

## Decyzja
- Jeden schemat Zod na formularz w `src/lib/validation`, używany przez RHF (`@hookform/resolvers`) i przez Server Action lub route handler.
- Każda akcja serwera zaczyna się od `safeParse`; błędy wracają do pól formularza.
- Komunikaty po polsku (`z.locales.pl`, własne treści tam, gdzie domyślne brzmią nienaturalnie).
- Zmienne środowiskowe walidowane schematem Zod przy starcie (`src/lib/env.ts`): aplikacja nie startuje z błędną konfiguracją.

## Konsekwencje
- Walidacja w przeglądarce to wygoda, nie zabezpieczenie; testy dotyczą strony serwerowej.

## Odrzucone alternatywy
- Nie rozważane – stack ustalony w CLAUDE.md.
