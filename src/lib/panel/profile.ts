import type { Firm } from '@/payload-types'

/** Najmniej zdjęć realizacji przed wysłaniem profilu do akceptacji (SPEC 3.3 pkt 5). */
export const MIN_PROFILE_PHOTOS = 3
export const MAX_PROJECT_PHOTOS = 12

export type ProfileGap = { key: string; label: string; href: string }

type FirmFields = Pick<
  Firm,
  'services' | 'serviceArea' | 'baseLocality' | 'shortDescription' | 'registryVerifiedAt'
>

/** Braki profilu w kolejności kreatora – lista na pulpicie i warunek wysłania do akceptacji. */
export function profileGaps(firm: FirmFields, photoCount: number): ProfileGap[] {
  const gaps: ProfileGap[] = []
  if (!firm.services?.length)
    gaps.push({ key: 'services', label: 'Wybierz usługi', href: '/panel/profil/nowy?krok=uslugi' })
  if (!firm.serviceArea?.length || !firm.baseLocality)
    gaps.push({
      key: 'area',
      label: 'Dodaj siedzibę i obszar działania',
      href: '/panel/profil/nowy?krok=uslugi',
    })
  if (!firm.shortDescription)
    gaps.push({
      key: 'about',
      label: 'Opisz firmę w 2–3 zdaniach',
      href: '/panel/profil/nowy?krok=o-firmie',
    })
  if (photoCount < MIN_PROFILE_PHOTOS) {
    const missing = MIN_PROFILE_PHOTOS - photoCount
    gaps.push({
      key: 'photos',
      label:
        missing === 1
          ? 'Dodaj jeszcze 1 zdjęcie realizacji'
          : `Dodaj jeszcze ${missing} zdjęcia realizacji`,
      href: '/panel/profil/nowy?krok=realizacje',
    })
  }
  return gaps
}

export const STATUS_COPY: Record<Firm['status'], { label: string; detail: string }> = {
  draft: { label: 'Szkic', detail: 'Uzupełnij profil i wyślij go do akceptacji.' },
  pending_review: {
    label: 'Czeka na akceptację',
    detail: 'Moderator sprawdza profil, zwykle w ciągu 1 dnia roboczego.',
  },
  active: { label: 'Widoczny dla klientów', detail: 'Profil jest w wyszukiwarce.' },
  suspended: {
    label: 'Zawieszony',
    detail: 'Profil jest ukryty. Szczegóły w e-mailu od moderatora.',
  },
  rejected: { label: 'Do poprawy', detail: 'Popraw profil według uzasadnienia i wyślij ponownie.' },
}
