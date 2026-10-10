# Decyzje architektoniczne (ADR)

Każda decyzja architektoniczna ma osobny plik `NNNN-tytul.md` (zasada 6 z CLAUDE.md). Decyzji się nie edytuje – zmiana to nowy ADR, który zastępuje poprzedni.

| Nr | Decyzja | Status |
|---|---|---|
| [0001](0001-rdzen-next-payload.md) | Rdzeń: Next.js 16 i Payload 3 w jednym projekcie | zaakceptowana |
| [0002](0002-baza-danych.md) | Baza danych: PostgreSQL (Neon) i migracje | zaakceptowana |
| [0003](0003-pliki.md) | Pliki: Cloudflare R2 | zaakceptowana |
| [0004](0004-interfejs.md) | Interfejs | zaakceptowana |
| [0005](0005-formularze-walidacja.md) | Formularze i walidacja | zaakceptowana |
| [0006](0006-email.md) | E-maile transakcyjne | zaakceptowana |
| [0007](0007-szyfrowanie.md) | Szyfrowanie pól i skróty | zaakceptowana |
| [0008](0008-naduzycia.md) | Ochrona przed nadużyciami | zaakceptowana |
| [0009](0009-naglowki-csp.md) | Nagłówki bezpieczeństwa i CSP | zaakceptowana |
| [0010](0010-zadania.md) | Zadania cykliczne | zaakceptowana |
| [0011](0011-jakosc-obserwowalnosc.md) | Jakość i obserwowalność | zaakceptowana |
| [0012](0012-hosting-srodowiska.md) | Hosting i środowiska | zaakceptowana |
| [0013](0013-kierunek-wizualny.md) | Kierunek wizualny: B „Grafik” | zaakceptowana |
| [0014](0014-biblioteki-komponentow.md) | Biblioteki komponentów interfejsu | zaakceptowana |
| [0015](0015-akcent-i-liczby.md) | Własny fiolet i liczby w kroju tekstu | zaakceptowana |
| [0016](0016-2fa-personelu.md) | 2FA personelu: payload-totp i własna reguła dostępu | zaakceptowana |
| [0017](0017-slownik-miejscowosci.md) | Słownik miejscowości z TERYT i PRNG w repozytorium | zaakceptowana |
| [0018](0018-uwierzytelnianie-firm.md) | Uwierzytelnianie firm: Server Actions na Local API Payload | zaakceptowana |
| [0019](0019-rejestry-nip.md) | Weryfikacja NIP w rejestrach | zaakceptowana |
| [0020](0020-jasny-motyw-i-archivo.md) | Jasny motyw domyślny, fiolet i Archivo | zaakceptowana |
| [0021](0021-budzet-wydajnosci-stron-publicznych.md) | Budżet wydajności stron publicznych | zaakceptowana |
| [0022](0022-tresci-trasy-i-harmonogram.md) | Treści: trasy, kalkulatory w panelu, harmonogram | zaakceptowana |
| [0023](0023-podglad-na-zywo.md) | Podgląd na żywo w ramce panelu | zaakceptowana |
| [0024](0024-moderacja-rejestr-decyzji-i-odwolania.md) | Moderacja: rejestr decyzji w `reports`, odwołania z podpisanego linku | zaakceptowana |
| [0025](0025-kafel-terminu-czytelny.md) | Kafel terminu: numery dni, legenda i jednoznaczny nagłówek | zaakceptowana |

## Szablon

```md
# NNNN. Tytuł

- Status: proponowana | zaakceptowana | zastąpiona przez NNNN
- Data: RRRR-MM-DD

## Kontekst
## Decyzja
## Konsekwencje
## Odrzucone alternatywy
```
