# Audyt bezpieczeństwa i RODO (faza 10)

Data: 2026-10-10. Zakres: OWASP ASVS poziom 2 w części dotyczącej aplikacji, zasady z CLAUDE.md, RODO.
Metoda: przegląd kodu (trasy, Server Actions, reguły dostępu Payload, nagłówki, logi), próby na
działającym serwerze (REST bez interfejsu), `pnpm audit`, testy integracyjne i E2E.

Priorytety: **K** krytyczne, **W** wysokie, **Ś** średnie, **N** niskie.

## Naprawione w tej fazie

| # | Prio | Problem | Poprawka |
| --- | --- | --- | --- |
| 1 | W | Pliki na dysku serwera – na Vercelu dysk jest ulotny, zdjęcia by znikały | Cloudflare R2 (`src/lib/storage.ts`), jeden prywatny kubełek, pliki przez Payload z regułami dostępu; bez R2 na Vercelu start się zatrzymuje |
| 2 | W | Brak anonimizacji zapytań po okresie retencji (SPEC 5) | Zadanie `anonymizeInquiries` (codziennie): dane klienta, zdjęcia i skróty usuwane po `retention.inquiriesMonths`, rekord zostaje do statystyk; test |
| 3 | W | `pnpm audit`: 5 luk wysokich (nodemailer, undici) i niższe w dompurify | Nadpisania w `pnpm-workspace.yaml`: nodemailer 10.0.10, undici ≥ 7.29.1, dompurify ≥ 3.4.16 |
| 4 | W | `POST /api/firmAccounts/forgot-password` i `/login` przez REST omijały Turnstile i limity (zalew e-maili, zgadywanie haseł) | Proxy zwraca 404 dla endpointów uwierzytelniania kont firm; personel `/api/staff/login` z limitem na IP (`src/lib/security/api-guard.ts`); testy |
| 5 | Ś | Telefon firmy do pobrania hurtowo przez `GET /api/firms` (omijało „Pokaż numer”, licznik i limit) | Reguła odczytu pola `phone` tylko dla właściciela i moderacji; odsłonięcie przez akcję serwera; test |
| 6 | Ś | Treści ukrytej (zawieszonej) firmy – realizacje, opinie, zdjęcia – nadal dostępne przez REST | Publiczny odczyt tylko przy aktywnym profilu (`ACTIVE_FIRM`); zdjęcia forum i giełdy tylko dla członków; test |
| 7 | Ś | Blokada konta zamykała strony panelu, ale nie akcje serwera | `actionContext` sprawdza blokadę; eksport i usunięcie danych (RODO) działają także przy blokadzie |
| 8 | Ś | Produkcja mogła wystartować bez Upstash (limity tylko w pamięci jednej instancji), Turnstile, SMTP lub `CRON_SECRET` | Walidacja środowiska: przy `VERCEL_ENV=production` te zmienne są wymagane; test |

## Otwarte (decyzja lub praca przed startem)

| # | Prio | Temat | Propozycja |
| --- | --- | --- | --- |
| A | Ś | Vercel przyjmuje do 4,5 MB na żądanie. Panel firmy zmniejsza zdjęcia w przeglądarce, ale przesyłanie w `/admin` (okładki artykułów) może przekroczyć limit | Redakcja wgrywa zdjęcia do 4 MB; po starcie ewentualnie `clientUploads` R2 z ponownym kodowaniem po stronie serwera |
| B | Ś | Retencja danych zgłaszających (`reports`: e-mail, imię) – SPEC nie podaje okresu | Decyzja właściciela: proponuję 24 miesiące od decyzji, tym samym zadaniem retencji |
| C | Ś | Klient bez konta (autor zapytania lub opinii) nie ma samoobsługowego eksportu ani usunięcia danych | Procedura ręczna przez stronę Kontakt (opis w `docs/RUNBOOK.md`); wyszukiwanie po skrócie HMAC e-maila |
| D | N | `pnpm audit`: `braces` (bez łatki, tylko `sass` przy budowaniu) i `esbuild` (dev-serwer `drizzle-kit`) | Brak drogi z danych użytkownika – ryzyko przyjęte, sprawdzać przy aktualizacji Payload |
| E | N | Skan OWASP ZAP | W tym środowisku brak ZAP – uruchomić na stagingu przed startem (lista w `docs/RUNBOOK.md`) |

## Sprawdzone bez uwag

- **Reguły dostępu:** każda kolekcja ma jawne `read`, `create`, `update`, `delete`; pola wrażliwe z regułą na poziomie pola; personel tylko po 2FA (`_strategy === 'totp'`); testy reguł w `src/tests/int/access.int.test.ts`.
- **API:** GraphQL wyłączony, `maxDepth: 3`, `defaultDepth: 1`, CORS i CSRF tylko dla własnej domeny; filtrowanie po polu bez prawa odczytu jest odrzucane (test dla telefonu).
- **Server Actions:** każda waliduje wejście Zod po stronie serwera; formularze publiczne mają Turnstile i limity; akcje panelu i moderacji – sesja, limit i zapis z regułami użytkownika.
- **Szyfrowanie:** dane kontaktowe (zapytania, leady, zgłoszenia) AES-256-GCM z wersją klucza, wyszukiwanie e-maili przez HMAC, rotacja kluczy (`src/lib/crypto/rotate.ts`, test).
- **Upload:** tylko obrazy sprawdzone po zawartości, limit rozmiaru, ponowne kodowanie do WebP przez sharp (bez EXIF).
- **Nagłówki:** CSP z nonce i `strict-dynamic` (bez `unsafe-eval` na produkcji), HSTS, `frame-ancestors 'none'` (wyjątek podglądu redakcji, ADR 0023), Referrer-Policy, Permissions-Policy, COOP, nosniff – także dla `/api`.
- **Treści z edytora:** tylko renderer Lexical; JSON-LD z ucieczką `<`.
- **Logi:** bez danych osobowych i sekretów (tylko identyfikatory rekordów i tematy wiadomości); Sentry w regionie UE.
- **Ciasteczka sesji:** HttpOnly, `SameSite=Lax`, `Secure` na produkcji; personel 8 h, firmy 30 dni; blokada po 5 błędnych próbach; wtyczka TOTP liczy błędne kody.
- **RODO:** zgody z wersją dokumentu i datą (zapytania, leady, rejestracja); eksport i usunięcie konta firmy z hasłem; usunięcie firmy kasuje jej treści (hook kaskady); leady usuwane po `retentionUntil`.
