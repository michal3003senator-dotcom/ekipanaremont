# 0020. Jasny motyw domyślny, fiolet i Archivo

- Status: zaakceptowana (decyzja właściciela przed fazą 5)
- Data: 2026-10-07
- Zmienia: ADR 0013 (kroje), ADR 0015 (akcent i liczby), DESIGN.md §3–4, CLAUDE.md (Design)

## Kontekst
Po fazie 2b właściciel ocenił ciemny interfejs jako „typową stronę od AI”. Z prób kierunków wybrał `/kierunki/jasny`: jasną stronę prowadzącą prosto do wyszukania, w palecie „Fiolet”, i zdecydował, że jasny motyw jest domyślny w całym serwisie.

## Decyzja
- Jasny motyw domyślny (brak ciasteczka = jasny); ciemny zostaje w przełączniku (`motyw=ciemny`, `data-theme="dark"`).
- Kolory jasne: tło `#F7F7F4`, powierzchnia `#FFFFFF`, druga powierzchnia `#EFEFEA`, linia/fuga `#E3E3DE`, mocna linia `#8A8D93`, tekst `#111318`, tekst drugorzędny `#5D6270`, akcent `#6B3FF5` (przyciski, wolny kafel, fokus), najechanie i linki `#5A2FE0`. Ciemne wartości bez zmian.
- Jeden krój: Archivo (oś szerokości) we wszystkich rolach; nagłówki poszerzone (`font-stretch: 108%`), liczby z cyframi tabelarycznymi. Instrument Sans usunięty.
- Układ strony głównej z `/kierunki/jasny`: wyszukiwarka na początku, „Często szukane”, wyniki od najbliższego terminu. Trasa prób `/kierunki` usunięta.
- E-maile w tych samych kolorach.

## Konsekwencje
- Testy axe pilnują kontrastu obu motywów; zrzuty pętli wizualnej odświeżone.
- Element sygnaturowy (kafel terminu) i ruch (DESIGN §2, §6) bez zmian.
