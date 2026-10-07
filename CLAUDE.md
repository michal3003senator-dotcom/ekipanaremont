# Ekipa na Termin – instrukcje projektu

## Czym jest projekt
Platforma ekipanatermin.pl łączy klientów z firmami remontowymi z województwa łódzkiego.
- Firmy (abonament, 30 dni próbnie) mają profile z realizacjami i **najbliższym wolnym terminem**. To główny wyróżnik serwisu.
- Klienci za darmo szukają firm, wysyłają zapytania i wystawiają opinie.
- Dodatkowo: CMS z artykułami i kalkulatorami, zamknięte forum firm, giełda sprzętu i materiałów między firmami, centrum moderacji na komputer i telefon.
- Platforma pośredniczy. Nie odpowiada za prace ani transakcje między stronami.

Pełna specyfikacja: `docs/SPEC.md`. Czytaj tylko sekcje potrzebne do bieżącego zadania.
Brief projektowy: `docs/DESIGN.md`. Czytaj go w całości przed każdą pracą nad interfejsem.
Plan faz i prompty: `docs/PROMPTY.md`. Decyzje: `docs/adr/`.

## Stack (nie zmieniaj bez mojej zgody)
- TypeScript (strict), Node.js LTS, pnpm
- Next.js 16 (App Router, React 19, Server Components domyślnie, Server Actions)
- Payload CMS 3 wbudowany w Next.js: panel admina, logowanie, reguły dostępu, wersje, edytor Lexical, Jobs
- PostgreSQL (Neon, region Frankfurt) przez `@payloadcms/db-postgres`; zmiany schematu tylko migracjami
- Pliki: Cloudflare R2 przez `@payloadcms/storage-s3`
- UI: Tailwind CSS 4 (tokeny w `@theme`), komponenty na Radix / shadcn/ui, Motion, ikony lucide
- Formularze: React Hook Form + Zod 4, jeden schemat dla klienta i serwera
- E-maile transakcyjne: Brevo + React Email
- Anty-bot: Cloudflare Turnstile. Limity żądań w warstwie aplikacji (np. Upstash Redis, region UE)
- Monitoring: Sentry (region UE). Statystyki: Plausible
- Testy: Vitest, Playwright, axe
- Hosting: Vercel, region `fra1`

## Zasady pracy
1. **Najpierw plan.** Przed każdą fazą i większą zmianą przedstaw plan: pliki, migracje, ryzyka. Czekaj na moją akceptację.
2. **Małe kroki.** Jedna funkcja = jedna gałąź = jeden pull request. Commity w konwencji Conventional Commits.
3. Po każdej zmianie muszą przejść: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
4. Nie zgaduj API bibliotek. Sprawdź typy w `node_modules` albo dokumentację.
5. Gdy specyfikacja jest niejasna lub sprzeczna, zapytaj. Nie wymyślaj wymagań.
6. Każdą decyzję architektoniczną zapisz w `docs/adr/NNNN-tytul.md`.
7. Na koniec zadania: krótki raport (co zrobione, jak to sprawdzić, co zostało) i wpis w `docs/CHANGELOG.md`.
8. Nowa zależność tylko z uzasadnieniem. Najpierw użyj tego, co już jest w stacku.
9. Nigdy nie proś mnie o wklejenie sekretów do czatu. Sekrety wpisuję sam do `.env.local`.

## Bezpieczeństwo (bezwzględne)
- Każda kolekcja Payload ma jawne `access` (read, create, update, delete). Domyślnie brak dostępu. Wrażliwe pola mają `access` na poziomie pola.
- Każda reguła dostępu ma test, np. firma A nie czyta zapytań firmy B, firma nie edytuje cudzego ogłoszenia.
- Dane kontaktowe osób (zapytania, leady, zgłoszenia, numery seryjne) szyfruj AES-256-GCM w hookach pól.
  - Klucz z env `DATA_ENCRYPTION_KEY`, wersja klucza zapisana w rekordzie.
  - Wyszukiwanie po e-mailu przez HMAC-SHA256 z kluczem `DATA_HMAC_KEY`.
- Każde wejście (Server Action, route handler, hook) walidowane Zod po stronie serwera.
- Upload: tylko obrazy sprawdzone po zawartości pliku, limit rozmiaru, ponowne kodowanie przez sharp, usunięcie EXIF.
- Treści z edytora renderuj tylko rendererem Lexical. Zero `dangerouslySetInnerHTML` bez sanityzacji.
- Nagłówki: CSP z nonce, HSTS, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy.
- Ciasteczka HttpOnly, Secure, SameSite=Lax. Konta personelu z 2FA (TOTP) i krótszą sesją.
- Limity żądań na: logowaniu, rejestracji, formularzach, forum, giełdzie.
- GraphQL Payload wyłączony. REST tylko tam, gdzie potrzebny, z ograniczonym `depth`.
- Sekrety tylko w env. Nigdy w kodzie, logach ani komunikatach błędów. Nie loguj danych osobowych.
- Fonty serwowane z własnej domeny (`next/font`). Zero zapytań do Google Fonts w przeglądarce.

## Design (premium, szczegóły w `docs/DESIGN.md`)
- Wygląd wyznacza `docs/DESIGN.md`, nie makiety. Poprzeczka: jakość wykonania na poziomie najlepszych produktów, nie szablon.
- Ciemny motyw domyślny z fioletowym akcentem, do tego jasny. Wszystkie wartości wyłącznie z tokenów.
- Element sygnaturowy: kafel terminu. Moment sygnaturowy: przejście zdjęcia z karty w profil (View Transitions).
- Mobile-first. **Panel firmy projektuj przede wszystkim na telefon**: fachowcy używają go na budowie.
- WCAG 2.2 AA: kontrast, widoczny fokus, obsługa klawiaturą, `prefers-reduced-motion`.
- **Pętla wizualna:** po każdym ekranie zrób zrzuty Playwright (390 i 1440 px, oba motywy), oceń je według listy z DESIGN.md, popraw i powtórz co najmniej dwa razy. Nie oddawaj ekranu bez tej pętli.
- Jeśli masz dostępny skill lub plugin do projektowania frontendu, użyj go przy pracy nad interfejsem.
- Teksty UI po polsku, naturalne i konkretne.

## Kod
- `src/`: `app/(frontend)`, `app/(payload)`, `collections/`, `globals/`, `blocks/`, `components/ui`, `components/features`, `lib/` (crypto, validation, auth, rate-limit, registry), `emails/`, `jobs/`, `tests/`.
- Server Components domyślnie, `'use client'` tylko tam, gdzie jest interakcja.
- Nazwy w kodzie po angielsku, treści UI po polsku.
- Małe funkcje, jedna odpowiedzialność. Żadnego `any` bez komentarza z uzasadnieniem.
- Daty w bazie w UTC, wyświetlanie w strefie Europe/Warsaw i w polskim formacie. Kwoty w groszach (integer).
- Moduły forum i giełdy włączane flagami w globalu `settings`. Gdy flaga jest wyłączona, trasy zwracają 404.

## Komendy
Wymagania: Node 24 (`.nvmrc`), pnpm przez Corepack (`corepack enable`), Docker.
- Start: `pnpm install`, `pnpm env:init` (tworzy `.env.local` z sekretami), `docker compose up -d --wait`, `pnpm dev` (najpierw uruchamia migracje). Strona: http://localhost:3000, panel: `/admin`.
- Sprawdzenia: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` (unit + int na bazie `ekipa_test`), `pnpm test:e2e` (Playwright; raz `pnpm exec playwright install chromium`).
- Zrzuty styleguide (pętla wizualna): `pnpm screens` przy działającym `pnpm dev` (zapis w `docs/screens/styleguide/`; bez przeglądarki Playwright: `CHROMIUM_PATH=<ścieżka do chromium>`).
- Schemat: `pnpm payload migrate:create <nazwa>`, `pnpm payload migrate`, potem `pnpm generate:types` i `pnpm generate:importmap` (oba pliki commitujemy, CI sprawdza aktualność).
- Build: `pnpm build`, `pnpm start`. Vercel: `pnpm vercel-build` (migracje + build).

## Definition of Done
- Spełnione kryteria akceptacji z promptu fazy.
- Lint, typecheck i testy zielone. Nowe reguły dostępu mają testy.
- Działa na telefonie (360 px) i komputerze, bez błędów w konsoli.
- Migracja dodana, jeśli zmienił się schemat. `.env.example` aktualny.
- Raport i wpis w `docs/CHANGELOG.md`.

## Poza zakresem (na razie)
Bramka płatności, mailing marketingowy, reklamy, aplikacja natywna. Zostaw miejsce w modelu danych (np. `subscriptionStatus`), ale ich nie implementuj.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
