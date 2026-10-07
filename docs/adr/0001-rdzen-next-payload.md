# 0001. Rdzeń: Next.js 16 i Payload 3 w jednym projekcie

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md ustala stack: Next.js 16 (App Router), Payload CMS 3 wbudowany w Next.js, TypeScript strict, Node.js LTS, pnpm. W rejestrze npm (7.10.2026) najnowsze są TypeScript 7.0.2, ESLint 10 i graphql 17, ale nie wszystkie narzędzia je obsługują.

## Decyzja
- Next 16.3.8, React 19.3.0, Payload 3.90.2; wszystkie pakiety `@payloadcms/*` w tej samej, dokładnej wersji. Next 16.4.0 ukazał się dobę przed startem (blokada świeżych paczek w `pnpm-workspace.yaml`), a szablon Payload 3.90.2 jest testowany na 16.3.
- Node 24 LTS, pnpm 10.34.6 przez pole `packageManager`.
- TypeScript 6.0.3 (strict), graphql 16.14.2 (peer `@payloadcms/next`, potrzebny mimo wyłączonego GraphQL).
- ESLint 9.39.5: ESLint 10 obsługuje dopiero `eslint-config-next` 16.4 (warstwa zgodności dla eslint-plugin-react i eslint-plugin-import). Gałąź 9 nie dostaje już poprawek – to narzędzie deweloperskie, więc ryzyko jest akceptowalne do czasu przejścia na Next 16.4.
- `src/proxy.ts` zamiast middleware (Next 16), Turbopack domyślnie, bez `cacheComponents` na start (spike w fazie 11).
- GraphQL Payload wyłączony; REST z ograniczonym `depth`.
- Panel Payload po polsku (`@payloadcms/translations`).

## Konsekwencje
- Aktualizacje Payload tylko grupowo, z pełnym CI.
- Next 16.4 i ESLint 10 – jedną zmianą, po upływie karencji.
- TS 7 dopiero, gdy obsłuży go typescript-eslint.
- Payload 4 (obecnie canary): osobny ADR przed migracją.

## Odrzucone alternatywy
- TypeScript 7.0: typescript-eslint obsługuje `typescript <6.1.0`.
- ESLint 10 z `eslint-config-next` 16.3: eslint-plugin-react przerywa lint (`context.getFilename is not a function`).
- graphql 17: niezgodny z wymaganiem `^16.8.1`.
- pnpm 11/12: nowe wersje główne bez sprawdzonej zgodności z Vercel i szablonem Payload.
