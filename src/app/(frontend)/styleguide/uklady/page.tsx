import { PanelBottomNav } from '@/components/layout/PanelBottomNav'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Pagination } from '@/components/ui/Pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

import { Section, State } from '../_components/Section'

export default function LayoutsPage() {
  return (
    <>
      <h1 className="pt-10 font-display text-h1 font-medium md:pt-16">Układy</h1>
      <p className="mt-3 max-w-prose text-small text-text-muted">
        Nagłówek i stopka są na górze i na dole tej strony. Na telefonie menu otwiera się w dolnym
        panelu.
      </p>

      <Section title="Ścieżka i zakładki">
        <State label="Ścieżka">
          <Breadcrumbs
            items={[
              { label: 'Łódź', href: '/styleguide/uklady' },
              { label: 'Glazura', href: '/styleguide/uklady' },
              { label: 'Pracownia Glazury Kowal' },
            ]}
          />
        </State>
        <State label="Zakładki">
          <Tabs defaultValue="realizacje">
            <TabsList aria-label="Sekcje profilu">
              <TabsTrigger value="realizacje">
                Realizacje <span className="font-data text-text-muted">14</span>
              </TabsTrigger>
              <TabsTrigger value="uslugi">Usługi</TabsTrigger>
              <TabsTrigger value="opinie">
                Opinie <span className="font-data text-text-muted">37</span>
              </TabsTrigger>
              <TabsTrigger value="o-firmie">O firmie</TabsTrigger>
            </TabsList>
            <TabsContent value="realizacje" className="text-small text-text-muted">
              Zakładki przełącza się strzałkami.
            </TabsContent>
            <TabsContent value="uslugi" className="text-small text-text-muted">
              Usługi firmy.
            </TabsContent>
            <TabsContent value="opinie" className="text-small text-text-muted">
              Opinie klientów.
            </TabsContent>
            <TabsContent value="o-firmie" className="text-small text-text-muted">
              O firmie.
            </TabsContent>
          </Tabs>
        </State>
      </Section>

      <Section
        title="Strony wyników"
        description="Numer strony w adresie (?strona=6), 12 wyników na stronę."
      >
        <Pagination
          page={6}
          totalPages={20}
          hrefFor={(page) => `/styleguide/uklady?strona=${page}`}
        />
      </Section>

      <Section
        title="Dolna nawigacja panelu firmy"
        description="Na telefonie przyklejona do dołu ekranu, nad paskiem systemowym. Tu w ramce."
      >
        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-card border border-line">
          <div className="h-32 bg-bg" />
          <PanelBottomNav current="termin" newInquiries={3} />
        </div>
      </Section>
    </>
  )
}
