# 0010. Zadania cykliczne

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
SPEC 5: zadania codzienne i godzinowe przez Payload Jobs i Vercel Cron, idempotentne, z logiem wyniku.

## Decyzja
- Vercel Cron wywołuje endpointy zadań Payload; `jobs.access.run` sprawdza `Authorization: Bearer CRON_SECRET` porównaniem `timingSafeEqual`. `autoRun` nie działa w serverless.
- Zadania idempotentne (warunek „jeszcze niewysłane”), nadrabiają wszystkie zaległe pozycje i działają partiami w limicie czasu funkcji.
- Harmonogram w UTC z zapasem na zmianę czasu; cron tylko na produkcji.
- Monitorowanie: Sentry Cron Monitors i log wyniku każdego zadania.

## Konsekwencje
- Zadania godzinowe wymagają planu Vercel Pro (ADR 0012).

## Odrzucone alternatywy
- Zewnętrzny harmonogram (np. QStash): dodatkowy dostawca bez potrzeby.
