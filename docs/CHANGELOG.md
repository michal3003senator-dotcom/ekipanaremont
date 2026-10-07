# Changelog

Wszystkie istotne zmiany w projekcie. Format według [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), daty w strefie Europe/Warsaw.

## [Nieopublikowane]

### Faza 4 – konta i panel firmy (2026-10-07)
- ADR 0018 (uwierzytelnianie firm) i ADR 0019 (rejestry NIP).
- Konta: rejestracja (hasło min. 12 znaków z oceną siły, zgoda z wersją regulaminu, Turnstile, limit prób), potwierdzenie e-maila linkiem ważnym 24 h, logowanie z blokadą po 5 próbach, reset hasła (link 1 h). Odpowiedzi nie zdradzają, czy konto istnieje.
- Weryfikacja NIP: suma kontrolna → CEIDG (z tokenem) → Biała lista VAT → KRS; firma spoza rejestrów podaje nazwę, a moderator sprawdza ją ręcznie.
- Kreator profilu w 5 krokach: NIP, usługi i obszar (TERYT), o firmie, realizacje (min. 3 zdjęcia), wysłanie do akceptacji. Okres próbny (30 dni) startuje przy zatwierdzeniu, firma dostaje e-mail z decyzją.
- Panel firmy (najpierw telefon, dolna nawigacja): pulpit z brakami profilu, kafel terminu z potwierdzeniem jednym dotknięciem, zapytania ze statusami i szybkim kontaktem, realizacje ze zdjęciami z aparatu (zmniejszanie w przeglądarce, WebP bez EXIF w kilku rozmiarach, kolejność przeciąganiem albo strzałkami), opinie z odpowiedzią (edycja 24 h), ustawienia: powiadomienia, hasło, e-mail, eksport JSON, usunięcie konta.
- E-maile React Email (HTML i tekst): potwierdzenie adresu, reset hasła, decyzja moderatora, przypomnienie i wygaśnięcie terminu, koniec okresu próbnego za 7 i 1 dzień. Lokalnie Mailpit (`http://localhost:8025`).
- Zadania dzienne: przypomnienie o terminie z jednorazowym linkiem (potwierdzenie przyciskiem na stronie), wygaszanie terminów, koniec okresu próbnego; każde wysyła raz.
- Pierwsze konto personelu w `/admin` jest administratorem. Unikalne adresy firm i wątków przy powtórzonej nazwie.
- `pnpm seed demo`: konto `demo@ekipanatermin.test` z zapytaniami i opinią (hasło w `.env.local`, `SEED_DEMO_PASSWORD`).
- Testy: integracyjne akcji kont i panelu (firma A vs B, zdjęcia bez EXIF, zadania wysyłają raz, rotacja), E2E rejestracja → NIP → profil → wysłanie do akceptacji → termin jednym dotknięciem (360 px i komputer) z axe w obu motywach. Zrzuty: `docs/screens/konto`, `docs/screens/panel`.

### Faza 3 – model danych i reguły dostępu (2026-10-07)
- Szyfrowanie pól (S) AES-256-GCM z wersją klucza w rekordzie i skróty HMAC-SHA256 (osobny klucz na cel).
- ADR 0016: 2FA personelu (`payload-totp`, obowiązkowe), dostęp personelu tylko po kodzie TOTP, sekret TOTP zaszyfrowany, sesja 8 h.
- Kolekcje według SPEC 4: firmy, konta firm, realizacje, pliki (WebP przez sharp, bez EXIF, limit 10 MB, odrzucanie plików niebędących obrazami), zapytania i leady z zaszyfrowanymi danymi kontaktowymi, opinie (średnia ocen w firmie), artykuły i strony z blokami, szkicami i wersjami, kalkulatory z parametrami walidowanymi schematem typu, global `settings` (flagi forum i giełdy, dni, retencja, wersje dokumentów), forum, giełda, wiadomości, zgłoszenia DSA, sankcje, statystyki dzienne, dziennik zmian (tylko dopisywanie, bez wartości pól).
- Forum i giełda tylko dla firm zweryfikowanych i aktywnych (flaga modułu, e-mail, NIP, profil, abonament, brak blokady). Nowe wpisy forum czekają na moderację.
- Migracje schematu i indeks `pg_trgm` do wyszukiwania miejscowości bez polskich znaków.
- Zadania cykliczne: endpoint Payload Jobs tylko z `CRON_SECRET` albo dla administratora; pierwsze zadanie – usuwanie leadów po retencji.
- `pnpm env:init`: tworzy `.env.local` i sam wpisuje losowe sekrety (bez kopiowania). `DATA_ENCRYPTION_KEY` i `DATA_HMAC_KEY` są teraz wymagane.
- ADR 0017: słownik miejscowości łódzkiego z TERYT i PRNG w `data/teryt-lodzkie.json` (24 powiaty, 177 gmin, 4547 miast i wsi, 5 dzielnic Łodzi, współrzędne), `pnpm teryt:build`, `pnpm seed` (idempotentny), `pnpm seed demo` (6 firm przykładowych, tylko lokalnie).
- Propozycja słownika usług (`data/services.json`, 15 usług z podusługami) – do akceptacji.
- Rotacja klucza szyfrowania: `pnpm rotate-key` przepisuje wartości starszej wersji kluczem bieżącym.
- Vercel Cron: kolejki `daily` i `hourly` uruchamiane z `CRON_SECRET`.
- Testy: 41 testów dostępu na bazie (gość, firma A i B, firma zawieszona, moderator, redaktor, administrator z kodem i bez), w tym szyfrowanie w bazie, odszyfrowanie tylko dla uprawnionych i rotacja klucza.

### Próby kierunku poza DESIGN.md (2026-10-07)
- Próby „Tynk i fuga” i „Kartka z budowy”; druga odrzucona. Na bazie pierwszej `/kierunki/jasny`: jasna strona prowadząca prosto do wyszukania (jedno pole, skróty „Często szukane”, 3 kroki, wyniki od najbliższego terminu), palety do wyboru: granat, czerń z pomarańczowym, fiolet.

### Faza 2b – runda „premium” (2026-10-07)
- ADR 0015: własny fiolet (`#6B3FF5` ciemny, `#5A2FE0` jasny) i liczby w Instrument Sans z cyframi tabelarycznymi (bez JetBrains Mono).
- Materia: jasna górna krawędź kart i paneli, kafle jak szkliwione płytki, ramka zdjęć, lżejsze nagłówki, wciśnięcie przycisków.
- `/styleguide/glowna`: prototyp strony głównej (wyszukiwarka, grafik, realizacja na szerokość, wyniki) do oceny kierunku na pełnym ekranie.

### Faza 2b – design system (2026-10-07)
- ADR 0013: kierunek B „Grafik” (Instrument Sans 75/100 + JetBrains Mono), z A zdjęcie realizacji na pasku kafli w profilu. ADR 0014: biblioteki komponentów.
- Kroje globalnie przez `next/font`, rola „dane” z cyframi tabelarycznymi; tokeny animacji nakładek, warianty `state-*` dla Radix; test blokujący wartości spoza tokenów.
- Motyw: ciemny domyślnie, przełącznik zapisuje ciasteczko HttpOnly przez Server Action (Zod), `data-theme` na `<html>` bez mrugania.
- Komponenty (`src/components/ui`): Button, Field, Input, Textarea, Select, Combobox (WAI-ARIA, bez polskich znaków), DatePicker, Checkbox, Radio, Switch, Badge, Rating, RatingInput, Dialog, Sheet z gestem, Toast, Tabs, Pagination, Breadcrumbs, EmptyState, ErrorState, Skeleton.
- Funkcjonalne i układy: kafel terminu, FirmCard, FirmBoard (grafik), FirmProfileHeader, ProjectGallery z lightboxem, SiteHeader z menu w dolnym panelu, SiteFooter, PanelBottomNav; przejście zdjęcia karty w profil (View Transitions).
- `/styleguide` (poza produkcją): wszystkie komponenty w stanach; zrzuty w `docs/screens/styleguide/` (`pnpm screens`). Usunięto `/design-lab` (zrzuty decyzji zostają).
- Testy: jednostkowe (`cn`, tokeny, motyw, wyszukiwanie, paginacja, daty), e2e na 360 px i komputerze: axe WCAG 2.2 AA w obu motywach, klawiatura (okno, podpowiedzi, zakładki, galeria, kalendarz), motyw po przeładowaniu, przejście karta → profil, ograniczony ruch.

### Faza 2a – kierunek wizualny (2026-10-07)
- Tokeny w Tailwind CSS 4 (`src/app/(frontend)/globals.css`): kolory obu motywów z DESIGN.md i nowe z planu fazy (`line-strong`, `on-accent`, `accent-hover`, `scrim`, jasny `success` #166534), skala tekstu, zaokrąglenia, ruch. Domyślna paleta i skala Tailwinda wyłączone.
- Kafel terminu, wersja 1 (`src/components/features/availability-tiles/`): 4 stany, 3 rozmiary, animacja raz po wejściu w ekran (≤ 400 ms), stan końcowy bez JS i przy ograniczonym ruchu, pełne zdanie dla czytników ekranu.
- Formaty polskie (`src/lib/format/`): daty w strefie Europe/Warsaw, „dziś”, „wczoraj”, „2 dni temu”, „1 250 zł”, odmiana rzeczowników po liczbie.
- `/design-lab` (poza produkcją, `noindex`): warianty A „Realizacja”, B „Grafik” i C „Zdanie” na trzech zestawach krojów. Zdjęcia poglądowe z Unsplash tylko tutaj (`_photos/ZRODLA.md`).
- Pętla wizualna: 3 rundy, zrzuty końcowe w `docs/screens/design-lab/` (`pnpm screens:design-lab`).
- Testy: jednostkowe formatów, modelu kafla i blokady produkcji; e2e design labu (bez błędów konsoli i CSP, 404, `noindex`, animacja, ograniczony ruch).
- Poprawka z pętli: przy motywie ustawionym na fragmencie strony własny CSS czyta `--line`, `--accent`…, a nie `--color-*`.

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
