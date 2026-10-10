import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

export const buttonVariants = cva(
  // Przyciski MD3: pigułki z warstwą stanu (najechanie 8%, wciśnięcie 12%) i lekkim uniesieniem.
  'state-layer inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-pill font-semibold transition duration-200 ease-standard active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
  {
    variants: {
      variant: {
        // Najwyżej jeden przycisk primary na ekranie (DESIGN §3).
        primary: 'bg-accent text-on-accent shadow-e1 hover:shadow-e2',
        // Tonalny (MD3 filled tonal): druga ważna akcja bez konkurowania z główną.
        tonal: 'bg-accent-container text-on-accent-container hover:shadow-e1',
        secondary: 'border border-line-strong bg-transparent text-text',
        ghost: 'text-text',
        danger: 'border border-danger text-danger',
      },
      size: {
        md: 'h-12 px-6 text-body',
        sm: 'h-11 px-4 text-small',
        icon: 'size-12',
        'icon-sm': 'size-11',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

type Variants = VariantProps<typeof buttonVariants>
// Przycisk z samą ikoną musi mieć podpis dla czytników ekranu.
type SizeProps = { size?: 'md' | 'sm' | null } | { size: 'icon' | 'icon-sm'; 'aria-label': string }

export type ButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> &
  Pick<Variants, 'variant'> &
  SizeProps & {
    'aria-label'?: string
    /** Trwa akcja: przycisk jest zablokowany i ogłasza zajętość. */
    loading?: boolean
    /** Styl przycisku na własnym elemencie (np. `<Link>`). */
    asChild?: boolean
  }

export function Button({
  variant,
  size,
  loading = false,
  asChild = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Icon icon={LoaderCircle} className="animate-spin" />}
      {children}
    </button>
  )
}
