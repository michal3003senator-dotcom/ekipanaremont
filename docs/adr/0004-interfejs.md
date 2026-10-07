# 0004. Interfejs

- Status: zaakceptowana
- Data: 2026-10-07

## Kontekst
CLAUDE.md i DESIGN.md: Tailwind CSS 4 z tokenami w `@theme`, komponenty na Radix / shadcn/ui, Motion, ikony lucide, fonty z własnej domeny, View Transitions jako moment sygnaturowy.

## Decyzja
- Tailwind 4, wszystkie wartości z tokenów `@theme`; shadcn/ui na pakiecie `radix-ui`; Motion; lucide-react.
- Fonty przez `next/font`, serwowane z własnej domeny (zero zapytań do Google Fonts w przeglądarce).
- View Transitions jako ulepszenie progresywne: bez wsparcia przeglądarki nawigacja działa normalnie.
- Sortowanie zdjęć przez `Reorder` z Motion plus przyciski (WCAG 2.5.7), lightbox na Motion – bez dodatkowych bibliotek.

## Konsekwencje
- Tokeny i komponenty powstają w fazach 2a i 2b.

## Odrzucone alternatywy
- Nie rozważane – stack ustalony w CLAUDE.md.
