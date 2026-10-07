# 0016. 2FA personelu: payload-totp i własna reguła dostępu

- Status: zaakceptowana (plan fazy 3)
- Data: 2026-10-07

## Kontekst
CLAUDE.md wymaga 2FA (TOTP) dla personelu i krótszej sesji. Payload 3 nie ma 2FA w standardzie. Pisanie TOTP od zera (sekret, QR, okno czasu, limity prób, widoki panelu) to dużo kodu bezpieczeństwa do utrzymania.

## Decyzja
- Wtyczka `payload-totp` 3.0.6: widoki ustawienia i podania kodu w panelu, `forceSetup: true` (bez 2FA nie ma pracy w panelu), limit prób w kolekcji `totp-attempts`, ciasteczko z `_strategy: 'totp'` po poprawnym kodzie.
- `disableAccessWrapper: true` i własna reguła `staff()` w `src/access`: personel ma dostęp do danych tylko z `_strategy === 'totp'`. Wrapper wtyczki odcinał też gości od publicznego odczytu (firmy, artykuły), a my potrzebujemy jednej, testowanej reguły.
- `access.admin` personelu przepuszcza bez kodu tylko po to, by wtyczka przekierowała do ustawienia lub podania kodu. Bez kodu personel widzi wyłącznie własne konto i nic nie zmienia.
- Sekret TOTP szyfrowany AES-256-GCM (ADR 0007) hookami dopiętymi do pola wtyczki w `payload.config.ts`. Wtyczka czyta i zapisuje sekret przez Local API, więc hooki działają (test).
- Sesja personelu 8 h, blokada po 5 błędnych hasłach na 15 min. Klucze API wyłączone (inaczej omijałyby 2FA).
- Kolekcja zadań Payload: odczyt tylko dla administratora, uruchamianie tylko z `CRON_SECRET` (Vercel Cron) albo przez administratora po kodzie.
- Konta firm nie wchodzą do panelu Payload (`access.admin: false`), bo ciasteczko sesji jest wspólne dla kolekcji z logowaniem.

## Konsekwencje
- Każda reguła personelu przechodzi przez `staff()`, testy sprawdzają administratora bez kodu.
- Aktualizacja wtyczki wymaga sprawdzenia, czy nadal czyta sekret przez Local API (test szyfrowania to wychwyci).

## Odrzucone alternatywy
- Własna implementacja na `otpauth`: więcej kodu bezpieczeństwa i widoków panelu do utrzymania.
- Wrapper wtyczki: blokuje publiczny odczyt i rozprasza reguły dostępu.
