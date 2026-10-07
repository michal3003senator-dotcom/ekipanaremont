# 0012. Hosting i środowiska

- Status: zaakceptowana (pytania 3 i 4 w PLAN.md)
- Data: 2026-10-07

## Kontekst
CLAUDE.md: Vercel, region `fra1`. Plan Hobby nie pozwala na użytek komercyjny, a cron działa tam najwyżej raz dziennie. Neon Free usypia bazę.

## Decyzja
- Vercel Pro, funkcje w regionie `fra1`.
- Środowiska: local (Docker), staging (wdrożenia podglądowe Vercel z ochroną dostępu, gałąź Neon, osobne buckety R2, `noindex`), produkcja od fazy 12.
- Neon płatny tylko dla produkcji (baza bez usypiania).
- Staging: migracje w kroku budowania Vercel (`pnpm vercel-build`) przez połączenie bezpośrednie do gałęzi Neon (`DATABASE_URL_UNPOOLED`).
- Produkcja (faza 12): migracje w CI przed wdrożeniem, przez połączenie bezpośrednie.

## Konsekwencje
- Poza produkcją każda odpowiedź ma nagłówek `X-Robots-Tag: noindex`.

## Odrzucone alternatywy
- Vercel Hobby: zakaz użytku komercyjnego, cron raz dziennie.
