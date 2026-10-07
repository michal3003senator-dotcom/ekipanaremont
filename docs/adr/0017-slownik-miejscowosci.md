# 0017. Słownik miejscowości z TERYT i PRNG w repozytorium

- Status: zaakceptowana (PLAN pyt. 7–8, plan fazy 3)
- Data: 2026-10-07

## Kontekst
Wyszukiwarka i strony `/[usluga]/[miejscowosc]` potrzebują miejscowości łódzkiego ze współrzędnymi. TERYT (GUS) nie ma współrzędnych, a pliki źródłowe ważą kilkaset MB (PRNG ok. 300 MB).

## Decyzja
- `pnpm teryt:build` buduje `data/teryt-lodzkie.json` z TERC i SIMC (wersja „Urzędowy”) oraz PRNG (GUGiK, GML). Plik wynikowy (ok. 700 KB, jeden rekord w wierszu) jest w repozytorium.
- Zakres: województwo, 24 powiaty, 177 gmin, miasta i wsie samodzielne (bez części miejscowości, kolonii, przysiółków, osad) i 5 dzielnic Łodzi. Współrzędne punktu głównego z PRNG po identyfikatorze SIMC.
- Identyfikatory `terc:…` i `simc:…` (kody TERC i SIMC mogą się pokrywać). Slugi: miasta po nazwie, powtarzające się wsie z nazwą gminy (`karolew-belchatow`), gminy i powiaty z przedrostkiem.
- `pnpm seed` dopisuje brakujące rekordy (idempotentnie) na każdym środowisku; `pnpm seed demo` dodaje firmy przykładowe tylko na lokalnej bazie.
- Daty kalendarzowe bez godziny (wolny termin, dzień statystyk) jako tekst `RRRR-MM-DD` w strefie Europe/Warsaw – bez przesunięć stref przy zapisie w UTC.

## Konsekwencje
- Import nie zależy od dostępności serwerów GUS i GUGiK. Aktualizacja TERYT (zwykle raz w roku) to ponowne `pnpm teryt:build` i commit.
- 2 miejscowości nie mają punktu w PRNG, dzielnice Łodzi też – brak współrzędnych oznacza brak wyszukiwania po promieniu dla tych rekordów.

## Odrzucone alternatywy
- API TERYT (SOAP): wymaga konta i nie daje współrzędnych.
- Import z plików przy każdym wdrożeniu: zależność od zewnętrznych serwerów i ok. 320 MB do pobrania.
