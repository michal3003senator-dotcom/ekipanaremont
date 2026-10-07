export const WIZARD_STEPS = [
  { key: 'nip', label: 'NIP' },
  { key: 'uslugi', label: 'Usługi i obszar' },
  { key: 'o-firmie', label: 'O firmie' },
  { key: 'realizacje', label: 'Realizacje' },
  { key: 'wyslij', label: 'Wysłanie' },
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]['key']

export const stepHref = (key: WizardStep) => `/panel/profil/nowy?krok=${key}`

export function nextStep(key: WizardStep): WizardStep {
  const index = WIZARD_STEPS.findIndex((step) => step.key === key)
  return WIZARD_STEPS[Math.min(index + 1, WIZARD_STEPS.length - 1)]!.key
}
