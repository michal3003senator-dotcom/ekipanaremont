# 0007. Szyfrowanie pól i skróty

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md: dane kontaktowe (S) szyfrowane AES-256-GCM w hookach pól, wersja klucza w rekordzie, wyszukiwanie po e-mailu przez HMAC-SHA256.

## Decyzja
- `node:crypto`, AES-256-GCM, losowy IV, format `enc:v{n}:{iv}:{tag}:{ct}`.
- AAD to `kolekcja.pole`: szyfrogramu nie da się przenieść do innego pola.
- Hook szyfruje tylko tekst jawny – brak podwójnego szyfrowania przy update, w wersjach i szkicach.
- HMAC dla e-maili, IP i tokenów na kluczach pochodnych HKDF z `DATA_HMAC_KEY` (osobny klucz na cel). Goły SHA-256 adresu IPv4 da się odwrócić.
- Pola (S) mają `access.read` na poziomie pola i nie trafiają do wyszukiwania w panelu, kolumn list ani auditLog.
- Rotacja: nowa wersja klucza, stare tylko do odczytu, wznawialny skrypt wsadowy (`payload run`), kopia kluczy poza Vercel, procedura w RUNBOOK.

## Konsekwencje
- Po polach (S) nie da się szukać ani sortować, z wyjątkiem e-maila przez HMAC.

## Odrzucone alternatywy
- Szyfrowanie w bazie (pgcrypto): klucz trafiałby do zapytań SQL i logów bazy.
