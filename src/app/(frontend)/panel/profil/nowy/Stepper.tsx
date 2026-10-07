import Link from 'next/link'

import { cn } from '@/lib/cn'

import { stepHref, WIZARD_STEPS, type WizardStep } from './steps'

/**
 * Postęp kreatora jako rząd kafli – ten sam motyw co pasek terminu: kroki za nami są wypełnione,
 * bieżący świeci akcentem. Kroki to prawdziwa kolejność, więc numeracja niesie informację.
 */
export function Stepper({ current, done }: { current: WizardStep; done: ReadonlySet<WizardStep> }) {
  const index = WIZARD_STEPS.findIndex((step) => step.key === current)
  return (
    <nav aria-label="Kroki profilu" className="mb-8 flex flex-col gap-3">
      <p className="text-small text-text-muted">
        Krok <span className="font-data tabular-nums">{index + 1}</span> z{' '}
        <span className="font-data tabular-nums">{WIZARD_STEPS.length}</span> ·{' '}
        <span className="font-medium text-text">{WIZARD_STEPS[index]!.label}</span>
      </p>
      <ol className="grid grid-cols-5 gap-1">
        {WIZARD_STEPS.map((step, position) => {
          const state = step.key === current ? 'current' : done.has(step.key) ? 'done' : 'todo'
          const reachable =
            position === 0 || done.has(WIZARD_STEPS[position - 1]!.key) || state !== 'todo'
          const tile = (
            <span
              className={cn(
                'block h-2 rounded-tile transition-colors duration-150',
                state === 'current' ? 'bg-accent' : state === 'done' ? 'bg-text-muted' : 'bg-line',
              )}
            />
          )
          return (
            <li key={step.key}>
              {reachable ? (
                <Link
                  href={stepHref(step.key)}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className="flex min-h-11 flex-col justify-center gap-1.5"
                >
                  {tile}
                  <span className="text-micro text-text-muted max-sm:sr-only">{step.label}</span>
                </Link>
              ) : (
                <span
                  className="flex min-h-11 flex-col justify-center gap-1.5"
                  aria-disabled="true"
                >
                  {tile}
                  <span className="text-micro text-text-muted max-sm:sr-only">{step.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
