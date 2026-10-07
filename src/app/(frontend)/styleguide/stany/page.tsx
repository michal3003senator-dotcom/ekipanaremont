import { CircleAlert, Images, Inbox } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'

import { Section, State } from '../_components/Section'

export default function StatesPage() {
  return (
    <>
      <h1 className="pt-10 font-display text-h1 font-medium md:pt-16">Stany</h1>

      <Section
        title="Pusty stan"
        description="Zawsze z jedną konkretną akcją."
        className="md:grid-cols-2"
      >
        <EmptyState
          icon={Inbox}
          title="Brak zapytań"
          description="Gdy klient wyśle zapytanie, zobaczysz je tutaj. Firmy z potwierdzonym terminem są wyżej w wynikach."
          action={<Button variant="primary">Potwierdzam termin</Button>}
        />
        <EmptyState
          icon={Images}
          title="Nie masz jeszcze realizacji"
          description="Do wysłania profilu do akceptacji potrzebne są co najmniej 3 zdjęcia realizacji."
          action={<Button>Dodaj realizację</Button>}
        />
      </Section>

      <Section title="Błąd" description="Co się stało i co zrobić – bez przeprosin i ogólników.">
        <ErrorState
          icon={CircleAlert}
          title="Zapytanie nie zostało wysłane"
          description="Brak połączenia z internetem. Treść zapytania jest zapisana w formularzu – spróbuj ponownie."
          action={<Button>Spróbuj ponownie</Button>}
        />
      </Section>

      <Section
        title="Ładowanie"
        description="Szkielet w kształcie karty firmy; bez pulsowania przy ograniczonym ruchu."
      >
        <State label="Karta firmy">
          <div className="grid overflow-hidden rounded-card border border-line bg-surface-1 md:grid-cols-12">
            <Skeleton className="aspect-4/3 rounded-none md:col-span-3" />
            <div className="flex flex-col gap-3 p-4 md:col-span-5 md:p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/5" />
            </div>
            <div className="flex flex-col justify-center gap-3 border-t border-line p-4 md:col-span-4 md:border-s md:border-t-0 md:p-6">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </State>
      </Section>
    </>
  )
}
