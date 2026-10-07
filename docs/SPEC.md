# Ekipa na Termin – specyfikacja

Wersja 1.0, 7 października 2026. Źródło prawdy dla wymagań. Zmiany tylko po akceptacji właściciela.

---

## 1. Produkt

- **Region:** województwo łódzkie. Słownik miejscowości z rejestru TERYT (GUS).
- **Model:** firmy płacą abonament (pierwsze 30 dni gratis). Klienci korzystają za darmo. Płatności będą później; teraz tylko pola statusu.
- **Wyróżnik:** najbliższy wolny termin firmy, widoczny w wynikach i na profilu, z datą ostatniego potwierdzenia. Niepotwierdzony termin wygasa.
- **Odpowiedzialność:** platforma łączy strony. Nie jest stroną umów na prace ani transakcji na giełdzie.
- **Wartość abonamentu dla firm:** widoczność w katalogu, zapytania, a także dostęp do forum i giełdy (tylko dla zweryfikowanych firm).

## 2. Role i uprawnienia

| Akcja | Gość / klient | Firma (właściciel konta) | Moderator | Redaktor | Administrator |
| --- | --- | --- | --- | --- | --- |
| Przeglądanie katalogu, profili, artykułów | tak | tak | tak | tak | tak |
| Wysłanie zapytania do firmy | tak | nie | nie | nie | nie |
| Wystawienie opinii | tylko z jednorazowego linku | nie | nie | nie | nie |
| Edycja własnego profilu, realizacji, terminu | nie | tak | nie | nie | tak |
| Odczyt zapytań | nie | tylko własne | nie | nie | tak |
| Forum: czytanie i pisanie | nie | tak (zweryfikowana, aktywna) | tak | nie | tak |
| Giełda: przeglądanie i ogłoszenia | nie | tak (zweryfikowana, aktywna) | tak | nie | tak |
| Moderacja profili, opinii, forum, giełdy, zgłoszeń | nie | nie | tak | nie | tak |
| Artykuły, strony, kalkulatory | nie | nie | nie | tak | tak |
| Leady z kalkulatorów, ustawienia, konta personelu | nie | nie | nie | nie | tak |

„Zweryfikowana, aktywna” = e-mail potwierdzony, NIP zweryfikowany, profil zatwierdzony, abonament w statusie `trial` lub `active`, brak blokady.

## 3. Moduły

### 3.1 Wyszukiwarka i katalog
- Pola: usługa (podpowiedzi), miejscowość (podpowiedzi z TERYT, odporne na literówki przez `pg_trgm`), wolny termin (obojętnie, do 7, 14, 30 dni).
- Filtry: zakres prac (podusługi), obszar (miasto, powiat, promień), faktura VAT, ocena 4,5+, gwarancja.
- Sortowanie domyślne: najbliższy aktywny termin, potem ocena. Firmy bez aktywnego terminu na końcu z etykietą „Zapytaj o termin”.
- Filtry i strona wyników w adresie URL. Paginacja 12 wyników.
- Pokazywane są tylko firmy w statusie `active`.

### 3.2 Profil firmy (publiczny)
- Zdjęcie główne, logo lub inicjały, nazwa, opis krótki, obszar, ocena, znacznik „Firma w rejestrze CEIDG/KRS”.
- Panel boczny (na telefonie przyklejony pasek na dole): wolny termin z datą potwierdzenia, „Wyślij zapytanie”, „Pokaż numer telefonu” (zliczane).
- Sekcje: realizacje (galeria z powiększeniem i przesuwaniem palcem), usługi, opinie z rozkładem ocen, o firmie, dane z rejestru, formularz zapytania, podobne firmy.
- Dane strukturalne LocalBusiness i AggregateRating.

### 3.3 Rejestracja i weryfikacja firmy
1. E-mail i hasło (min. 12 znaków, sprawdzanie siły), akceptacja regulaminu i polityki prywatności z zapisem wersji i daty.
2. Potwierdzenie e-maila linkiem (ważny 24 h).
3. NIP: walidacja sumy kontrolnej, potem zapytanie kolejno do CEIDG (klucz API w env), KRS i Białej listy VAT. Biała lista nie zawiera firm zwolnionych z VAT, więc nie może być jedynym źródłem.
4. Autouzupełnienie nazwy i adresu, znacznik rejestru, data weryfikacji. Jeden NIP = jeden profil.
5. Uzupełnienie profilu (kreator krokowy), min. 3 zdjęcia realizacji.
6. Wysłanie do akceptacji. Moderator zatwierdza lub odrzuca z uzasadnieniem. Firma dostaje e-mail.
7. Okres próbny startuje w chwili zatwierdzenia: `trialStartsAt`, `trialEndsAt` = +30 dni.

### 3.4 Panel firmy (mobile-first)
- Dolna nawigacja na telefonie: Pulpit, Termin, Zapytania, Realizacje, Więcej.
- **Pulpit:** status profilu, lista braków, termin z przyciskiem „Potwierdzam”, nowe zapytania, statystyki 30 dni (wyświetlenia, kliknięcia w telefon, zapytania), dni do końca okresu próbnego.
- **Termin:** wybór daty, „Potwierdzam termin” jednym dotknięciem, informacja, kiedy wygaśnie.
- **Zapytania:** lista, szczegóły, statusy (nowe, w kontakcie, zamknięte, spam), szybkie akcje: zadzwoń, napisz e-mail.
- **Realizacje:** dodawanie zdjęć z aparatu telefonu lub galerii, wiele naraz, zmniejszanie w przeglądarce, kolejność przeciąganiem, tytuł, usługa, miejscowość, miesiąc wykonania. Limit 12 zdjęć na realizację i 30 realizacji.
- **Opinie:** lista, publiczna odpowiedź (raz, edycja 24 h).
- **Forum i Giełda:** wejście, jeśli flagi włączone.
- **Ustawienia:** dane profilu, powiadomienia e-mail, zmiana hasła i e-maila, eksport danych (JSON), usunięcie konta.

### 3.5 Reguły wolnego terminu
- `availability.date` musi być dziś lub w przyszłości, maksymalnie +180 dni.
- `availability.confirmedAt` ustawiane przy każdym potwierdzeniu.
- Zadanie dzienne: po `reminderDays` (domyślnie 10) od potwierdzenia e-mail z linkiem „Potwierdź jednym kliknięciem” (podpisany token). Po `expiryDays` (domyślnie 14) termin przestaje być aktywny.
- Gdy data terminu minie, termin przestaje być aktywny.
- Wartości dni w globalu `settings`.

### 3.6 Zapytania
- Formularz: rodzaj prac, miejscowość, opis (20–2000 znaków), budżet (przedziały), planowany termin, zdjęcia (max 5), imię, e-mail, telefon (opcjonalny), zgoda.
- Turnstile, limit 5 zapytań na godzinę z jednego adresu IP (adres zapisany tylko jako skrót).
- Dane kontaktowe i opis szyfrowane. Klient dostaje potwierdzenie, firma powiadomienie z linkiem do panelu (bez danych klienta w treści e-maila).
- Po `reviewDelayDays` (domyślnie 14) klient dostaje jednorazowy link do opinii, ważny 30 dni. W bazie tylko skrót tokenu.

### 3.7 Opinie
- Tylko przez link z zapytania, jedna opinia na zapytanie.
- Ocena 1–5, tytuł opcjonalny, treść 30–1500 znaków, podpis w formie „Imię, dzielnica/miejscowość”.
- Status `pending`, publikacja po akceptacji moderatora. Na stronie informacja „Jak sprawdzamy opinie”.
- Firma może zgłosić opinię (trafia do zgłoszeń).

### 3.8 CMS: artykuły, strony, kalkulatory
- **Artykuły:** bloki – tekst, nagłówek, zdjęcie, galeria, cytat, FAQ, tabela, przycisk CTA, kalkulator, polecane firmy (wg usługi i miejscowości). Kategorie, tagi, autor, data aktualizacji, czas czytania, SEO (tytuł, opis, obrazek, kanoniczny), szkice, wersje, harmonogram publikacji, podgląd na żywo.
- **Strony:** regulamin, polityki, O nas, Kontakt. Dokumenty prawne z numerem wersji i datą obowiązywania. Archiwum poprzednich wersji.
- **Kalkulatory:** komponenty React osadzane blokiem. Parametry (ceny za m², zapasy, wydajność) edytowane w CMS i walidowane schematem dla danego typu. Na start: koszt remontu łazienki, ilość płytek z zapasem, ilość farby, koszt gładzi. Pod wynikiem: „Znajdź firmę z wolnym terminem”, które przenosi parametry do wyszukiwarki lub formularza zapytania. Opcjonalny kontakt = lead z osobną zgodą.
- Bez kalkulatorów kredytowych do decyzji prawnika.

### 3.9 Forum firm (flaga `forum`)
- Zamknięte: tylko zweryfikowane, aktywne firmy. `noindex`, poza mapą strony.
- Kategorie (zarządzane w CMS), wątki, odpowiedzi, reakcja „Pomocne”, przypięcie i zamknięcie wątku (moderator), obserwowanie wątku z powiadomieniem e-mail.
- Treść: prosty tekst z formatowaniem (pogrubienie, listy, linki z `rel="nofollow ugc"`), do 4 zdjęć na post.
- Edycja własnego posta 15 minut. Usunięcie przez autora = ukrycie treści, wątek zostaje.
- Ochrona: pierwsze 3 posty nowego konta czekają na akceptację, limit 10 postów na godzinę, lista słów wstrzymująca post do moderacji, przycisk „Zgłoś”.
- Bez prywatnych wiadomości w pierwszej wersji.

### 3.10 Giełda sprzętu i materiałów (flaga `marketplace`)
- Tylko zweryfikowane, aktywne firmy mogą przeglądać i dodawać ogłoszenia. `noindex`.
- Typy: Sprzedam, Zamienię. Kategorie: elektronarzędzia, maszyny, rusztowania i drabiny, narzędzia ręczne, nadwyżki materiałów, inne.
- Pola: tytuł, opis, stan, cena w groszach lub „do negocjacji”, „zamienię na”, faktura VAT, miejscowość, do 10 zdjęć, numer seryjny (opcjonalny, zaszyfrowany, niepubliczny, tylko dla moderacji).
- Ogłoszenie wygasa po 30 dniach, przypomnienie 3 dni wcześniej, przedłużenie jednym kliknięciem. Statusy: szkic, czeka, aktywne, zarezerwowane, sprzedane, wygasłe, ukryte.
- Kontakt: „Napisz do sprzedającego” = wiadomość zapisana w bazie i przekazana e-mailem, bez ujawniania adresów e-mail. Odpowiedzi poza platformą.
- Bez płatności przez platformę. Regulamin: platforma nie jest stroną transakcji.
- Pierwsze 2 ogłoszenia firmy czekają na akceptację. Zgłoszenie „Podejrzenie kradzieży”: po 3 zgłoszeniach od różnych firm ogłoszenie zostaje tymczasowo ukryte do decyzji moderatora.

### 3.11 Centrum moderacji (komputer i telefon)
- Trasa `/moderacja`, dostępna dla moderatora i administratora z 2FA. Instalowalna jako PWA.
- Jedna kolejka z zakładkami: profile firm, opinie, posty forum, ogłoszenia, zgłoszenia. Licznik oczekujących.
- Karta elementu: podgląd treści, kontekst (autor, historia sankcji), szybkie akcje: zatwierdź, odrzuć, ukryj, usuń, ostrzeż, zablokuj czasowo (forum, giełda, całe konto).
- Każda decyzja ograniczająca wymaga uzasadnienia (gotowe szablony + własny tekst). Autor dostaje e-mail z uzasadnieniem i linkiem do odwołania (wymóg DSA).
- Na telefonie: obsługa jedną ręką przy 375 px, duże przyciski, przesuwanie kart.
- Powiadomienia web push o nowych zgłoszeniach (opcjonalne) i codzienne podsumowanie e-mailem.

### 3.12 Panel administratora (Payload)
- Własny pulpit: nowe firmy (7 dni), aktywne terminy, zapytania (7 i 30 dni), otwarte zgłoszenia, firmy z kończącym się okresem próbnym.
- Listy z filtrami i akcjami zbiorczymi dla wszystkich kolekcji. Branding panelu (logo, kolory).
- Global `settings`: flagi modułów, parametry dni, wersje dokumentów prawnych, szablony uzasadnień moderacji, lista słów do wstrzymania.
- Panel używalny na telefonie do lekkich zmian. Pełne zarządzanie treścią na komputerze.

### 3.13 Zgłoszenia treści (DSA)
- Przycisk „Zgłoś” przy profilu, opinii, poście, ogłoszeniu, artykule.
- Pola: powód (lista), opis, e-mail zgłaszającego (dla gości wymagany, szyfrowany).
- Potwierdzenie przyjęcia e-mailem, decyzja z uzasadnieniem, rejestr decyzji.

### 3.14 Strony lokalne SEO
- Adresy `/[usluga]/[miejscowosc]`, np. `/glazurnik/lodz`. Generowane z danych.
- Publikowane tylko, gdy jest co najmniej 1 aktywna firma. Inaczej 404 i brak w mapie strony.
- Unikalny wstęp z CMS (opcjonalny) + lista firm + powiązane artykuły.

### 3.15 Powiadomienia e-mail
Potwierdzenie e-maila, reset hasła, profil zatwierdzony lub odrzucony, nowe zapytanie (do firmy), potwierdzenie zapytania (do klienta), prośba o opinię, przypomnienie o terminie, termin wygasł, koniec okresu próbnego za 7 i 1 dzień, odpowiedź w obserwowanym wątku, wiadomość do ogłoszenia, ogłoszenie wygasa, decyzja moderacyjna z uzasadnieniem. Szablony React Email w jednym stylu marki, wersja tekstowa każdego e-maila.

## 4. Model danych (kolekcje Payload)

Wspólne: `createdAt`, `updatedAt`. Pola oznaczone (S) są szyfrowane. (H) = skrót HMAC.

- **staff** (auth): email, name, role (`admin`, `moderator`, `editor`), totpSecret (S), totpEnabled, lastLoginAt.
- **firmAccounts** (auth): email, firm → firms, emailVerified, termsVersion, termsAcceptedAt, notificationPrefs (json), sanctions → sanctions.
- **firms:** name, slug (unikalny), nip (unikalny), registrySource (`ceidg`, `krs`, `vat`), registryData (json), registryVerifiedAt, shortDescription, about (rich text), logo → media, cover → media, services → services (wiele), serviceArea → localities (wiele), baseLocality → localities, phone, website, vatInvoice, warrantyMonths, yearsExperience, teamSize, availability { date, confirmedAt }, status (`draft`, `pending_review`, `active`, `suspended`, `rejected`), moderationReason, trialStartsAt, trialEndsAt, subscriptionStatus (`trial`, `active`, `past_due`, `canceled`), ratingAvg, ratingCount.
- **services:** name, slug, parent → services, icon, description, seo.
- **localities:** terytId, name, type (`wojewodztwo`, `powiat`, `gmina`, `miejscowosc`), parent → localities, slug, lat, lng.
- **projects:** firm, title, service, locality, completedMonth, images → media (max 12), description, order, status.
- **media:** plik, alt (wymagany), owner (firma lub personel), purpose (`project`, `logo`, `cover`, `forum`, `listing`, `article`, `inquiry`), warianty rozmiarów. Pliki zapytań dostępne tylko dla firmy-adresata.
- **inquiries:** firm, service, locality, description (S), budgetRange, timeframe, clientName (S), clientEmail (S), clientEmailHash (H), clientPhone (S), images, consentTextVersion, consentAt, status, reviewTokenHash, reviewTokenExpiresAt, reviewRequestedAt, source (`direct`, `calculator`), ipHash.
- **reviews:** firm, inquiry (unikalny), rating, title, body, authorDisplayName, firmReply, firmReplyAt, status (`pending`, `approved`, `rejected`), moderationReason, publishedAt.
- **articles:** title, slug, excerpt, cover, content (bloki), category, tags, author → staff, publishedAt, relatedServices, seo; szkice i wersje.
- **pages:** title, slug, content (bloki), legalVersion, effectiveFrom, seo; wersje.
- **calculators:** type, title, params (json walidowany per typ), disclaimer, linkedService.
- **leads:** calculator, inputs (json), result (json), name (S), email (S), emailHash (H), phone (S), consentTextVersion, consentAt, status, retentionUntil.
- **forumCategories:** name, slug, description, order.
- **forumThreads:** category, author → firmAccounts, title, slug, body, pinned, locked, status (`pending`, `visible`, `hidden`, `deleted`), replyCount, lastActivityAt, followers → firmAccounts.
- **forumPosts:** thread, author, body, images, status, editedAt, helpfulCount.
- **forumReactions:** post, account, type (`helpful`); unikalne (post, account).
- **listings:** firm, type (`sell`, `swap`), category, title, description, condition, priceGrosze, negotiable, swapFor, vatInvoice, locality, images (max 10), serialNumber (S), status, expiresAt, viewCount, theftReportCount.
- **listingMessages:** listing, fromFirm, body, createdAt, deliveredAt.
- **reports:** targetType, targetId, reason, description, reporterEmail (S) lub reporterAccount, status (`new`, `in_review`, `resolved`, `rejected`), decision, statementOfReasons, decidedBy → staff, decidedAt, appealOf → reports.
- **sanctions:** account → firmAccounts, scope (`forum`, `marketplace`, `account`), type (`warning`, `ban`), until, reason, createdBy → staff.
- **firmStatsDaily:** firm, date, views, phoneReveals, inquiries. Unikalne (firm, date).
- **auditLog** (tylko dopisywanie): actor, actorType, action, collection, docId, changedFields (bez wartości danych osobowych), ipHash, at.
- **Global `settings`:** featureFlags { forum, marketplace, calculators }, reviewDelayDays, availabilityReminderDays, availabilityExpiryDays, listingExpiryDays, retention { inquiriesMonths: 24, leadsMonths: 12 }, legalVersions, moderationReasonTemplates, holdWords.

Indeksy: firms(status, availability.date), firms(slug), firms(nip), inquiries(firm, status, createdAt), reviews(firm, status), listings(status, category, expiresAt), forumThreads(category, lastActivityAt), localities(name) z `pg_trgm`.

## 5. Zadania cykliczne (Payload Jobs + Vercel Cron)
- Codziennie: przypomnienia i wygaszanie terminów, prośby o opinie, wygaszanie ogłoszeń, przypomnienia o końcu okresu próbnego, agregacja statystyk, retencja (anonimizacja zapytań, usuwanie leadów).
- Co godzinę: podsumowanie zgłoszeń dla moderatorów, gdy są nowe.
- Każde zadanie idempotentne, z logiem wyniku.

## 6. Wymagania niefunkcjonalne
- **Bezpieczeństwo:** zasady z `CLAUDE.md`; punkt odniesienia OWASP ASVS poziom 2.
- **RODO:** dane w UE, minimalizacja, retencja z `settings`, eksport i usunięcie danych na żądanie, rejestr zgód z wersją treści, brak danych osobowych w logach i e-mailach powiadomień.
- **Wydajność:** na telefonie LCP < 2,5 s, INP < 200 ms, CLS < 0,1. Strony publiczne generowane statycznie i odświeżane po zmianie w CMS (`revalidateTag`).
- **Dostępność:** WCAG 2.2 AA.
- **Przeglądarki:** dwie ostatnie wersje Chrome, Safari (w tym iOS), Firefox, Edge.
- **Język:** tylko polski. Formaty dat, liczb i walut polskie.

## 7. Design
- Kierunek, kolory, typografia, ruch, detale i proces: `docs/DESIGN.md`. To jedyne źródło wyglądu.
- Makiety w `docs/design/` (opcjonalne) pokazują tylko, jakie informacje są na ekranie.
- Ekrany (komputer i telefon): główna, wyniki, profil, zapytanie i potwierdzenie, opinia z linku, rejestracja firmy (kreator), logowanie, reset hasła, panel firmy (wszystkie zakładki), forum (lista, wątek, nowy wątek), giełda (lista, ogłoszenie, nowe ogłoszenie, wiadomość), artykuł, lista artykułów, kalkulator, strona lokalna, centrum moderacji, 404, 500, regulamin.
- Strona `/styleguide` (tylko poza produkcją) z wszystkimi komponentami i stanami.

## 8. Poza zakresem
Bramka płatności i faktury automatyczne, mailing marketingowy, reklamy, prywatne wiadomości na forum, aplikacja natywna, inne województwa.

## 9. Otwarte pytania (do decyzji właściciela)
- Cena abonamentu.
- Pełna lista kategorii usług i giełdy.
- Okresy przechowywania danych (do potwierdzenia z prawnikiem).
- Treść regulaminu, polityki prywatności i zasad moderacji (od prawnika).
