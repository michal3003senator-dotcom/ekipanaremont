# 0009. Nagłówki bezpieczeństwa i CSP

- Status: zaakceptowana (pytanie 2 w PLAN.md)
- Data: 2026-10-07

## Kontekst
CLAUDE.md wymaga CSP z nonce, HSTS, `frame-ancestors 'none'`, Referrer-Policy i Permissions-Policy. Według dokumentacji Next 16 (`content-security-policy.md`) nonce wymaga dynamicznego renderowania każdej strony: statyczne generowanie, ISR i Partial Prerendering nie działają z nonce. SPEC 6 zakładał strony statyczne.

## Decyzja
- Nonce dla każdego żądania strony w `src/proxy.ts`: `script-src 'self' 'nonce-…' 'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `connect-src 'self'`.
- `style-src 'self' 'unsafe-inline'`: Next i Payload używają stylów w atrybutach. Skrypty inline pozostają zablokowane.
- Strony renderowane dynamicznie; szybkość z cache danych (tagi i `revalidateTag` po zmianie w CMS). SPEC 6 zaktualizowany.
- Pozostałe nagłówki statycznie w `next.config.ts`: HSTS (2 lata, `includeSubDomains`, `preload` dopiero przy starcie), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`.
- Panel Payload dostaje osobną politykę tylko wtedy, gdy test wykaże taką potrzebę, zawsze z `frame-ancestors 'none'`.

## Konsekwencje
- HTML nie jest cache'owany w CDN; zimne starty funkcji mierzymy w fazie 11.
- Kafel terminu zależy od bieżącej daty, więc renderowanie dynamiczne i tak daje świeższe dane.

## Odrzucone alternatywy
- Strony statyczne z hashami skryptów (eksperymentalne SRI w Next): niestabilne API, niepewna zgodność z Turbopackiem i Payloadem.
- Nonce tylko w panelach, strony publiczne z `'unsafe-inline'`: słabsza ochrona przed XSS, sprzeczne z CLAUDE.md.
