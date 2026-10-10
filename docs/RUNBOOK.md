# Runbook – produkcja

Procedury dla ekipanatermin.pl: wdrożenie, wycofanie, baza, klucze, incydenty i wnioski RODO.
Sekrety wpisujesz tylko w Vercel (Settings → Environment Variables) i w menedżerze haseł – nigdy w repozytorium ani w czacie.

## 1. Usługi i zmienne

| Usługa | Region | Zmienne |
| --- | --- | --- |
| Vercel (hosting, cron) | `fra1` | `NEXT_PUBLIC_SERVER_URL`, `PAYLOAD_SECRET`, `CRON_SECRET` |
| Neon (PostgreSQL) | Frankfurt | `DATABASE_URL` (pooler), `DATABASE_URL_UNPOOLED` (migracje) |
| Cloudflare R2 (pliki) | jurysdykcja EU | `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` |
| Brevo (e-mail SMTP) | UE | `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` |
| Upstash Redis (limity) | eu-central-1 | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Cloudflare Turnstile | – | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| Sentry | UE (`*.ingest.de.sentry.io`) | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` |
| Klucze aplikacji | – | `DATA_ENCRYPTION_KEY`, `DATA_ENCRYPTION_KEY_VERSION`, `DATA_HMAC_KEY`, `LINK_SIGNING_KEY` |

- Klucze aplikacji generuje `pnpm env:init` lokalnie; skopiuj je do Vercel i do menedżera haseł. **Utrata `DATA_ENCRYPTION_KEY` = utrata zaszyfrowanych danych.**
- Na produkcji (`VERCEL_ENV=production`) aplikacja nie wystartuje bez Upstash, Turnstile, SMTP i `CRON_SECRET`, a na każdym wdrożeniu Vercel (także Preview) – bez R2. Komunikat błędu podaje brakujące nazwy.
- Brevo: domena nadawcy z rekordami SPF, DKIM i DMARC (`p=quarantine` po tygodniu bez błędów).
- R2: kubełek prywatny (bez publicznego dostępu); token API tylko z uprawnieniami do tego kubełka.

## 2. Wdrożenie

1. Pull request do `main` → CI: lint, typecheck, testy, build, skan sekretów.
2. Podgląd Vercel (preview) z osobną bazą Neon (gałąź bazy) – sprawdź ekrany zmienione w PR.
3. Scalenie do `main` → Vercel buduje produkcję: `pnpm vercel-build` uruchamia migracje (`DATABASE_URL_UNPOOLED`), potem `next build`.
4. Po wdrożeniu: `/`, `/szukaj`, profil firmy, logowanie firmy, `/admin` (2FA), `/moderacja`. Sentry bez nowych błędów przez 15 minut.

Pierwsze uruchomienie na pustej bazie:
1. Wdrożenie (migracje utworzą schemat).
2. `pnpm seed` z `DATABASE_URL` produkcji ustawionym lokalnie – słowniki usług, miejscowości TERYT, szkice kalkulatorów i dokumentów. **Nigdy `pnpm seed demo` na produkcji** (skrypt odmawia dla baz innych niż lokalna).
3. `/admin` → pierwsze konto personelu dostaje rolę administratora; od razu ustawienie 2FA.
4. W `/admin`: opublikuj Regulamin i Politykę prywatności (z numerem wersji), uzupełnij parametry kalkulatorów, szablony uzasadnień moderacji (`Ustawienia`), flagi modułów.

## 3. Wycofanie wersji

- **Kod:** Vercel → Deployments → poprzednie wdrożenie → *Promote to Production* (sekundy, bez nowego builda).
- **Migracja bazy:** wycofanie kodu nie cofa schematu. Migracje są addytywne (nowe kolumny i wartości), więc starszy kod zwykle działa. Gdy nie:
  1. Odtworzenie bazy z punktu w czasie sprzed wdrożenia (pkt 4) **albo**
  2. `pnpm payload migrate:down` lokalnie z `DATABASE_URL_UNPOOLED` produkcji – tylko po kopii (pkt 4).

## 4. Kopia i odtworzenie bazy (Neon)

- Neon trzyma historię (Point-in-Time Restore). Plan produkcyjny: co najmniej 7 dni historii.
- Odtworzenie: Neon → Branches → *Restore* do znacznika czasu na nową gałąź → sprawdź dane → przełącz `DATABASE_URL` w Vercel na nową gałąź → redeploy.
- Pliki w R2 nie są w kopii bazy – nie usuwaj kubełka; usunięte pliki odzyskuje tylko wersjonowanie R2 (włącz przy starcie).
- Raz w miesiącu próbne odtworzenie na gałęzi testowej (czy aplikacja wstaje i czyta zaszyfrowane pola).

## 5. Rotacja kluczy

- **Klucz szyfrowania pól:**
  1. Nowy klucz: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
  2. W Vercel: obecny klucz dopisz do `DATA_ENCRYPTION_KEYS_PREVIOUS`, nowy wpisz w `DATA_ENCRYPTION_KEY`, zwiększ `DATA_ENCRYPTION_KEY_VERSION`.
  3. Redeploy, potem `pnpm rotate-key` (lokalnie ze zmiennymi produkcji) – przepisuje wszystkie pola nowym kluczem.
  4. Po pomyślnej rotacji usuń stary klucz z `DATA_ENCRYPTION_KEYS_PREVIOUS` (zostaje tylko w menedżerze haseł na wypadek odtworzenia starej kopii).
- **`DATA_HMAC_KEY`:** zmiana unieważnia wyszukiwanie po e-mailu i limity – tylko przy wycieku, z przeliczeniem skrótów.
- **`PAYLOAD_SECRET`:** zmiana wylogowuje wszystkich (sesje i linki resetu).
- **`LINK_SIGNING_KEY`:** zmiana unieważnia linki z e-maili (potwierdzenie terminu, odwołania).
- **Tokeny zewnętrzne** (R2, Brevo, Upstash, Sentry): nowy token → Vercel → redeploy → unieważnienie starego.

## 6. Incydent bezpieczeństwa

1. **Ogranicz:** podejrzane konto personelu – zablokuj w `/admin`; wyciek klucza – rotacja (pkt 5); atak – Vercel Firewall / tryb *Attack Challenge*.
2. **Zabezpiecz ślady:** logi Vercel i Sentry, `auditLog` (eksport z `/admin`), czas zdarzenia.
3. **Oceń:** czy dotyczy danych osobowych (zapytania, leady, zgłoszenia, konta), ilu osób, jakich kategorii.
4. **Zgłoś do UODO w ciągu 72 godzin** od stwierdzenia naruszenia, jeśli jest ryzyko dla osób (formularz na uodo.gov.pl). Gdy ryzyko jest wysokie – zawiadom też osoby, których dotyczy.
5. **Rejestr naruszeń:** wpis także wtedy, gdy zgłoszenie nie było potrzebne (data, opis, skutki, działania).
6. Po incydencie: przyczyna, poprawka, test zapobiegający powtórce, wpis w `docs/CHANGELOG.md`.

## 7. Wnioski RODO

- **Firma (konto):** samodzielnie w panelu → Ustawienia → *Pobierz dane* i *Usuń konto* (z hasłem).
- **Klient (bez konta – zapytania, opinie, leady):** wniosek przez stronę Kontakt lub e-mail.
  1. Potwierdź tożsamość odpowiedzią z adresu, którego dotyczy wniosek.
  2. Wyszukaj rekordy po skrócie e-maila (`clientEmailHash`, `emailHash`) w `/admin` lub skryptem.
  3. Dostęp: przekaż dane w 30 dni. Usunięcie: usuń leady, zanonimizuj zapytania (jak zadanie `anonymizeInquiries`), opinie – usuń lub zostaw bez podpisu.
  4. Odnotuj wniosek i odpowiedź (data, zakres) poza danymi osobowymi.

## 8. Zadania cykliczne

- Vercel Cron: `daily` o 2:20 UTC i `hourly` o :05 → `/api/payload-jobs/run?queue=…` z `Authorization: Bearer CRON_SECRET` (Vercel dodaje nagłówek sam).
- Codziennie: przypomnienia i wygaszanie terminów, prośby o opinie, okres próbny, usuwanie leadów, anonimizacja zapytań, podsumowanie moderacji. Co godzinę: publikacja zaplanowanych artykułów, alert o nowych zgłoszeniach.
- Kontrola: `/admin` → Payload Jobs – nieudane zadania z błędem; Sentry alarmuje o wyjątkach.

## 9. Lista kontrolna startu

- [ ] Domena `ekipanatermin.pl` w Vercel, HTTPS, przekierowanie `www` → główna.
- [ ] Wszystkie zmienne z pkt 1 w Vercel (Production i Preview), klucze aplikacji w menedżerze haseł.
- [ ] Neon: plan z historią ≥ 7 dni, osobna gałąź dla preview.
- [ ] R2: prywatny kubełek, wersjonowanie włączone, token tylko do kubełka.
- [ ] Brevo: SPF, DKIM, DMARC; testowy e-mail z rejestracji trafia do skrzynki odbiorczej (nie spam).
- [ ] Turnstile: klucze produkcyjne dla domeny.
- [ ] Sentry: projekt w regionie UE, alert e-mail na nowe błędy.
- [ ] `pnpm seed` (słowniki) na produkcji; pierwsze konto administratora z 2FA.
- [ ] Opublikowane: Regulamin, Polityka prywatności, Jak sprawdzamy opinie, Zasady moderacji, Kontakt, O nas (dane operatora uzupełnione).
- [ ] Kalkulatory: parametry wpisane i opublikowane (albo flaga wyłączona).
- [ ] Szablony uzasadnień moderacji w Ustawieniach; konto moderatora z 2FA; `/moderacja` zainstalowana na telefonie.
- [ ] Flagi: forum i giełda wyłączone na start.
- [ ] Skan OWASP ZAP (baseline) na preview – bez alarmów wysokich.
- [ ] Lighthouse na stronie głównej, wynikach, profilu i artykule – LCP < 2,5 s na telefonie.
- [ ] Próbne odtworzenie bazy (pkt 4) i próbne wycofanie wdrożenia (pkt 3).
- [ ] Rejestr czynności przetwarzania i rejestr naruszeń założone (poza repozytorium).
