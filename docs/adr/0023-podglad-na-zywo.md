# 0023. Podgląd na żywo w ramce panelu

- Status: zaakceptowana (decyzja właściciela przed fazą 6)
- Data: 2026-10-07
- Zmienia: CLAUDE.md (Bezpieczeństwo – `frame-ancestors 'none'`), ADR 0009 (CSP)

## Kontekst
SPEC 3.8 wymaga podglądu na żywo artykułów. Payload pokazuje go jako ramkę (iframe) obok edytora.
CSP `frame-ancestors 'none'` i `X-Frame-Options: DENY` blokują każdą ramkę, także z tej samej domeny.

## Decyzja
- **Kolekcje:** podgląd na żywo dla artykułów, stron i kalkulatorów, ze szkicami zapisywanymi automatycznie co 1,5 s.
- **Wejście:** `/podglad?sciezka=…` włącza tryb podglądu Next (`draftMode`).
  - Działa tylko dla redaktora lub administratora po kodzie 2FA, inaczej 403.
  - Ścieżka tylko w obrębie serwisu, bez przekierowań na zewnątrz.
  - `?wyjdz=1` wyłącza podgląd.
- **Odczyt szkicu:** strona czyta szkic tylko wtedy, gdy tryb podglądu jest włączony **i** sesja to nadal redakcja z 2FA (`contentReader`). Samo ciasteczko nie wystarcza.
- **Wyjątek w nagłówkach**, tylko dla odpowiedzi z ciasteczkiem trybu podglądu (`__prerender_bypass`, podpisane przez Next):
  - `frame-ancestors 'self'` zamiast `'none'`;
  - `X-Frame-Options: SAMEORIGIN` zamiast `DENY`.
- **`/admin`:** dostaje `frame-src 'self'`.
- **Pakiet:** `@payloadcms/live-preview-react` 3.90.2 (oficjalny, `RefreshRouteOnSave`) odświeża stronę po zapisie.
- **Pasek podglądu:** w trybie podglądu strona pokazuje pasek „Podgląd: widzisz najnowszy szkic” z linkiem wyjścia.

## Konsekwencje
- **Reszta serwisu bez zmian.** Test jednostkowy i E2E pilnują `'none'` i `DENY` bez trybu podglądu.
- **Fałszywe ciasteczko** o tej nazwie w czyjejś przeglądarce luzuje tylko jego własne nagłówki ramki.
  - Szkiców nie odsłoni, bo `draftMode()` sprawdza podpis, a strona sesję.
  - Atakujący nie ustawi ciasteczka ofierze.
