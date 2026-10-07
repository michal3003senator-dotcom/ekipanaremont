# 0022. Treści: trasy, kalkulatory w panelu, harmonogram publikacji

- Status: zaakceptowana (plan fazy 6)
- Data: 2026-10-07
- Uzupełnia: PLAN.md (mapa adresów, pyt. 12 i 21)

## Kontekst
Faza 6 dodaje artykuły, strony z CMS, kalkulatory i strony lokalne `/[usluga]/[miejscowosc]`.
Wcześniejsze rozwiązania nie wystarczały:
- strony prawne planowano jako stałe trasy;
- wersje dokumentów prawnych były w dwóch miejscach;
- parametry kalkulatorów były polem JSON;
- harmonogram korzystał z `schedulePublish` z Payload, które uruchamia się jako redaktor bez 2FA, więc nasze reguły dostępu by je odrzuciły.

## Decyzja
- **Jeden dynamiczny segment w korzeniu**:
  - `/[slug]` to strona z CMS, a `/[slug]/[miejscowosc]` to strona lokalna, gdzie slug to usługa;
  - redaktor dodaje strony bez programisty;
  - Next nie dopuszcza dwóch różnych nazw parametrów na tym samym poziomie.
- **Ochrona adresów**:
  - `ROUTE_SLUGS` to trasy aplikacji, których nie może zająć strona ani usługa;
  - slug strony nie może być slugiem usługi i odwrotnie (walidacja z zapytaniem do drugiej kolekcji);
  - `CMS_PAGE_SLUGS` (regulamin, polityka…) są zastrzeżone dla usług.
- **Dokumenty prawne**:
  - strona z `legalKind` (`terms`, `privacy`) jest jedynym źródłem wersji;
  - wersję i datę obowiązywania trzeba podać przed publikacją;
  - `settings.legalVersions` usunięte;
  - zgody w formularzach zapisują `zapytanie-N/pp-<wersja polityki>` (`src/lib/legal.ts`).
- **Kalkulatory**:
  - parametry to zwykłe pola panelu, osobne dla każdego rodzaju, a kwoty wpisuje się w złotych (`MoneyField`, w bazie grosze);
  - w kodzie nie ma wartości domyślnych;
  - szkic zapisuje się niepełny, a publikacja wymaga kompletu (schemat Zod rodzaju).
- **Harmonogram**:
  - pole `publishAt` i zadanie `publishScheduled` w kolejce `hourly` (istniejący cron);
  - zadanie publikuje najnowszy szkic jako system;
  - `schedulePublish` wyłączone.
- **Artykuły**:
  - kategorie jako kolekcja `articleCategories`;
  - zamiast relacji do konta personelu podpis `authorName`, żeby nie ujawniać kont personelu;
  - czas czytania liczony hookiem.
- **Strony lokalne**: opcjonalne wstępy w kolekcji `localIntros` (para usługa–miejscowość unikalna).

## Konsekwencje
- Migracja `phase6_content` zmienia typy pól `articles.category` i `calculators.params`. Dane były tylko lokalne.
- Publikacja z harmonogramu ma dokładność do godziny.
