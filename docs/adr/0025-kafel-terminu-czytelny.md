# 0025. Kafel terminu: numery dni, legenda i jednoznaczny nagłówek

- Status: zaakceptowana (uwaga właściciela: „kalendarz średnio czytelny”)
- Data: 2026-10-10
- Zmienia: DESIGN §2 (kafel terminu), ADR 0013

## Kontekst
Pasek 14 pustych kwadratów nie mówił, które to dni ani co znaczą kolory. Szare pola wyglądały jak
„zajęte dni z grafiku”, choć firma podaje tylko jedną datę: od kiedy może zacząć. Fioletowa strzałka
przy dalekim terminie sugerowała wolny dzień.

## Decyzja
- **Nagłówek nad paskiem:** „Najbliższy wolny termin” + data z dniem tygodnia („pt 16 paź”) + odstęp („za 7 dni”, „dziś”); bez daty – „Do uzgodnienia”.
- **Kafle z numerami dni**, obwódka na dziś, w profilu i grafiku inicjały dni tygodnia nad paskiem.
- **Kolory:** szary – dni przed terminem, pełny fiolet – tylko najbliższy wolny dzień, jasny fiolet – kolejne dni (do uzgodnienia), szara strzałka – termin dalej niż 2 tygodnie.
- **Legenda** raz nad listą wyników, w profilu i w grafiku.
- Numery dni z CSS (`data-day`, `::before`): pasek jest dekoracją ukrytą przed czytnikami ekranu, pełny opis niesie tekst; axe nie liczy kontrastu tekstu w trakcie animacji wejścia.

## Konsekwencje
- Termin czyta się bez legendy; legenda tłumaczy kolory.
- Na 360 px numery mają co najmniej 10 px (skalowane z szerokością paska).
