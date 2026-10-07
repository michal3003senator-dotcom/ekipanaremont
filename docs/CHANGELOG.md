# Changelog

Wszystkie istotne zmiany w projekcie. Format według [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), daty w strefie Europe/Warsaw.

## [Nieopublikowane]

### Faza 1 – szkielet (2026-10-07)
- Projekt Next.js 16.3 + Payload 3.90 (szablon blank, PostgreSQL), TypeScript 6 strict, Node 24, pnpm 10.
- Kolekcja `staff` (logowanie personelu, jawne reguły dostępu z testami), ID jako UUID, schemat tylko migracjami (`push: false`), migracja początkowa.
- Bezpieczeństwo: CSP z nonce (`src/proxy.ts`), HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, `noindex` poza produkcją; GraphQL wyłączony; CSRF i CORS tylko dla własnej domeny; panel bez Gravatara.
- Sentry (region UE): tylko inicjalizacja, sam rejestr błędów, bez danych osobowych, tunel `/monitoring`.
- Narzędzia: ESLint + Prettier, husky (lint-staged, Conventional Commits), Vitest (testy jednostkowe i integracyjne), Playwright (test dymny na 360 px i desktopie).
- `docker-compose.yml` z PostgreSQL 17 i bazą testową, `.env.example` ze wszystkimi zmiennymi projektu.
- CI (GitHub Actions): lint, typecheck, test, build z testem dymnym, skan sekretów (gitleaks).
- Staging: `vercel.json` (fra1), `pnpm vercel-build` z migracjami.
- Odstępstwa od planu: Next 16.3.8 zamiast 16.4.0 (wydany < 24 h przed startem) i ESLint 9 zamiast 10 (wymaga `eslint-config-next` 16.4) – podniesiemy razem, ADR 0001.

### Faza 0 – plan (2026-10-07)
- Dodano `docs/PLAN.md`: 28 pytań z rekomendacjami (przyjęte przez właściciela), ryzyka techniczne, plan faz, struktura katalogów, pakiety z wersjami, konta i zmienne środowiskowe.
- Dodano ADR 0001–0012 i indeks `docs/adr/README.md`.
- SPEC 1.1: strony publiczne renderowane dynamicznie z cache danych (CSP z nonce, ADR 0009).
