import { ProjectGallery } from '@/components/features/firm/ProjectGallery'

import { Section } from '../_components/Section'
import { PROJECTS } from '../_data'

export default function GalleryPage() {
  return (
    <>
      <h1 className="pt-10 font-display text-h1 font-semibold md:pt-16">Galeria</h1>
      <Section
        title="Realizacje"
        description="Proporcje 3:2, rozmyty podgląd przed wczytaniem. Powiększenie: przesuwanie palcem, strzałki, Esc; licznik „3 z 6”."
      >
        <ProjectGallery projects={PROJECTS} />
      </Section>
    </>
  )
}
