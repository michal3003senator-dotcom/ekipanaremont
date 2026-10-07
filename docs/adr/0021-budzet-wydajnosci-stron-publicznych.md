# 0021. Budżet wydajności stron publicznych

- Status: zaakceptowana (kryterium fazy 5: Lighthouse mobile ≥ 90)
- Data: 2026-10-07
- Uzupełnia: ADR 0020 (krój), ADR 0011 (Sentry)

## Kontekst
Pierwszy pomiar Lighthouse (mobile, build produkcyjny) dał 79–83 pkt wydajności na stronie głównej, w wynikach i na profilu.
Przyczyny:
- `Critical-CH` z `withPayload` wymuszał ponowne żądanie każdej strony (~0,6 s);
- Archivo z osią szerokości ważył 176 KB (dwa pliki: latin i latin-ext);
- do przeglądarki trafiał Zod (moduł motywu, `searchHref`), Motion (dolny panel) i kod śledzenia Sentry.

## Decyzja
- **Krój:** własny podzbiór Archivo (`assets/fonts/archivo-pl.woff2`, ~38 KB) przez `next/font/local`:
  - łacinka, Latin-1, polskie litery i typografia;
  - osie wght 400–600 i wdth 100–108 (nagłówki 108% bez zmian);
  - odtworzenie: `scripts/fonts/subset-archivo.sh`;
  - pogrubienie z edytora = 600.
- **Nagłówki:** `Critical-CH`/`Accept-CH` od Payload tylko dla `/admin` (motyw panelu admina); motyw strony wybiera ciasteczko.
- **Kod w przeglądarce:**
  - moduły używane w komponentach klienckich bez Zod (`lib/theme`, `lib/search/href`), schematy zostają na serwerze;
  - dolny panel (Sheet) bez Motion – gest przesunięcia na zdarzeniach pointer;
  - powiększenie galerii i formularz zapytania ładowane dopiero przy użyciu lub przy zbliżeniu do ekranu;
  - Sentry: `__SENTRY_TRACING__` i `__SENTRY_DEBUG__` wyłączone w kompilacji (tylko błędy).
- **Kontrola:** po większej zmianie interfejsu pomiar `npx lighthouse` na `pnpm build && pnpm start`; próg 90 pkt wydajności i dostępności.

## Konsekwencje
- Wynik po zmianach (mobile, 3 strony, kilka przebiegów): wydajność 94–99, dostępność 98–100.
- Nowa litera spoza podzbioru (np. czeska „ř” w nazwie) wyświetli się krojem zapasowym – podzbiór można poszerzyć skryptem.
- Obrazki OG korzystają z osobnego pliku `Archivo-SemiBold.ttf` (satori nie obsługuje woff2 ani fontów zmiennych).

## Odrzucone alternatywy
- **Archivo bez osi szerokości z Google Fonts (68 KB):** utrata poszerzonych nagłówków z ADR 0020, a plik i tak większy niż podzbiór.
- **`font-display: optional`:** na wolnym łączu cała pierwsza wizyta w kroju zapasowym.
