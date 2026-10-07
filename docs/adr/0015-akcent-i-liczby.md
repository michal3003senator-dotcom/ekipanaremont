# 0015. Własny fiolet i liczby w kroju tekstu

- Status: zaakceptowana (decyzja właściciela po fazie 2b); częściowo zmieniona przez ADR 0020 (jasny motyw, Archivo)
- Data: 2026-10-07
- Zmienia: DESIGN.md §3 (wartości akcentu), ADR 0013 (krój danych)

## Kontekst
Po fazie 2b właściciel ocenił, że interfejs nie wygląda premium. Fiolet `#7C3AED` to standardowy odcień Tailwinda (violet-600), a JetBrains Mono przy datach i ocenach daje wrażenie edytora kodu.

## Decyzja
- Akcent ciemny `#6B3FF5` (biały tekst 5,75:1, wobec tła 3,45:1), hover `#5A2FE0`, lawenda `#B8A3FF`; akcent jasny `#5A2FE0` (biały 7,2:1, tło 6,63:1), hover `#4A22C4`.
- Rola „dane” w Instrument Sans z cyframi tabelarycznymi; JetBrains Mono usunięty.

## Konsekwencje
- Jeden krój mniej do pobrania. Testy axe pilnują kontrastu nowego akcentu.
