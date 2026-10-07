# 0013. Kierunek wizualny: B „Grafik”

- Status: zaakceptowana (wybór właściciela po fazie 2a)
- Data: 2026-10-07

## Kontekst
Faza 2a porównała w `/design-lab` trzy kierunki na tych samych treściach (zrzuty: `docs/screens/design-lab/`): A „Realizacja”, B „Grafik”, C „Zdanie”. Wyróżnikiem serwisu jest najbliższy wolny termin, więc kierunek ma go pokazywać najczytelniej.

## Decyzja
- Kierunek B „Grafik”: firmy na wspólnej osi 14 dni, termin porównuje się wzrokiem jak w grafiku na budowie.
- Kroje: Instrument Sans – nagłówki w szerokości 75, tekst w 100; JetBrains Mono – dane (daty, ceny, oceny, NIP) z cyframi tabelarycznymi.
- Karty firm na liście są poziome od 768 px; paski kafli kolejnych kart stoją w jednej kolumnie.
- Z kierunku A: w nagłówku profilu firmy zdjęcie realizacji stoi na pasku kafli.

## Konsekwencje
- Faza 2b buduje design system na tych krojach i układach; `/design-lab` zostaje usunięty, zrzuty zostają jako zapis decyzji.
- Wąski krój nagłówków oszczędza miejsce na telefonie (panel firmy, wyniki).

## Odrzucone alternatywy
- A „Realizacja”: najbezpieczniejszy, ale układ (nagłówek, zdjęcie, formularz z boku) jest najbardziej typowy dla serwisów z fachowcami.
- C „Zdanie”: wyszukiwarka zapisana jednym zdaniem nie skaluje się – TERYT ma nazwy tylko w mianowniku, a rozwijana lista nie obsłuży ponad 2 tys. miejscowości.
