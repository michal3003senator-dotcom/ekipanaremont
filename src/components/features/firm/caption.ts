import { formatMonth } from '@/lib/format/date'

import type { Project } from './types'

/** Podpis zdjęcia realizacji: „Łazienka, Łódź · marzec 2026”. */
export const projectCaption = (project: Project) =>
  `${project.title}, ${project.locality} · ${formatMonth(project.month)}`
