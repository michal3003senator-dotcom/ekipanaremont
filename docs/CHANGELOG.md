# Changelog

Wszystkie istotne zmiany w projekcie. Format według [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), daty w strefie Europe/Warsaw.

## [Nieopublikowane]

### Miasta, usługi i czytelny kafel terminu (2026-10-10)
- Miasta: znacznik `isCity` (60 miast województwa wg TERYT, migracja uzupełnia dane); puste pole „Gdzie?” pokazuje Łódź z dzielnicami i wszystkie miasta, podpowiedzi stawiają miasta przed wsiami; nowa strona `/miasta`.
- Usługi: słownik z 15 do 39 kategorii i 223 rodzajów prac (m.in. kuchnie, budowa domu, ogrzewanie i pompy ciepła, klimatyzacja, fotowoltaika, alarmy i smart home, ogrodzenia, bruk, ogrody, roboty ziemne, rozbiórki, złota rączka, projektowanie, nadzór); dotychczasowe adresy bez zmian; nowa strona `/uslugi`; pole „Czego szukasz?” rozwija listę po kliknięciu.
- Kafel terminu (ADR 0025): nagłówek „Najbliższy wolny termin” z datą i odstępem, numery dni, obwódka dziś, legenda, fiolet tylko dla wolnego dnia.
- Menu: „Usługi” i „Miasta”; mapa strony z nowymi stronami.

### Faza 12 – przygotowanie wdrożenia (2026-10-10)
- `docs/RUNBOOK.md`: usługi i zmienne, wdrożenie i pierwsze uruchomienie, wycofanie wersji, kopia i odtworzenie bazy (Neon PITR), rotacja kluczy, incydent (72 h na zgłoszenie do UODO), wnioski RODO klientów bez konta, zadania cykliczne, lista kontrolna startu.
- `.env.example`: zmienne R2 (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`).

### Faza 10 – audyt bezpieczeństwa i RODO (2026-10-10)
- Raport `docs/AUDYT.md`: 8 poprawek, 5 punktów otwartych z propozycjami.
- Pliki w Cloudflare R2 (`@payloadcms/storage-s3`, prywatny kubełek, reguły dostępu Payload); bez R2 na Vercelu start się zatrzymuje. Migracja `media_storage`.
- Retencja: zadanie `anonymizeInquiries` usuwa dane klienta i zdjęcia zapytań po `retention.inquiriesMonths`. Migracja `inquiry_retention`.
- REST: endpointy logowania i resetu hasła kont firm zablokowane (tylko formularze serwisu z Turnstile i limitami), logowanie personelu z limitem na IP.
- Telefon firmy niedostępny w `GET /api/firms`; treści zawieszonej firmy i zdjęcia forum/giełdy niepubliczne także w REST.
- Blokada konta obejmuje akcje panelu; eksport i usunięcie danych działają mimo blokady.
- Produkcja wymaga Upstash, Turnstile, SMTP i `CRON_SECRET` (walidacja środowiska).
- Zależności: nodemailer 10.0.10, undici ≥ 7.29.1, dompurify ≥ 3.4.16 (nadpisania pnpm).

### Faza 7 – centrum moderacji i zgłoszenia (2026-10-10)
- `/moderacja` (moderator i administrator po 2FA, telefon najpierw):
  - kolejki Profile, Opinie, Zgłoszenia z licznikami; bez wyboru otwiera pierwszą z oczekującymi;
  - karty z kontekstem (dane z rejestru, wcześniejsze decyzje, sankcje kont), wyszukiwanie po nazwie lub NIP;
  - zatwierdzenie jednym dotknięciem, decyzje ograniczające z uzasadnieniem i szablonami z `settings`;
  - ostrzeżenie lub blokada (forum, giełda, całe konto; 7, 30, 90 dni lub bezterminowo);
  - instalacja jako aplikacja (manifest).
- Zgłoszenia DSA: przycisk „Zgłoś” przy profilu, opinii i artykule (Zod, Turnstile, limit 5/h, e-mail szyfrowany, oświadczenie o dobrej wierze, potwierdzenie e-mailem).
- Rejestr decyzji i odwołania (ADR 0024): każda decyzja ograniczająca – także z panelu Payload – wymaga uzasadnienia, trafia do `reports` i auditLog, autor dostaje e-mail z linkiem `/odwolanie/…` (183 dni), zgłaszający – decyzję z uzasadnieniem.
- Blokada całego konta zamyka panel firmy do końca blokady.
- Pulpit panelu Payload: do moderacji, nowe firmy (7 dni), aktywne terminy, zapytania (7 i 30 dni), koniec okresu próbnego w 7 dni.
- Zadania: powiadomienie moderatorów co godzinę przy nowych zgłoszeniach i codzienne podsumowanie.
- Migracja `phase7_moderation`. Testy: 8 integracyjnych (moderacja, zgłoszenia, odwołania, blokady), E2E: zatwierdzenie z telefonu, odrzucenie z uzasadnieniem, zgłoszenie z profilu, axe.

### Dane przykładowe i dokumenty (2026-10-07)
- `pnpm seed demo` (tylko lokalnie):
  - 20 nowych firm z długimi opisami, 56 realizacjami ze zdjęciami i 85 opiniami (część z emotikonami i odpowiedziami firm);
  - 10 artykułów w 6 kategoriach z okładkami;
  - opublikowane 4 kalkulatory (parametry testowe) i dokumenty.
  - Zdjęcia: ręcznie wybrane z Pexels (bezpłatna licencja), pobierane raz do `.cache/demo-photos`, tylko do demo.
- Regulamin, polityka prywatności (z plikami cookies), „Jak sprawdzamy opinie”, „Zasady moderacji”, „Kontakt”, „O nas”:
  - `pnpm seed` tworzy je jako szkice do przeglądu przez prawnika;
  - dane operatora do uzupełnienia w `scripts/demo/pages.ts`.
- Usunięcie firmy (także w `/admin`) usuwa jej realizacje, zdjęcia, opinie, zapytania, statystyki i ogłoszenia.
- Stopka w kolumnach: Serwis, Poradnik (kategorie), Popularne w Łodzi, Informacje. Menu na telefonie ze stronami informacyjnymi.
- Poprawka: profile, wyniki i artykuły ze zdjęciami nie zwracają już błędu 500. Adresy plików z Payload są względne, więc `next/image` je przyjmuje pod każdym adresem.
- Codespaces: serwer deweloperski przyjmuje akcje z `*.app.github.dev` także bez zmiennych środowiska i wypisuje rozpoznany adres.

### Faza 6 – treści (2026-10-07)
- ADR 0022 (trasy treści, harmonogram publikacji) i ADR 0023 (podgląd na żywo w ramce tylko w trybie podglądu).
- Artykuły `/artykuly`:
  - bloki: tekst, nagłówek z kotwicą, zdjęcie, galeria, cytat, FAQ (z JSON-LD FAQPage), tabela przewijana na telefonie, przycisk, kalkulator, polecane firmy;
  - kategorie (`/artykuly/kategoria/[slug]`), podpis autora, czas czytania liczony z treści, podobne artykuły, JSON-LD Article;
  - szkice z autozapisem, wersje, publikacja planowana polem „Opublikuj automatycznie” (zadanie co godzinę, zamiast `schedulePublish`, które omijało 2FA).
- Podgląd na żywo w panelu (artykuły, strony, kalkulatory), telefon i komputer:
  - `/podglad` tylko dla redakcji z 2FA;
  - `frame-ancestors 'self'` wyłącznie przy ciasteczku trybu podglądu, reszta serwisu bez zmian (`'none'`).
- Kalkulatory `/kalkulatory`: łazienka (widełki robocizny i materiałów), płytki, farba, gładź.
  - Wszystkie ceny i parametry ustawiasz w `/admin` (kwoty w złotych, w bazie grosze); w kodzie nie ma domyślnych cen.
  - Kalkulator bez kompletu parametrów nie przejdzie publikacji i nie pokaże się publicznie.
  - Pod wynikiem „Znajdź firmę z wolnym terminem” prowadzi do wyszukiwarki z usługą, a wynik trafia do opisu zapytania.
  - „Poproszę o kontakt” zapisuje lead (Zod, Turnstile, limit 5 na godzinę, dane zaszyfrowane, zgoda z wersją polityki, retencja z ustawień).
- Strony z CMS pod `/[slug]` (regulamin, polityka prywatności, jak sprawdzamy opinie, zasady moderacji, kontakt, o nas):
  - dokument prawny ma wersję i datę obowiązywania, archiwum `/[slug]/wersje`;
  - rejestracja, zapytanie i lead zapisują wersję z opublikowanego dokumentu (`settings.legalVersions` usunięte);
  - adres strony nie może pokryć się z trasą serwisu ani usługą.
- Menu pokazuje „Poradnik” i „Kalkulatory” tylko wtedy, gdy jest w nich treść; stopka linkuje tylko opublikowane strony.
- Strony lokalne `/[usluga]/[miejscowosc]`:
  - usługa główna × dzielnica Łodzi albo siedziba gminy;
  - firmy od najbliższego terminu, opcjonalny wstęp z CMS, powiązane artykuły, JSON-LD;
  - 404 i brak w mapie strony, gdy nie ma żadnej firmy.
- `sitemap.xml`: strony lokalne, artykuły, kategorie, kalkulatory i strony.
- `pnpm seed` tworzy szkice 4 kalkulatorów i 6 stron (treść regulaminu i polityki od prawnika). `pnpm seed demo` publikuje przykładowy artykuł i kalkulator łazienki z cenami testowymi.
- Codespaces: aplikacja sama rozpoznaje adres przekierowanego portu (akcje serwera, panel, HMR), naprawia „Invalid Server Actions request” przy zmianie motywu i w `/admin`. `pnpm demo`: konfiguracja, baza, dane przykładowe i serwer jedną komendą.
- Panel: pierwsze logowanie personelu nie wpada już w pętlę przekierowań na `/admin/setup-totp` (proxy przekazuje ścieżkę wtyczce 2FA); test E2E konfiguracji 2FA.
- Wydajność (Lighthouse mobile, build produkcyjny; artykuł, kalkulator, strona lokalna):
  - wydajność 93–98, dostępność 100, dobre praktyki 100, CLS 0;
  - SEO obniża tylko celowy `noindex` poza produkcją.
- Testy:
  - unit: wzory kalkulatorów, zł ↔ grosze, CSP i nagłówki podglądu, czas czytania, ścieżki;
  - int: dostęp do treści i wersji, publikacja kalkulatora tylko z parametrami, kolizje adresów, wersje dokumentów w zgodach, lead, harmonogram, strony lokalne, archiwum wersji;
  - E2E: redaktor loguje się z TOTP, dodaje blok kalkulatora i publikuje artykuł, a gość liczy wynik i przechodzi do wyszukiwarki; strony lokalne i mapa strony; axe stron treści w obu motywach.
- Zrzuty: `docs/screens/tresci` (`SCREENS_SET=tresci pnpm screens`).

### Faza 5 – część publiczna (2026-10-07)
- ADR 0020: jasny motyw domyślny z fioletowym akcentem i krój Archivo (ciemny w przełączniku); ADR 0021: budżet wydajności.
- Wyszukiwanie:
  - usługa z podusługami, miejscowość z podpowiedziami odpornymi na literówki (`pg_trgm`), termin 7/14/30 dni;
  - filtry w adresie: promień 10/25/50 km, zakres prac, faktura VAT, ocena 4,5+, gwarancja;
  - wyniki od najbliższego aktywnego terminu, firmy bez terminu na końcu, po 12 na stronę;
  - pusty wynik z jedną akcją poszerzającą.
- Strona główna: wyszukiwarka, „Często szukane”, prawdziwe najbliższe terminy, „Jak to działa”, wejście dla firm.
- Profil firmy `/firma/[slug]`:
  - nagłówek z kaflami terminu, panel boczny przyklejony (na telefonie dolny pasek);
  - realizacje z galerią, usługi, opinie z rozkładem ocen, o firmie (Lexical), dane z rejestru, podobne firmy;
  - „Pokaż numer telefonu” i wyświetlenia raz na sesję liczone w statystykach dziennych;
  - JSON-LD LocalBusiness z AggregateRating, obrazki do udostępniania (OG).
- Zapytanie z profilu:
  - Zod, Turnstile, limit 5 na godzinę na skrót IP, do 5 zdjęć zmniejszanych w przeglądarce (widzi je tylko firma-adresat), dane zaszyfrowane;
  - e-mail do firmy bez danych klienta, potwierdzenie dla klienta, strona „Zapytanie wysłane”.
- Opinie:
  - zadanie dzienne wysyła jednorazowy link (ważny 30 dni, w bazie tylko skrót) po `reviewDelayDays`;
  - formularz `/opinia/[token]`, opinia czeka na moderację, jedna na zapytanie.
- `sitemap.xml` (strona główna i aktywne profile, co godzinę) i `robots.txt` (bez `/panel`, `/api`, `/admin`, `/opinia`).
- Wydajność (Lighthouse mobile, build produkcyjny): wydajność 94–99, dostępność 98–100, dobre praktyki 100. Na tę zmianę złożyły się:
  - podzbiór Archivo 38 KB;
  - brak Zod i Motion w kodzie stron publicznych;
  - Sentry bez kodu tracingu;
  - nagłówek `Critical-CH` tylko w `/admin`.
- Poprawki: wyszukiwarka nie blokuje wysłania przy „Obojętnie”; w CI przed testami E2E ładowane są słowniki (`pnpm seed`).
- Testy:
  - unit: parametry URL, JSON-LD, token opinii, schematy;
  - int: wyszukiwanie z promieniem i filtrami, liczniki przy równoległych wywołaniach, zapytanie z e-mailami i limitem, opinie z linku;
  - E2E: wyszukanie → profil → zapytanie → panel firmy → link do opinii → opinia czeka na moderację (360 px i komputer), axe ekranów publicznych w obu motywach.
- Zrzuty: `docs/screens/publiczne` (`SCREENS_SET=publiczne pnpm screens`).

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
