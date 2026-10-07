# 0002. Baza danych: PostgreSQL (Neon) i migracje

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md: PostgreSQL w Neon (Frankfurt) przez `@payloadcms/db-postgres`, zmiany schematu tylko migracjami. Wyszukiwarka wymaga pg_trgm (SPEC 4).

## Decyzja
- `push: false` także lokalnie; każda zmiana schematu to migracja w `src/migrations/`. `pnpm dev` najpierw uruchamia `payload migrate`.
- Identyfikatory UUID (`idType: 'uuid'`) od pierwszej migracji – rekordów nie da się wyliczać po kolejnych numerach.
- pg_trgm z kolumną znormalizowaną (małe litery, bez diakrytyków) i indeksem GIN; rozszerzenie i indeksy dopisywane ręcznie w migracji (faza 3).
- Neon: aplikacja przez pooler (`DATABASE_URL`), migracje przez połączenie bezpośrednie (`DATABASE_URL_UNPOOLED`), mała pula.
- Lokalnie PostgreSQL 17 w Dockerze (ta sama wersja główna co w Neon) i osobna baza testowa.

## Konsekwencje
- Po każdej zmianie kolekcji `pnpm payload migrate:create`. W zamian lokalna baza przechodzi tę samą ścieżkę co produkcja, a CI sprawdza migracje na pustej bazie.
- Zmiana typu ID później wymagałaby przebudowy wszystkich tabel, dlatego UUID od początku.

## Odrzucone alternatywy
- `push: true` w dev: mieszanie push i migracji rozjeżdża schemat i wymusza pytania o utratę danych przy `migrate`.
- ID liczbowe (domyślne): ujawniają liczbę rekordów i ułatwiają enumerację.
- PostGIS: promień wystarczy policzyć wzorem haversine z prefiltrem prostokątnym.
