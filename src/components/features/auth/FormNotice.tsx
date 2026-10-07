import { CircleAlert, CircleCheck, Info } from 'lucide-react'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** Komunikat całego formularza: błąd (`role=alert`), potwierdzenie albo informacja (`role=status`). */
export function FormNotice({
  tone,
  children,
  className,
}: {
  tone: 'error' | 'success' | 'info'
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-control border p-4 text-small',
        tone === 'error'
          ? 'border-danger text-danger'
          : 'border-line-strong bg-surface-2 text-text',
        className,
      )}
    >
      <Icon
        icon={tone === 'error' ? CircleAlert : tone === 'info' ? Info : CircleCheck}
        className={cn('mt-0.5 size-5', tone === 'success' && 'text-success')}
      />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}
