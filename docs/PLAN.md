# Ekipa na Termin – plan projektu

Wynik Promptu 0 (`docs/PROMPTY.md`). Wersje pakietów sprawdzone w rejestrze npm 7.10.2026, wybrane fragmenty Payload w kodzie paczek. Decyzje architektoniczne: `docs/adr/`.

**Status (7.10.2026):** właściciel przyjął rekomendacje. Pytania 1–5 są rozstrzygnięte zgodnie z nimi (ADR 0009, 0012). Rekomendacje 6–28 obowiązują jako domyślne i wracają do potwierdzenia w planie właściwej fazy.

Spis treści:
1. [Pytania do rozstrzygnięcia](#1-pytania-do-rozstrzygnięcia)
2. [Ryzyka i ograniczenia](#2-ryzyka-i-ograniczenia)
3. [Plan faz](#3-plan-faz)
4. [Struktura i pakiety](#4-struktura-i-pakiety)
5. [Konta i zmienne środowiskowe](#5-konta-i-zmienne-środowiskowe)

---

## 1. Pytania do rozstrzygnięcia

Każde pytanie ma moją rekomendację („Rek.”). Odpowiadaj numerami; „OK” oznacza przyjęcie rekomendacji.

### Przed fazą 1
1. **Domena.** CLAUDE.md podaje `ekipanatermin.pl`, a repo nazywa się `ekipanaremont`. Gdzie jest DNS? Rek.: `ekipanatermin.pl`, DNS w Cloudflare (R2, Turnstile i SPF/DKIM/DMARC w jednym miejscu).
2. **CSP a strony statyczne.** CSP z nonce (CLAUDE.md) wymusza renderowanie dynamiczne każdej strony. SPEC 6 chce stron statycznych. Rek.: nonce na wszystkich stronach, renderowanie dynamiczne z cache danych (tagi i `revalidateTag` po zmianie w CMS). Świeżość zostaje, a narzut TTFB jest niewielki (fra1 + Neon Frankfurt).
3. **Staging od fazy 1?** Rek.: tak. Wdrożenia podglądowe Vercel z ochroną dostępu, osobna gałąź Neon, osobny bucket R2, `noindex`. Produkcja dopiero w fazie 12.
4. **Plany płatne.** Vercel Hobby nie pozwala na użytek komercyjny, a cron uruchamia najwyżej raz dziennie (godzinowe zadania i harmonogram publikacji wymagają Pro). Neon Free usypia bazę, co daje zimny start. Rek.: Vercel Pro, Neon płatny tylko dla produkcji.
5. **ASVS i sesje.** ASVS 5.0 (aktualny) dopuszcza czasy sesji wynikające z analizy ryzyka. Rek.: firma ma sesję 30 dni odnawianą przy aktywności, a zmiana e-maila lub hasła, eksport i usunięcie konta wymagają ponownego podania hasła. Personel: maks. 8 h, wylogowanie po 30 min bezczynności, 2FA przy każdym logowaniu.

### Przed fazą 3 (model danych)
6. **Obszar działania firmy:** wybór jednostek czy promień? Rek.: firma wybiera powiaty, gminy lub Łódź, a dopasowanie jest hierarchiczne. Filtr „promień” liczy odległość od `baseLocality` do szukanej miejscowości.
7. **Współrzędne.** SIMC (TERYT) nie ma lat/lng. Rek.: PRNG z GUGiK (otwarte dane), łączone po identyfikatorze SIMC. Zgodność sprawdzę przy imporcie.
8. **Import TERYT.** Rek.: miasta i wsie (bez części miejscowości, przysiółków i kolonii) oraz 5 dzielnic Łodzi jako nowy typ `dzielnica`. Duplikaty nazw: slug `wola-zelow`, a w podpowiedzi „Wola, gm. Zelów, pow. łaski”.
9. **Koniec okresu próbnego bez płatności.** Rek.: firma przechodzi w `past_due` i znika z katalogu. Admin może masowo przedłużyć `trialEndsAt`. Katalog pokazuje firmy z `status=active` i `subscriptionStatus ∈ {trial, active}`. Cena przyda się tylko do tekstów.
10. **Słowniki formularza.** Rek.: budżet: do 5 tys., 5–15, 15–40, 40–100, pow. 100 tys. zł, „nie wiem”. Termin: jak najszybciej, do miesiąca, 1–3 mies., później, elastycznie.
11. **Usługi (z podusługami) i kategorie giełdy** (SPEC 9). Rek.: przygotuję propozycję do akceptacji. Slugi usług z listy zastrzeżonej (nazwy tras) są zablokowane.
12. **Wersje dokumentów prawnych** są w dwóch miejscach: `settings.legalVersions` i `pages.legalVersion`. Rek.: jedno źródło w `pages` (wersja i `effectiveFrom`).
13. **Konta.** Rek.: 1 login = 1 firma w v1. Na forum autorem jest nazwa firmy ze znacznikiem. Obserwowany wątek wysyła najwyżej 1 e-mail do następnej wizyty.
14. **DSA art. 16 ust. 2** wymaga imienia i nazwiska (lub nazwy) zgłaszającego oraz oświadczenia o dobrej wierze. W modelu `reports` ich nie ma. Rek.: dodać `reporterName` (S) i `goodFaithConfirmed`.

### Przed fazą 4 (firmy)
15. **Rejestry.** API KRS nie wyszukuje po NIP. Spółka zwolniona z VAT nie ma wpisu na Białej liście, więc nie poznamy jej numeru KRS. Rek.: dodać GUS REGON (BIR1, darmowy klucz) i sprawdzać kolejno: CEIDG → GUS → KRS → Biała lista. Gdy firmy nie ma w rejestrach (np. spółka cywilna) albo rejestr nie działa, weryfikuje ją ręcznie moderator.
16. **Reprezentacja.** Rejestr potwierdza, że firma istnieje, ale nie to, że rejestrujący ją reprezentuje. Rek.: przy akceptacji moderator potwierdza kontakt przez telefon albo e-mail z rejestru lub strony firmy. Gdy NIP jest już zajęty, sprawa trafia do moderacji. Po wejściu płatności: przelew weryfikacyjny z rachunku z Białej listy.
17. **Skanery poczty** same otwierają linki. Link GET z e-maila potwierdziłby więc termin bez udziału firmy. Rek.: link otwiera stronę z jednym przyciskiem „Potwierdzam termin” (bez logowania, token podpisany). To samo dotyczy przedłużenia ogłoszenia.
18. **Dane rejestrowe na profilu.** Rek.: nazwa, NIP, REGON, KRS, źródło i data weryfikacji, miejscowość siedziby bez ulicy (u JDG to często adres domowy).

### Przed fazą 5
19. **Komu wysyłać prośbę o opinię?** Rek.: po każdym zapytaniu z wyjątkiem oznaczonych jako `spam`. Moderator widzi odsetek „spam” danej firmy.
20. **Drobne reguły.** Rek.:
    - sortowanie po średniej bayesowskiej, a na ekranie zwykła średnia;
    - filtr „4,5+” od 3 opinii;
    - „gwarancja” to `warrantyMonths ≥ 1`;
    - „podobne firmy” to ta sama usługa i wspólny obszar;
    - odpowiedź firmy na opinię publikowana od razu;
    - klient nie edytuje opinii.

### Przed fazami 6–9
21. **Strony lokalne.** Firma z obszarem „cały powiat” wygeneruje setki niemal identycznych stron (ryzyko doorway pages). Rek.: tylko Łódź, dzielnice Łodzi, miasta i siedziby gmin. Mapa adresów jak w sekcji 4.
22. **Kalkulatory.** Kto daje wzory i parametry startowe? Rek.: przygotuję wzory z wartościami domyślnymi, a Ty je zweryfikujesz.
23. **Leady.** Do czego służą? Rek.: widzi je tylko admin. Firmie przekazujemy je tylko za osobną zgodą.
24. **Moderacja.** SPEC 3.11 mówi o podsumowaniu raz dziennie, a SPEC 5 co godzinę. Rek.: co godzinę tylko przy nowych zgłoszeniach i raz dziennie zbiorczo. Moderator pracuje tylko w `/moderacja`, bez `/admin`.
25. **Giełda** ma sprzeczność: „bez ujawniania e-maili” i „odpowiedzi poza platformą”. Rek.: e-mail do sprzedającego zawiera treść, nazwę i profil firmy nadawcy oraz jej telefon. Opcja „Pokaż mój e-mail” ustawia Reply-To.

### Prawnik (blokuje produkcję, nie kod)
26. **Treści:**
    - regulamin;
    - polityka prywatności;
    - zasady moderacji;
    - „Jak sprawdzamy opinie” (wymóg Omnibus);
    - przedmioty zakazane na giełdzie;
    - dane administratora danych.
27. **Retencja.** SPEC: zapytania 24 mies., leady 12 mies. Brakuje okresów dla auditLog, zgłoszeń i decyzji, wiadomości giełdy i nieaktywnych kont. Skutki usunięcia konta firmy. Rek.: profil i ogłoszenia usunięte, posty jako „Konto usunięte”, opinie ukryte, zapytania anonimizowane.
28. **DSA i transfery.** Czy operator to mikro- lub małe przedsiębiorstwo (art. 19, zwolnienie m.in. z bazy przejrzystości KE)? Vercel, Cloudflare, Sentry i Upstash to dostawcy z USA: dane leżą w UE, potrzebne są DPA i SCC.

---

## 2. Ryzyka i ograniczenia

### Payload 3 + Next.js 16
- Zgodność wersji:
  - `@payloadcms/next@3.90.2` wymaga `next >=16.3.3 <17` i `graphql ^16.8.1` (nie 17);
  - wszystkie `@payloadcms/*` muszą mieć tę samą wersję, więc przypinam dokładne wersje i aktualizuję grupowo z pełnym CI;
  - Payload 4 jest dopiero w wersji canary, więc start na 3.x, a migracja po osobnym ADR.
- TypeScript 7 (natywny) nie działa z typescript-eslint (`<6.1.0`). Wtyczki w `eslint-config-next` nie obsługują ESLint 10. Rozwiązanie: TS 6.0.3 i ESLint 9.39.5.
- Next 16:
  - `proxy.ts` zastępuje middleware, a `next lint` już nie istnieje;
  - Turbopack jest domyślny;
  - `cacheComponents` w połączeniu z panelem Payload jest niepewne: start bez niego, spike w fazie 11.
- REST Payload jest potrzebny panelowi. Ograniczenia: GraphQL wyłączony, jawne `access`, niski `maxDepth`, `csrf`, `serverURL`, blokada zbędnych endpointów w `proxy.ts`, testy „gość nic nie czyta przez /api”.
- Surowy SQL omija `access`. Dlatego zwraca tylko ID rekordów publicznych (warunek statusu w SQL), a dane pobieramy przez `payload.find` z `overrideAccess: false`.
- Panel Payload może wymagać luźniejszej CSP. Wtedy osobna polityka dla `/admin`, nadal z `frame-ancestors 'none'`.
- Sprawdzone: Payload 3.90.2 hashuje hasła PBKDF2-SHA256 z 600 000 iteracji. Do sprawdzenia: czy token weryfikacji e-maila wygasa po 24 h (w razie potrzeby własne pole).

### Szyfrowanie pól
- Format `enc:v{n}:{iv}:{tag}:{ct}`, a hook szyfruje tylko tekst jawny. To chroni przed podwójnym szyfrowaniem przy update, w wersjach i szkicach. Testy obejmują create, update i wersje.
- AAD to `kolekcja.pole`. Pola (S) mają `access.read`. Nie trafiają do wyszukiwania w panelu, do kolumn listy ani do auditLog.
- Po polach (S) nie da się szukać ani sortować. E-mail przez HMAC, a skróty IP i tokenów przez HMAC z kluczami pochodnymi HKDF (goły SHA-256 adresu IPv4 da się odwrócić).
- Rotacja: wersja klucza w każdej wartości, stare klucze tylko do odczytu, wsadowy skrypt wznawialny, kopia kluczy poza Vercel, procedura w RUNBOOK.

### 2FA personelu
- Opcja A: `payload-totp@3.0.6`. Nadpisuje `access` wszystkich kolekcji, obsługuje 1 kolekcję, ma 1 opiekuna. Ma własne pole sekretu, więc trzeba sprawdzić wymóg (S).
- Opcja B: własna implementacja na `otpauth@9.5.2`. Sekret szyfrowany przez `lib/crypto`, wspólna bramka dla `/admin` i `/moderacja`.
- Wstępna rekomendacja: opcja B. Decyzja po spike'u w fazie 3 (ADR).
- Wymagania: 2FA egzekwowane w `access`, nie tylko w UI; kody zapasowe (hash); limit prób; jednorazowość kodu; reset przez admina z wpisem w auditLog.

### pg_trgm
- „lodz” ≠ „Łódź”. Rozwiązanie: kolumna znormalizowana (małe litery, bez diakrytyków, ł→l) wypełniana w hooku, indeks GIN `gin_trgm_ops` i prefiks dla 1–2 znaków. Ranking: prefiks, potem podobieństwo, potem typ (miasto przed wsią).
- Rozszerzenie i indeksy trygramowe trzeba dopisać ręcznie w migracji. Zapytania przez `sql` z `@payloadcms/db-postgres` (eksport sprawdzony).
- Promień: haversine z prefiltrem prostokątnym, bez PostGIS. Wyszukiwarka firm to jedno zapytanie SQL; EXPLAIN w fazie 11.

### Zadania cykliczne na Vercel
- `autoRun` nie działa w serverless. Vercel Cron wywołuje endpointy zadań Payload, a `jobs.access.run` sprawdza `Bearer CRON_SECRET` (`timingSafeEqual`).
- Vercel nie ponawia nieudanych wywołań i może uruchomić zadanie dwa razy. Dlatego zadania są idempotentne (warunek „jeszcze niewysłane”) i nadrabiają wszystkie zaległe pozycje, nie tylko dzisiejsze.
- Limit czasu funkcji: przetwarzanie partiami. Cron działa w UTC, więc godziny wysyłek mają zapas na zmianę czasu. Cron działa tylko na produkcji.
- Awarie wyłapuje Sentry Cron Monitors. Każde zadanie zapisuje log wyniku.

### Inne
- Zdjęcia:
  - limit ciała żądania na Vercel to 4,5 MB, więc kompresja w przeglądarce (≤ 2560 px), 1 plik na żądanie i twardy limit na serwerze;
  - obsługa HEIC z iPhone'a do sprawdzenia na urządzeniu;
  - pliki osierocone sprząta zadanie.
- Daty bez godziny (termin, miesiąc realizacji) zapisuję jako `YYYY-MM-DD` lub `YYYY-MM`, a „dziś” liczę w strefie Europe/Warsaw. Inaczej daty przesuwają się o dzień.
- Format polski, sprawdzony w Node:
  - `Intl` w `pl-PL` daje „1250 zł” bez spacji; „1 250 zł” wymaga `useGrouping: 'always'`;
  - `numeric: 'auto'` daje „przedwczoraj” zamiast „2 dni temu”.
- Wyświetlenia profilu: sygnał `sendBeacon` trafia do licznika w Redis, a raz dziennie dane spływają do `firmStatsDaily`. Bez zapisu do bazy przy każdym wejściu.
- View Transitions to API eksperymentalne. Działają jako ulepszenie progresywne; bez nich nawigacja działa normalnie.
- Konflikty tras: `/[usluga]/[miejscowosc]` może kolidować z `/forum`, `/gielda` itd. Rozwiązanie: lista zastrzeżonych slugów, a strony prawne jako stałe trasy.
- Neon: pooler dla aplikacji, połączenie bezpośrednie dla migracji, mała pula. W produkcji baza bez usypiania.
- Plausible przez proxy pod ścieżką spoza `/api`, bo `/api/*` zajmuje Payload. Sentry przez tunel. Upstash w regionie UE, IP tylko z nagłówków Vercel.

---

## 3. Plan faz

Zgodny z `docs/PROMPTY.md`.

| Faza | Zależy od | Co sprawdzasz ręcznie |
|---|---|---|
| 0 Plan | – | odpowiedzi na pytania, akceptacja ADR |
| 1 Szkielet | 0 (pyt. 1–5), konta GitHub/Vercel/Neon | `docker compose up -d && pnpm dev`: strona i `/admin`; zielone CI w PR; nagłówki w DevTools; link stagingu na telefonie |
| 2a Design lab | 1 | `/design-lab` w 390/1440 px i obu motywach → wybierasz wariant |
| 2b Design system | 2a | `/styleguide`: stany, Tab, 360 px, motywy, reduced motion, 3 stany kafla terminu |
| 3 Dane (może iść równolegle z 2a/2b) | 1, pyt. 6–14 | panel `/admin` po polsku; logowanie personelu z TOTP; pola (S) nieczytelne w konsoli Neon; TERYT: 24 powiaty, ok. 177 gmin; testy dostępu zielone |
| 4 Firmy | 2b, 3, CEIDG/GUS, Brevo/Mailpit | rejestracja z Twoim NIP-em, e-maile w Mailpit, kreator i zdjęcia z aparatu, termin jednym dotknięciem, pobrane zdjęcie bez EXIF. Akceptacja tymczasowo w `/admin` do fazy 7 |
| 5 Klienci | 4, Turnstile, Upstash | „glazurnik lodz” z literówką, link z filtrami, „Pokaż numer”, zapytanie → panel firmy → link do opinii, Lighthouse |
| 6 Treści (równolegle z 7) | 3, 5 | redaktor publikuje i planuje artykuł z kalkulatorem, podgląd na żywo, wynik → wyszukiwarka, pusta strona lokalna = 404, `/sitemap.xml` |
| 7 Zarządzanie | 3, 4, 5 | instalacja PWA, zatwierdzenie profilu w < 3 dotknięciach, odrzucenie opinii → e-mail z odwołaniem, zgłoszenie jako gość |
| 8 Forum (równolegle z 9) | 4, 7 | 2 firmy testowe: wątek, „Pomocne”, obserwowanie, blokada edycji po 15 min, flaga off → 404 |
| 9 Giełda | 4, 7 | ogłoszenie z telefonu w < 2 min, wiadomość bez adresów, 3 zgłoszenia kradzieży → ukrycie, flaga off → 404 |
| 10 Audyt | 1–9 | `docs/AUDYT.md`, akceptacja listy poprawek |
| 11 Szlif | 10 | `docs/WYDAJNOSC.md`, PageSpeed na stagingu |
| 12 Produkcja | 11, konta produkcyjne, treści prawne | lista kontrolna startu, test odtworzenia bazy, mail-tester (SPF/DKIM/DMARC) |

Rek.: fazę 3 podzielić na PR-y w tej kolejności:
1. `lib/crypto`;
2. staff i 2FA;
3. słowniki, TERYT i pg_trgm;
4. firms, projects i media;
5. inquiries, reviews i leads;
6. CMS;
7. forum, giełda, reports, sanctions i audit;
8. jobs.

---

## 4. Struktura i pakiety

### Struktura (według CLAUDE.md)
- `src/app/(frontend)`, `src/app/(payload)` (generowane, nie edytujemy);
- `src/collections/`, `src/globals/`, `src/blocks/`, `src/access/`;
- `src/components/{ui,features}`;
- `src/lib/{crypto,validation,auth,rate-limit,registry,search,format,env.ts}`;
- `src/emails/`, `src/jobs/`, `src/migrations/`, `src/tests/{unit,int,e2e}`;
- `src/proxy.ts`, `src/instrumentation.ts`, `src/payload.config.ts`.

Skrypty importu i rotacji kluczy uruchamiam przez `payload run`, bez tsx. W korzeniu repo: `docker-compose.yml` (Postgres w wersji zgodnej z Neon, Mailpit, Redis z emulacją REST Upstash), `.env.example`, `.github/workflows/ci.yml`.

### Mapa adresów
- `/`, `/szukaj`, `/firma/[slug]`;
- `/opinia/[token]`, `/termin/[token]`;
- `/[usluga]/[miejscowosc]`;
- `/artykuly/[slug]`, `/kalkulatory/[slug]`;
- `/rejestracja`, `/logowanie`, `/reset-hasla`;
- `/panel/{termin,zapytania,realizacje,opinie,ustawienia}`;
- `/forum/[kategoria]/[watek]`, `/gielda/[slug]`;
- `/moderacja`, `/zglos`;
- strony prawne jako stałe trasy (`/regulamin` itd.);
- `/admin`, `/api/*` (Payload);
- `/styleguide` i `/design-lab` tylko poza produkcją.

### Pakiety (npm, 7.10.2026; dokładne wersje)

| Obszar | Pakiety |
|---|---|
| rdzeń | next 16.3.8 (16.4.0 po dobie karencji, razem z ESLint 10), react/react-dom 19.3.0 |
| Payload | payload, @payloadcms/{next, db-postgres, richtext-lexical, storage-s3, ui, translations, email-nodemailer} – wszystkie 3.90.2; graphql 16.14.2 |
| Payload, faza 6 | @payloadcms/{live-preview-react, plugin-seo} 3.90.2 |
| obrazy | sharp 0.35.5 |
| UI | tailwindcss i @tailwindcss/postcss 4.3.3; radix-ui 1.7.0; class-variance-authority 0.7.1; clsx 2.1.1; tailwind-merge 3.7.0; motion 14.0.0; lucide-react 1.52.0 |
| formularze | react-hook-form 7.89.0, @hookform/resolvers 5.9.1, zod 4.6.5 (ma locale `pl`) |
| e-mail | @react-email/components 1.0.12, @react-email/render 2.1.0; dev: react-email 6.11.1 |
| ochrona | @upstash/ratelimit 2.2.0, @upstash/redis 1.39.0, server-only 0.0.1, otpauth 9.5.2 (wstępnie) |
| monitoring | @sentry/nextjs 11.4.0 |
| później | react-day-picker 10.0.2 (2b), @date-fns/tz 1.5.0 (3), @zxcvbn-ts/core 4.2.0 i language-pl 4.1.1 (4), web-push 3.6.7 (7, opcjonalnie) |
| dev | typescript 6.0.3 (nie 7.0.2), @types/node 24.19.1, @types/react 19.3.0, eslint 9.39.5 (ESLint 10 wymaga eslint-config-next 16.4), eslint-config-next 16.3.8, prettier 3.9.9, prettier-plugin-tailwindcss 0.8.1, husky 9.1.7, lint-staged 17.6.0, vitest 5.0.3, vite 8.3.3, @playwright/test 1.63.0, @axe-core/playwright 4.13.0 |
| środowisko | Node 24 LTS, pnpm 10.34.6 przez `packageManager` (wersje 11 i 12 dopiero po sprawdzeniu zgodności z Vercel i szablonem) |

Bez nowych zależności, gdy wystarczy to, co jest w stacku: sortowanie zdjęć przez `Reorder` z Motion plus przyciski (WCAG 2.5.7), lightbox na Motion, Turnstile i Brevo bez SDK.

---

## 5. Konta i zmienne środowiskowe

### Konta
- GitHub;
- Vercel Pro (fra1);
- Neon (Frankfurt; gałęzie prod/staging/dev);
- Cloudflare: R2 z jurysdykcją EU (2 buckety prod i 2 staging), Turnstile, DNS;
- Brevo (domena nadawcy, klucz SMTP);
- Upstash Redis (eu-central-1);
- Sentry (region DE – wybierasz przy zakładaniu organizacji, później nie da się zmienić);
- Plausible;
- token API CEIDG i klucz GUS BIR1 (wnioski trwają, warto złożyć teraz);
- rejestrator domeny.

Bez konta: KRS, Biała lista, TERYT/PRNG.

### Zmienne
Trafiają do `.env.example` w fazie 1. Sekrety generujesz przez `openssl rand -base64 32` i wpisujesz sam do `.env.local` i do Vercel. Lokalnie używam kluczy testowych Turnstile i Mailpit.

| Zmienna | Opis | Skąd wziąć | Faza |
|---|---|---|---|
| `DATABASE_URL` | połączenie aplikacji z bazą (pooler) | Neon → Connection string (pooled); lokalnie Docker | 1 |
| `DATABASE_URL_UNPOOLED` | połączenie bezpośrednie dla migracji | Neon → Connection string (direct) | 1 |
| `PAYLOAD_SECRET` | podpis tokenów i sesji Payload | `openssl rand -base64 32` | 1 |
| `NEXT_PUBLIC_SERVER_URL` | publiczny adres serwisu (CSRF, linki) | `https://ekipanatermin.pl`, lokalnie `http://localhost:3000` | 1 |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN projektu Sentry (host `*.ingest.de.sentry.io`) | Sentry → Project Settings → Client Keys | 1 |
| `SENTRY_ORG`, `SENTRY_PROJECT` | identyfikatory do wysyłki map źródłowych | Sentry → Organization / Project Settings | 1 |
| `SENTRY_AUTH_TOKEN` | wysyłka map źródłowych, tylko CI/Vercel | Sentry → Organization Auth Tokens | 1 |
| `DATA_ENCRYPTION_KEY` | klucz AES-256-GCM pól (S), 32 bajty | `openssl rand -base64 32` | 3 |
| `DATA_ENCRYPTION_KEY_VERSION` | numer bieżącej wersji klucza | Ty (start: 1) | 3 |
| `DATA_ENCRYPTION_KEYS_PREVIOUS` | poprzednie klucze, tylko do odczytu przy rotacji | wartości po rotacji | 3 |
| `DATA_HMAC_KEY` | klucz główny HMAC (e-maile, IP, tokeny; klucze pochodne HKDF) | `openssl rand -base64 32` | 3 |
| `CRON_SECRET` | autoryzacja Vercel Cron → zadania Payload | `openssl rand -base64 32` | 3 |
| `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | dostęp S3 do R2 (jurysdykcja EU) | Cloudflare → R2 → API Tokens | 3 |
| `R2_BUCKET_PUBLIC`, `R2_BUCKET_PRIVATE` | bucket publiczny i prywatny (pliki zapytań) | Cloudflare → R2 | 3 |
| `NEXT_PUBLIC_MEDIA_URL` | publiczny adres plików | domena podpięta do bucketu publicznego | 3 |
| `LINK_SIGNING_KEY` | podpis linków (termin, opinia, przedłużenie) | `openssl rand -base64 32` | 4 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Brevo SMTP relay (lokalnie Mailpit) | Brevo → SMTP & API | 4 |
| `EMAIL_FROM` | nadawca e-maili transakcyjnych | adres w zweryfikowanej domenie | 4 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (lokalnie klucze testowe) | Cloudflare → Turnstile | 4 |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | limity żądań i liczniki (eu-central-1) | Upstash → Redis → REST API | 4 |
| `CEIDG_API_TOKEN` | weryfikacja NIP w CEIDG | wniosek na biznes.gov.pl | 4 |
| `GUS_BIR_API_KEY` | weryfikacja w GUS REGON (BIR1) | wniosek do GUS | 4 |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | domena w statystykach | Plausible → Site settings | 5 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | web push (opcjonalnie) | `npx web-push generate-vapid-keys` | 7 |
