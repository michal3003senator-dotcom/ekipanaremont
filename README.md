# Ekipa na Termin

Platforma łącząca klientów z firmami remontowymi z województwa łódzkiego. Wyróżnik: najbliższy wolny termin firmy.

Stack: Next.js 16 + Payload CMS 3, PostgreSQL (Neon), Vercel (fra1). Szczegóły i zasady pracy: [CLAUDE.md](CLAUDE.md).

## Start lokalny

Wymagania: Node 24 (`.nvmrc`), pnpm przez Corepack (`corepack enable`), Docker.

```bash
pnpm install
pnpm env:init                   # tworzy .env.local i sam wpisuje sekrety
docker compose up -d --wait     # PostgreSQL 17 + baza testowa
pnpm dev                        # migracje, potem serwer deweloperski
```

- Strona: http://localhost:3000
- Panel: http://localhost:3000/admin – przy pierwszym wejściu tworzysz konto personelu.

## Sprawdzenia

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test
pnpm exec playwright install chromium   # raz
pnpm test:e2e
```

## Staging (Vercel + Neon)

1. Vercel: zaimportuj repozytorium (plan Pro, region funkcji `fra1` ustawia `vercel.json`). Włącz ochronę wdrożeń podglądowych (Deployment Protection).
2. Neon: projekt w regionie Frankfurt, integracja z Vercel tworzy gałąź bazy dla wdrożeń i ustawia `DATABASE_URL` oraz `DATABASE_URL_UNPOOLED`.
3. Vercel → Environment Variables: `PAYLOAD_SECRET`, `DATA_ENCRYPTION_KEY`, `DATA_HMAC_KEY`, `CRON_SECRET` (wartości z `pnpm env:init` albo `openssl rand -base64 32`), `NEXT_PUBLIC_SERVER_URL` (adres wdrożenia), opcjonalnie zmienne Sentry. Klucze szyfrowania trzymaj też w menedżerze haseł: bez nich zaszyfrowane dane są nie do odzyskania.

Build na Vercel uruchamia `pnpm vercel-build`: migracje przez połączenie bezpośrednie, potem `next build`. Poza produkcją każda odpowiedź ma `X-Robots-Tag: noindex`.

## Dokumentacja

- [docs/SPEC.md](docs/SPEC.md) – wymagania
- [docs/DESIGN.md](docs/DESIGN.md) – wygląd
- [docs/PLAN.md](docs/PLAN.md) – plan, pytania, konta i zmienne
- [docs/adr/](docs/adr/) – decyzje architektoniczne
- [docs/CHANGELOG.md](docs/CHANGELOG.md) – historia zmian
