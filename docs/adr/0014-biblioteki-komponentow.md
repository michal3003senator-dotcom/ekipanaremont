# 0014. Biblioteki komponentów interfejsu

- Status: zaakceptowana (plan fazy 2b)
- Data: 2026-10-07

## Kontekst
CLAUDE.md: komponenty na Radix / shadcn/ui, Motion, ikony lucide; nowa zależność tylko z uzasadnieniem. Faza 2b potrzebuje pełnego zestawu komponentów (PROMPTY 2b) z obsługą klawiatury i WCAG 2.2 AA.

## Decyzja
- `radix-ui`: Dialog, Popover, Checkbox, RadioGroup, Switch, Tabs, Toast – dostępność i zarządzanie fokusem bez własnych implementacji.
- Wzorzec shadcn/ui bez generatora: komponenty w `src/components/ui`, warianty przez `class-variance-authority`, łączenie klas przez `cn()` (`clsx` + `tailwind-merge` skonfigurowany na tokeny projektu; zastępuje `lib/cx.ts`).
- `lucide-react` (linia 1,75 – DESIGN §8) i `motion` (gesty: przesuwanie w galerii i zamykanie dolnego panelu).
- `react-day-picker` + `date-fns`: kalendarz z pełną obsługą klawiatury i polską lokalizacją.
- Combobox napisany według wzorca WAI-ARIA (combobox + listbox) na Popover z Radix: podpowiedzi z serwera (pg_trgm) i dopasowanie bez polskich znaków.
- Select natywny ze stylem: na telefonie systemowy wybór jest najwygodniejszy i najbardziej dostępny.
- Testy dostępności: `@axe-core/playwright`.

## Konsekwencje
- Animacje nakładek to keyframes z tokenów w CSS – bez `tw-animate-css`.
- Wersje instalowane z regułą `minimumReleaseAge` (24 h) z `pnpm-workspace.yaml`.

## Odrzucone alternatywy
- `cmdk` (Combobox): menu poleceń z filtrowaniem po stronie klienta, a nie combobox z podpowiedziami z serwera.
- `vaul` (dolny panel) i `sonner` (powiadomienia): Dialog i Toast z Radix plus gest z Motion wystarczają.
- Własny kalendarz: obsługa klawiatury i czytników ekranu w siatce dat to duże ryzyko błędów.
