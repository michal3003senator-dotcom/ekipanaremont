# 0001. Rdzeń: Next.js 16 i Payload 3 w jednym projekcie

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md ustala stack: Next.js 16 (App Router), Payload CMS 3 wbudowany w Next.js, TypeScript strict, Node.js LTS, pnpm. W rejestrze npm (7.10.2026) najnowsze są TypeScript 7.0.2, ESLint 10 i graphql 17, ale nie wszystkie narzędzia je obsługują.

## Decyzja
- Next 16.4.0, React 19.3.0, Payload 3.90.2; wszystkie pakiety `@payloadcms/*` w tej samej, dokładnej wersji.
- Node 24 LTS, pnpm 10.34.6 przez pole `packageManager`.
- TypeScript 6.0.3 (strict), ESLint 9.39.5, graphql 16.14.2 (peer `@payloadcms/next`, potrzebny mimo wyłączonego GraphQL).
- `src/proxy.ts` zamiast middleware (Next 16), Turbopack domyślnie, bez `cacheComponents` na start (spike w fazie 11).
- GraphQL Payload wyłączony; REST z ograniczonym `depth`.
- Panel Payload po polsku (`@payloadcms/translations`).

## Konsekwencje
- Aktualizacje Payload tylko grupowo, z pełnym CI.
- TS 7 i ESLint 10 dopiero, gdy obsłużą je typescript-eslint i wtyczki `eslint-config-next`.
- Payload 4 (obecnie canary): osobny ADR przed migracją.

## Odrzucone alternatywy
- TypeScript 7.0: typescript-eslint obsługuje `typescript <6.1.0`.
- ESLint 10: eslint-plugin-react, eslint-plugin-import i eslint-plugin-jsx-a11y deklarują ESLint ≤ 9.
- graphql 17: niezgodny z wymaganiem `^16.8.1`.
- pnpm 11/12: nowe wersje główne bez sprawdzonej zgodności z Vercel i szablonem Payload.
