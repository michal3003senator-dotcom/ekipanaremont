# Prompty dla Claude Code – faza po fazie

## Jak z tego korzystać
1. Utwórz pusty folder projektu, np. `ekipanatermin`, i zainicjuj w nim Git.
2. Wrzuć `CLAUDE.md` do głównego folderu, a `SPEC.md`, `DESIGN.md` i ten plik do `docs/`.
3. Wygląd wyznacza `DESIGN.md`. Makiet nie musisz dawać; jeśli dasz, Claude Code potraktuje je tylko jako układ informacji.
4. Otwórz terminal w folderze i uruchom `claude`. Włącz tryb planowania: `Shift+Tab`, aż zobaczysz „plan mode on”, albo uruchom `claude --permission-mode plan`.
5. Wklej **Prompt 0**. Każdą kolejną fazę zaczynaj od nowej rozmowy (`/clear`) i wklejenia jej promptu.
6. Po każdej fazie sam sprawdź wynik na telefonie i komputerze. Dopiero potem idź dalej.
7. Konta (GitHub, Vercel, Neon, Cloudflare, Brevo, Sentry) zakładasz sam. Klucze wpisujesz sam do `.env.local`, nigdy do czatu.

Jedna faza to zwykle kilka sesji. Nie wklejaj wszystkich promptów naraz: jakość spada, a błędy z początku przenoszą się dalej.

---

## Prompt 0 – plan całości (bez kodu)
```
Przeczytaj CLAUDE.md i docs/SPEC.md. Nie pisz jeszcze kodu.

Przygotuj docs/PLAN.md:
1. Lista pytań i niejasności w specyfikacji (numerowana), które muszę rozstrzygnąć przed startem.
2. Ryzyka techniczne i jak je ograniczyć (Payload + Next.js 16, szyfrowanie pól, 2FA dla personelu, wyszukiwanie z pg_trgm, zadania cykliczne na Vercel).
3. Plan faz zgodny z docs/PROMPTY.md, z zależnościami i tym, co mogę sprawdzić ręcznie po każdej fazie.
4. Proponowana struktura katalogów i lista pakietów z wersjami (sprawdź aktualne w rejestrze npm).
5. Lista kont i zmiennych środowiskowych, które muszę przygotować.

Zapisz decyzje dotyczące stacku jako pierwsze ADR w docs/adr/. Na końcu zadaj mi pytania z punktu 1.
```

## Prompt 1 – szkielet i narzędzia
```
Faza 1 – szkielet projektu. Przeczytaj CLAUDE.md i docs/PLAN.md.

Zakres:
- Projekt create-payload-app (szablon blank, PostgreSQL), Next.js 16, TypeScript strict.
- ESLint, Prettier, husky + lint-staged, Vitest, Playwright (pusty test dymny).
- docker-compose.yml z PostgreSQL do pracy lokalnej, .env.example ze wszystkimi zmiennymi i komentarzami.
- GitHub Actions: lint, typecheck, test, build przy każdym pull requeście.
- Sentry (region UE) – tylko inicjalizacja.
- Wyłączony GraphQL Payload, podstawowe nagłówki bezpieczeństwa.
- Uzupełnij sekcję „Komendy” w CLAUDE.md.

Kryteria akceptacji:
- `docker compose up -d && pnpm dev` uruchamia stronę i panel /admin.
- Wszystkie sprawdzenia w CI przechodzą.
- W repo nie ma sekretów.

Najpierw plan, czekaj na moją akceptację. Na koniec raport i wpis w CHANGELOG.
```

## Prompt 2a – kierunek wizualny (design lab)
```
Faza 2a – kierunek wizualny. Przeczytaj w całości docs/DESIGN.md oraz sekcje 3.1 i 3.2 docs/SPEC.md.
Działaj jak główny projektant studia, któremu klient odrzucił już propozycje wyglądające jak szablon.

1. Plan (w odpowiedzi, bez kodu): tokeny z DESIGN.md, 3 zestawy krojów, szkic ASCII hero strony głównej, karty firmy i nagłówka profilu, opis działania kafla terminu.
2. Krytyka planu: wskaż elementy, które wyglądałyby tak samo w każdym serwisie z fachowcami, zmień je i napisz, co i dlaczego.
3. Po mojej akceptacji zbuduj /design-lab (niedostępne w produkcji): 3 warianty hero + karty firmy + kafla terminu, każdy na innym zestawie krojów, z prawdziwymi polskimi treściami.
4. Pętla wizualna: zrzuty Playwright przy 390 i 1440 px w obu motywach, ocena według listy z punktu 11 DESIGN.md, poprawki, minimum dwie rundy. Zrzuty w docs/screens/design-lab/.
5. Pokaż mi zrzuty i krótko opisz różnice. Czekaj na mój wybór.
```

## Prompt 2b – design system i komponenty
```
Faza 2b – design system w wybranym kierunku [wpisz wybrany wariant]. Przeczytaj docs/DESIGN.md.

Zakres:
- Tokeny w Tailwind 4 (@theme): kolory obu motywów, typografia z trzema rolami, odstępy, zaokrąglenia, cienie, czasy i krzywe animacji. Żadnych wartości poza tokenami.
- Fonty przez next/font, serwowane z własnej domeny, z cyframi tabelarycznymi dla roli „dane”.
- Komponenty: Button, Input, Textarea, Select, Combobox z podpowiedziami, Checkbox, Radio, Switch, DatePicker, Badge, AvailabilityTiles (kafel terminu ze wszystkimi stanami), Rating, FirmCard, ProjectGallery z lightboxem i gestem przesuwania, Dialog, Sheet (dolny panel na telefonie), Toast, Tabs, Pagination, Breadcrumbs, EmptyState, Skeleton, ErrorState.
- Układy: nagłówek z menu mobilnym i rozmyciem tła, stopka, dolna nawigacja panelu firmy z safe-area.
- Przełącznik motywu, View Transitions (w tym przejście zdjęcia karty w profil), prefers-reduced-motion.
- Strona /styleguide z każdym komponentem we wszystkich stanach (niedostępna w produkcji).

Kryteria akceptacji:
- Każdy komponent przeszedł pętlę wizualną (zrzuty w docs/screens/styleguide/) i listę kontrolną z DESIGN.md.
- Kontrast min. 4,5:1 w obu motywach (test axe), obsługa klawiaturą, poprawne działanie przy 360 px.
- Kafel terminu: stan z terminem w 14 dniach, dalej niż 14 dni, brak terminu; animacja raz, wyłączona przy reduced motion.

Najpierw plan, czekaj na akceptację.
```

## Prompt 3 – model danych, dostęp, szyfrowanie
```
Faza 3 – dane. Przeczytaj CLAUDE.md (sekcja Bezpieczeństwo) i sekcje 2, 4, 5 docs/SPEC.md.

Zakres:
- Wszystkie kolekcje i global settings z sekcji 4, z relacjami, indeksami i migracjami (także forum i giełda, ukryte za flagami).
- Reguły dostępu na poziomie kolekcji i pól według tabeli ról.
- Moduł lib/crypto: AES-256-GCM z wersją klucza, HMAC dla e-maili, rotacja klucza (skrypt), hooki pól.
- auditLog: hook zapisujący zmiany bez wartości danych osobowych.
- 2FA (TOTP) dla kolekcji staff: wybierz rozwiązanie zgodne z Payload 3, uzasadnij w ADR.
- Skrypt importu TERYT dla województwa łódzkiego, słownik usług, dane testowe (tylko lokalnie).
- Szkielet Payload Jobs + Vercel Cron.

Kryteria akceptacji:
- Testy dostępu dla każdej kolekcji (co najmniej: gość, firma A, firma B, moderator, redaktor, admin).
- Test: pola (S) w bazie są nieczytelne, a w API odszyfrowane tylko dla uprawnionych.
- Import TERYT tworzy powiaty, gminy i miejscowości łódzkiego.

Najpierw plan, czekaj na akceptację.
```

## Prompt 4 – konta i panel firmy
```
Faza 4 – firmy. Przeczytaj sekcje 3.3, 3.4, 3.5, 3.15 docs/SPEC.md.

Zakres:
- Rejestracja, potwierdzenie e-maila, logowanie, reset hasła, limity prób.
- Weryfikacja NIP: suma kontrolna, CEIDG, KRS, Biała lista VAT (lib/registry z mockami w testach).
- Kreator profilu krok po kroku, wysyłka do akceptacji.
- Panel firmy mobile-first z dolną nawigacją: pulpit, termin, zapytania, realizacje (zdjęcia z aparatu, wiele naraz, kompresja w przeglądarce, kolejność przeciąganiem), opinie, ustawienia (eksport i usunięcie konta).
- Zadania: przypomnienie i wygaszanie terminu, koniec okresu próbnego.
- E-maile tej fazy w React Email przez Brevo.

Kryteria akceptacji:
- Na telefonie potwierdzenie terminu to jedno dotknięcie z pulpitu, z natychmiastową reakcją interfejsu.
- Test E2E: rejestracja → NIP → profil → wysłanie do akceptacji.
- Zdjęcia w R2 bez EXIF, w kilku rozmiarach.

Najpierw plan, czekaj na akceptację.
```

## Prompt 5 – część publiczna
```
Faza 5 – klienci. Przeczytaj sekcje 3.1, 3.2, 3.6, 3.7 docs/SPEC.md i całe docs/DESIGN.md.

Zakres:
- Strona główna, wyszukiwarka z podpowiedziami (pg_trgm), filtry w URL, wyniki sortowane po terminie.
- Profil firmy z galerią, opiniami, terminem, zliczaniem „Pokaż numer”, formularzem zapytania (Turnstile, limity, szyfrowanie).
- Jednorazowy link do opinii, formularz opinii, statystyki dzienne firm.
- Dane strukturalne, metadane, obrazki do udostępniania.

Kryteria akceptacji:
- Test E2E: wyszukanie → profil → zapytanie → firma widzi je w panelu → link do opinii → opinia czeka na moderację.
- Lighthouse na telefonie: wydajność i dostępność co najmniej 90 na stronie głównej, wynikach i profilu.
- Każdy ekran przeszedł pętlę wizualną (zrzuty w docs/screens/) i listę kontrolną z DESIGN.md.

Najpierw plan, czekaj na akceptację.
```

## Prompt 6 – CMS, artykuły, kalkulatory, strony lokalne
```
Faza 6 – treści. Przeczytaj sekcje 3.8 i 3.14 docs/SPEC.md.

Zakres:
- Artykuły z blokami, kategorie, tagi, SEO, szkice, wersje, harmonogram, podgląd na żywo.
- Strony i dokumenty prawne z wersjonowaniem.
- Kalkulatory: łazienka, płytki, farba, gładź; parametry w CMS z walidacją; przejście z wyniku do wyszukiwarki lub zapytania; opcjonalny lead ze zgodą.
- Strony lokalne /[usluga]/[miejscowosc] tylko z aktywnymi firmami, mapa strony, robots.txt.

Kryteria akceptacji:
- Redaktor publikuje artykuł z kalkulatorem bez udziału programisty.
- Testy jednostkowe wzorów kalkulatorów.
- Pusta strona lokalna zwraca 404 i nie trafia do mapy strony.

Najpierw plan, czekaj na akceptację.
```

## Prompt 7 – panel admina i centrum moderacji
```
Faza 7 – zarządzanie. Przeczytaj sekcje 3.11, 3.12, 3.13 docs/SPEC.md.

Zakres:
- Własny pulpit w panelu Payload z kluczowymi liczbami, branding panelu.
- Centrum moderacji /moderacja: jedna kolejka z zakładkami, karty z kontekstem, akcje z obowiązkowym uzasadnieniem, e-mail z uzasadnieniem i odwołaniem, sankcje czasowe.
- Wersja na telefon: obsługa jedną ręką przy 375 px, przesuwanie kart, instalacja jako PWA, web push (opcjonalny), codzienne podsumowanie e-mailem.
- Zgłoszenia treści przy wszystkich typach treści.

Kryteria akceptacji:
- Zatwierdzenie profilu firmy z telefonu w mniej niż 3 dotknięcia od otwarcia aplikacji.
- Każda decyzja ograniczająca zapisuje uzasadnienie w reports lub sanctions i w auditLog.
- Dostęp tylko dla personelu z aktywnym 2FA.

Najpierw plan, czekaj na akceptację.
```

## Prompt 8 – forum firm
```
Faza 8 – forum (flaga forum). Przeczytaj sekcję 3.9 docs/SPEC.md.

Zakres: kategorie, wątki, odpowiedzi, „Pomocne”, obserwowanie, przypięcie i zamknięcie, edycja 15 min, wstępna moderacja nowych kont, limity, lista słów, zgłoszenia, noindex.

Kryteria akceptacji:
- Firma bez weryfikacji lub z blokadą forum dostaje czytelny komunikat, a nie błąd.
- Testy dostępu i limitów. Przy wyłączonej fladze trasy zwracają 404.

Najpierw plan, czekaj na akceptację.
```

## Prompt 9 – giełda sprzętu i materiałów
```
Faza 9 – giełda (flaga marketplace). Przeczytaj sekcję 3.10 docs/SPEC.md.

Zakres: ogłoszenia Sprzedam i Zamienię, kategorie, filtry, galeria, wygasanie i przedłużanie, wiadomości przekazywane e-mailem bez ujawniania adresów, zaszyfrowany numer seryjny, zgłoszenie „Podejrzenie kradzieży” z tymczasowym ukryciem, wstępna moderacja pierwszych ogłoszeń.

Kryteria akceptacji:
- Dodanie ogłoszenia ze zdjęciami z telefonu w mniej niż 2 minuty.
- Numer seryjny nie trafia do żadnej publicznej odpowiedzi API (test).
- Przy wyłączonej fladze trasy zwracają 404.

Najpierw plan, czekaj na akceptację.
```

## Prompt 10 – audyt bezpieczeństwa i RODO
```
Faza 10 – audyt. Działaj jak sceptyczny audytor bezpieczeństwa, który nie pisał tego kodu.

1. Przejdź listę OWASP ASVS poziom 2 i zasady z CLAUDE.md. Dla każdego punktu: spełniony, częściowo, niespełniony, z odwołaniem do plików.
2. Sprawdź każdą trasę i Server Action pod kątem: uwierzytelnienia, uprawnień, walidacji, limitów, wycieku pól.
3. Sprawdź nagłówki, CSP, ciasteczka, upload, renderowanie treści, logi (brak danych osobowych).
4. RODO: retencja działa, eksport i usunięcie danych działają, zgody zapisane z wersją.
5. Uruchom pnpm audit i skan OWASP ZAP na środowisku lokalnym.

Wynik zapisz w docs/AUDYT.md z priorytetami. Poprawki rób dopiero po mojej akceptacji listy.
```

## Prompt 11 – wydajność, SEO, dostępność
```
Faza 11 – szlif. Cele z sekcji 6 docs/SPEC.md.

Zakres: pomiar Lighthouse i Web Vitals na kluczowych stronach, poprawki obrazów, fontów, cache, rozmiaru JS, prefetch, indeksów bazy (EXPLAIN dla wyszukiwarki), audyt dostępności axe na wszystkich ekranach, przegląd metadanych i danych strukturalnych.

Kryteria akceptacji: LCP < 2,5 s, INP < 200 ms, CLS < 0,1 na telefonie; zero błędów axe; raport przed i po w docs/WYDAJNOSC.md.
```

## Prompt 12 – przygotowanie wdrożenia
```
Faza 12 – produkcja. Przygotuj, ale nie wdrażaj bez mojej zgody.

Zakres:
- Komplet testów E2E na telefonie i komputerze dla wszystkich głównych ścieżek.
- Konfiguracja Vercel (region fra1), Neon (produkcja, przywracanie do punktu w czasie), R2, Brevo (SPF, DKIM, DMARC), Sentry, Plausible, Vercel Cron.
- Migracje uruchamiane w CI przed wdrożeniem.
- docs/RUNBOOK.md: wdrożenie, wycofanie wersji, odtworzenie bazy z kopii, rotacja kluczy, procedura incydentu (72 h na zgłoszenie do UODO).
- Lista kontrolna startu do odhaczenia.
```

---

## Prompty pomocnicze

**Przegląd po fazie**
```
Zrób przegląd zmian z tej fazy jak wymagający senior, który ich nie pisał. Szukaj: błędów logiki, luk w uprawnieniach, brakujących testów, niespójności z SPEC i DESIGN.md, długu technicznego. Wypisz problemy z priorytetami. Nie poprawiaj, dopóki nie zaakceptuję listy.
```

**Krytyka designu (gdy ekran wygląda przeciętnie)**
```
Zrób zrzuty [nazwa ekranu] przy 390 i 1440 px w obu motywach. Oceń je jak wymagający art director według docs/DESIGN.md: co wygląda jak szablon, gdzie odstępy są nierówne, co rozprasza od głównej akcji, czego brakuje do poziomu premium. Wypisz 5 najważniejszych poprawek, wprowadź je, zrób nowe zrzuty i pokaż mi przed i po.
```

**Gdy coś nie działa**
```
Problem: [opis, co robię i co widzę]. Błąd: [wklej komunikat].
Najpierw odtwórz problem testem, potem znajdź przyczynę, dopiero potem napraw. Nie wyłączaj testów ani reguł dostępu, żeby błąd zniknął.
```

**Zmiana wymagań**
```
Zmieniam wymaganie: [opis]. Najpierw zaktualizuj docs/SPEC.md i pokaż mi różnicę. Kod zmieniaj dopiero po mojej akceptacji.
```
