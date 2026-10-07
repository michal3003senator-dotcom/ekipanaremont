# Ekipa na Termin – brief projektowy (premium)

Przeczytaj w całości przed każdą pracą nad interfejsem. Ten dokument wyznacza wygląd. Makiety z `docs/design/` (jeśli są) pokazują tylko, **jakie informacje** są na ekranie, nie jak ma wyglądać.

## 1. Poprzeczka
- Poziom dopracowania produktów takich jak Airbnb (zdjęcia i karty), Linear (precyzja i ruch), Stripe (typografia i formularze). **Nie kopiuj ich wyglądu**, dorównaj jakości wykonania.
- Premium to precyzja, nie ozdobniki: równe odstępy, przemyślana typografia, płynny ruch, zero przeskoków, żadnego elementu „bo ładnie wygląda”.
- Odbiorcy: właściciel mieszkania, który boi się trafić na niesolidną ekipę, oraz fachowiec, który obsługuje panel jedną ręką na budowie. Serwis ma budzić zaufanie i być szybki.

## 2. Koncepcja: „Wolny kafel”
Świat remontów to płytki, fugi, siatka i plan. Wyróżnikiem serwisu jest wolny termin. Łączymy to w jeden motyw:
- **Kafel terminu (element sygnaturowy).** Pasek 14 małych kafli = najbliższe 2 tygodnie. Dni do terminu są ciemne, dzień wolnego terminu świeci fioletem, z podpisem „Wolny od 14 paź”. Pojawia się na kartach firm, w profilu i w panelu firmy. Jeśli termin jest dalej niż 14 dni, ostatni kafel ma strzałkę i datę. Brak potwierdzonego terminu = kafle wygaszone i podpis „Zapytaj o termin”.
- Animacja raz, przy wejściu kafla w ekran: kafle zapalają się kolejno do dnia terminu (łącznie ok. 400 ms). Przy `prefers-reduced-motion` stan końcowy bez animacji.
- **Fuga jako struktura.** Linie 1 px w kolorze fugi oddzielają sekcje i komórki siatek. To jedyny dekoracyjny motyw poza kaflem. Żadnych plam gradientu, poświaty ani „szkła” (wyjątek: rozmyte tło przyklejonego nagłówka).
- Odwagę wydajemy w jednym miejscu: kafel terminu i przejście karty w profil (punkt 6). Wszystko inne jest spokojne i zdyscyplinowane.

## 3. Kolor
Jasny motyw domyślny (ADR 0020), ciemny w przełączniku. Neutralne kolory ciepłe w jasnym, lekko fioletowe w ciemnym.

| Token | Nazwa | Jasny | Ciemny | Użycie |
| --- | --- | --- | --- | --- |
| `bg` | Wapno / Noc | #F7F7F4 | #0B0910 | Tło strony |
| `surface-1` | Biel / Grafit | #FFFFFF | #13101A | Karty, panele |
| `surface-2` | Tynk / Grafit jasny | #EFEFEA | #1B1724 | Pola, wyróżnione obszary |
| `line` | Fuga | #E3E3DE | #2A2435 | Obramowania, podziały |
| `text` | Grafit / Kreda | #111318 | #F1EEF6 | Tekst główny |
| `text-muted` | Mgła | #5D6270 | #A39DB0 | Tekst drugorzędny |
| `accent` | Fiolet | #6B3FF5 | #6B3FF5 | Główne przyciski, aktywny kafel, fokus |
| `accent-soft` | Lawenda | #5A2FE0 | #B8A3FF | Linki i podpisy akcentu |
| `success` | Szałwia | #166534 | #86EFAC | Tylko potwierdzenia akcji |
| `danger` | Cegła | #B91C1C | #FCA5A5 | Błędy |

- Akcent tylko dla: głównej akcji na ekranie, aktywnego kafla terminu, fokusu, linków. Na jednym ekranie najwyżej jeden pełny fioletowy przycisk.
- Głębię budujesz jaśniejszą powierzchnią, nie cieniem. Cień tylko dla elementów pływających (menu, okna, toast).
- Każda para tekst–tło sprawdzona testem kontrastu (min. 4,5:1, duży tekst 3:1).

## 4. Typografia
- Trzy role w jednym kroju (ADR 0020): **display** – Archivo poszerzony (108%), oszczędnie; **tekst** – Archivo; **dane** – Archivo z cyframi tabelarycznymi (daty, ceny, liczby, NIP). Wagi 400–600, własny podzbiór z polskimi literami (ADR 0021).
- Polskie znaki sprawdzone zdaniem „Zażółć gęślą jaźń. Wolny od 14 października, 1 250 zł”.
- Bez Inter, Roboto, Arial, Bricolage Grotesque i IBM Plex Sans.
- Skala (desktop / telefon): 64/40, 44/32, 32/26, 24/21, 18/17, 16/16, 14/14, 12/12. Nagłówki z ujemnym światłem (−0,02 em), wersaliki z dodatnim (+0,06 em). Interlinia tekstu 1,55, nagłówków 1,05–1,15.
- Cyfry tabelaryczne (`font-variant-numeric: tabular-nums`) w datach, cenach i statystykach.

## 5. Układ
- Siatka 12 kolumn, maks. 1240 px treści, marginesy 24 px (telefon 16 px). Odstępy wyłącznie ze skali 4/8 px.
- Rytm sekcji: 96 px między sekcjami na komputerze, 56 px na telefonie.
- Zaokrąglenia: karty 18 px, pola i przyciski 12 px, znaczniki 8 px. Wewnętrzne zaokrąglenie = zewnętrzne minus odstęp.
- Przyciski i pola wysokości 48 px, cele dotyku min. 44 px.
- Telefon: przyklejony dolny pasek z główną akcją na profilu firmy i dolna nawigacja panelu, z uwzględnieniem `safe-area-inset-bottom`.
- Hero strony głównej: teza serwisu to „fachowiec z wolnym terminem”. Otwórz wyszukiwarką i żywym przykładem kafla terminu na prawdziwej realizacji, nie stockowym zdjęciem uśmiechniętego pracownika.

## 6. Ruch
- Czasy: 150 ms (stany), 250 ms (wejścia), 400 ms (przejścia stron). Krzywa `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **Moment sygnaturowy:** zdjęcie z karty firmy płynnie przechodzi w duże zdjęcie profilu (View Transitions, wspólny element).
- Hover na kartach: zdjęcie powiększa się o 3% w 400 ms, obramowanie rozjaśnia się. Bez podskakiwania kart.
- Wyniki wyszukiwania pojawiają się z opóźnieniem 30 ms na kartę, tylko przy pierwszym wczytaniu.
- Żadnych animacji przy przewijaniu dla ozdoby. Wszystko wyłączone przy `prefers-reduced-motion`.

## 7. Zdjęcia
- Zdjęcia realizacji są główną treścią. Proporcje 4:3 w kartach, 3:2 w galeriach, 16:9 w nagłówku profilu.
- Ciemniejsze tło pod tekstem tylko tam, gdzie tekst leży na zdjęciu.
- Rozmyty podgląd przed wczytaniem, stałe proporcje, zero przeskoku układu.
- Do czasu prawdziwych zdjęć: licencjonowane zdjęcia z Unsplash tylko do kategorii i artykułów, nigdy jako realizacje firm.

## 8. Detale, które robią różnicę
- Fokus: obwódka 2 px w kolorze akcentu z odstępem 2 px, widoczna tylko przy klawiaturze.
- Szkielety ładowania w kształcie docelowego układu. Puste stany z jedną konkretną akcją.
- Walidacja pól po opuszczeniu pola, komunikat pod polem, konkretny („Podaj numer z 9 cyframi”).
- Ikony z jednego zestawu, grubość linii 1,75.
- Liczby i daty po polsku: „14 paź”, „1 250 zł”, „wczoraj”, „2 dni temu”.
- Teksty przycisków mówią, co się stanie: „Wyślij zapytanie”, „Potwierdzam termin”. Ten sam czasownik w powiadomieniu: „Zapytanie wysłane”, „Termin potwierdzony”.
- Favicon, ikona aplikacji, obrazki do udostępniania i e-maile w tym samym stylu.

## 9. Czego unikać (wygląda jak szablon lub AI)
- Fioletowe plamy gradientu, poświaty, szkło wszędzie, neonowe obramowania.
- Hero „Znajdź najlepszych fachowców” ze stockowym zdjęciem i trzema kafelkami z ikonami pod spodem.
- Numerowanie 01/02/03 tam, gdzie treść nie jest kolejnymi krokami.
- Wszystko wyśrodkowane, za dużo pogrubień, za dużo kolorów akcentu.
- Domyślny wygląd shadcn, emoji, lorem ipsum, zmyślone liczby („10 000 zadowolonych klientów”).

## 10. Proces dla Claude Code
1. **Plan:** tokeny, 3 zestawy krojów, szkic układu głównej, wyników i profilu w ASCII, opis kafla terminu.
2. **Krytyka planu:** które elementy wyglądałyby tak samo w każdym innym serwisie? Zmień je i napisz, co i dlaczego.
3. **Design lab:** trasa `/design-lab` (tylko poza produkcją) z 3 wariantami hero i karty firmy, każdy na innym zestawie krojów. Czekaj na mój wybór.
4. **Budowa** wybranego kierunku.
5. **Pętla wizualna po każdym ekranie:** zrzuty Playwright przy 390 i 1440 px w obu motywach → oceń według listy z punktu 11 → popraw → powtórz co najmniej dwa razy. Zrzuty zapisuj w `docs/screens/`.
6. Przed oddaniem ekranu: „spójrz w lustro i zdejmij jeden dodatek” – usuń jedną rzecz, która nie pracuje na treść.

## 11. Lista kontrolna każdego ekranu
- [ ] Na pierwszy rzut oka wiadomo, co jest najważniejsze i co kliknąć.
- [ ] Wszystkie odstępy ze skali, wyrównania do siatki, brak „prawie równych” marginesów.
- [ ] Najwyżej jeden pełny przycisk akcentu, typografia w maks. 3 rozmiarach na sekcję.
- [ ] Wygląda dobrze przy 360, 390, 768, 1280 i 1440 px, w obu motywach.
- [ ] Kontrast i fokus sprawdzone, obsługa klawiaturą działa.
- [ ] Zero przeskoków układu, szkielety pasują do treści.
- [ ] Teksty po polsku, konkretne, bez marketingowych ogólników.
- [ ] Nic z listy „Czego unikać”.
