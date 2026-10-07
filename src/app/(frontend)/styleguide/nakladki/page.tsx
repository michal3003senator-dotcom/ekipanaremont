import { DialogDemo, SheetDemo, ToastDemo } from '../_components/Demos'
import { Section, State } from '../_components/Section'

export default function OverlaysPage() {
  return (
    <>
      <h1 className="pt-10 font-display text-h1 font-medium md:pt-16">Nakładki</h1>
      <Section
        title="Okno, panel, powiadomienie"
        description="Fokus zostaje w nakładce, Esc zamyka i wraca do przycisku. Dolny panel zamyka też przesunięcie w dół."
        className="sm:grid-cols-3"
      >
        <State label="Okno dialogowe">
          <DialogDemo />
        </State>
        <State label="Dolny panel">
          <SheetDemo />
        </State>
        <State label="Powiadomienie">
          <ToastDemo />
        </State>
      </Section>
    </>
  )
}
