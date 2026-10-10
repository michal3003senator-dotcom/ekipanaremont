# 0024. Moderacja: rejestr decyzji w `reports`, odwołania z podpisanego linku

- Status: zaakceptowana (faza 7)
- Data: 2026-10-10

## Kontekst
SPEC 3.11 i 3.13 (DSA art. 16, 17, 20) wymagają, żeby każda decyzja ograniczająca miała uzasadnienie,
trafiała do autora z możliwością odwołania i była zapisana w rejestrze. Decyzje zapadają w dwóch
miejscach: w centrum moderacji `/moderacja` i w panelu Payload.

## Decyzja
- **Reguły w hookach kolekcji, nie w ekranie.** Te same zasady działają w `/moderacja` i w `/admin`:
  - zmiana statusu firmy na `rejected` lub `suspended` i opinii na `rejected` wymaga `moderationReason`;
  - decyzja w zgłoszeniu (`resolved`, `rejected`) wymaga `statementOfReasons`.
- **Rejestr decyzji = kolekcja `reports`.** Decyzja z urzędu (bez zgłoszenia) zapisuje się jako
  rozpatrzone zgłoszenie z powodem `moderator`. Sankcja tak samo (`warned`, `banned`).
  Decyzja przy zgłoszeniu używa tego zgłoszenia (`context.reportId`), więc nie powstają duplikaty.
- **Odwołanie:** link `/odwolanie/<token>` podpisany HMAC (ADR 0018, cel `appeal`), ważny 183 dni,
  wskazuje decyzję w rejestrze. Odwołanie to nowe zgłoszenie z powodem `appeal` i `appealOf`;
  jedno na decyzję. Moderator może utrzymać albo uchylić decyzję (treść wraca).
- **E-maile:** autor dostaje uzasadnienie i link do odwołania, zgłaszający – decyzję z uzasadnieniem.
  Bez treści, której dotyczy decyzja. Awaria poczty nie cofa decyzji.
- **Blokada całego konta:** panel firmy przekierowuje na logowanie z komunikatem do końca blokady.
  Blokady forum i giełdy sprawdza reguła `community` (wspólna funkcja `hasActiveBan`).
- **Centrum moderacji:** dostęp tylko dla moderatora lub administratora po 2FA (sprawdza strona
  i każda akcja). Zapis jako zalogowany członek personelu, więc auditLog i `decidedBy` są prawdziwe.
  Instalowalne jako aplikacja (manifest w `/moderacja`). Web push – poza zakresem startu.

## Konsekwencje
- Jedno źródło prawdy dla rejestru DSA i raportów przejrzystości.
- Panel Payload nie pozwala ominąć uzasadnienia.
- Odwołanie nie wymaga konta: autor opinii (klient) nie ma konta w serwisie.
