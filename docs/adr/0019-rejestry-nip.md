# 0019. Weryfikacja NIP w rejestrach

- Status: zaakceptowana (plan fazy 4)
- Data: 2026-10-07

## Kontekst
SPEC 3.3: suma kontrolna, potem CEIDG, KRS i Biała lista VAT. Biała lista nie zawiera firm zwolnionych z VAT. Otwarte API KRS nie wyszukuje po NIP. CEIDG wymaga tokenu.

## Decyzja
- `lookupNip` (`src/lib/registry`): suma kontrolna → CEIDG (gdy jest `CEIDG_API_TOKEN`) → Biała lista VAT → KRS po numerze KRS z Białej listy (najpierw rejestr przedsiębiorców P, potem S).
- Odpowiedzi parsowane schematami Zod z polami opcjonalnymi; awaria jednego rejestru nie przerywa sprawdzania kolejnych. Wynik: `found`, `not_found` albo `unavailable`.
- Zapisujemy tylko jawne dane rejestrowe potrzebne do profilu: nazwa, adres, REGON, KRS, aktywność, źródło, data sprawdzenia.
- `not_found` i `unavailable` nie blokują rejestracji: firma podaje nazwę ręcznie, `registryVerifiedAt` zostaje puste, a moderator weryfikuje ręcznie przed zatwierdzeniem. Forum i giełda wymagają `registryVerifiedAt`.
- Testy na atrapach odpowiedzi (wstrzykiwany `fetch`). Schemat CEIDG v3 potwierdzimy po otrzymaniu tokenu.

## Konsekwencje
- Bez tokenu CEIDG jednoosobowe działalności zwolnione z VAT wymagają ręcznej weryfikacji.
- API Białej listy blokuje niektóre adresy serwerowe (Incapsula); na Vercel sprawdzimy po wdrożeniu, w razie blokady zostaje weryfikacja ręczna.
