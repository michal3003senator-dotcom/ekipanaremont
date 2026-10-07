# 0003. Pliki: Cloudflare R2

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md: R2 przez `@payloadcms/storage-s3`; upload tylko obrazów sprawdzonych po zawartości, z limitem rozmiaru, ponownym kodowaniem przez sharp i usunięciem EXIF. Pliki zapytań widzi tylko firma-adresat (SPEC 4).

## Decyzja
- R2 z jurysdykcją EU, dwa buckety: publiczny (realizacje, logo, artykuły) i prywatny (pliki zapytań, wydawane przez aplikację po sprawdzeniu uprawnień).
- Każdy obraz: typ sprawdzony po zawartości, limit rozmiaru, ponowne kodowanie, usunięcie metadanych, kilka rozmiarów.
- Kompresja w przeglądarce do ≤ 2560 px i 1 plik na żądanie (limit ciała żądania na Vercel to 4,5 MB) plus twardy limit na serwerze.
- Lokalnie zapis na dysk.

## Konsekwencje
- Osobne buckety dla produkcji i stagingu. Pliki osierocone sprząta zadanie cykliczne.

## Odrzucone alternatywy
- Vercel Blob: brak wyboru jurysdykcji EU, wyższy koszt transferu.
