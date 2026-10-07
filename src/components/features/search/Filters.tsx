'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/Checkbox'
import { Icon } from '@/components/ui/Icon'
import { Select } from '@/components/ui/Select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet'
import { searchHref } from '@/lib/search/href'
import type { SearchParams } from '@/lib/search/params'

type Props = {
  params: SearchParams
  /** Podusługi wybranej usługi (filtr „zakres prac”). */
  scope: { value: string; label: string }[]
  hasLocality: boolean
  activeCount: number
}

const RADII = [
  { value: '', label: 'Obszar działania firmy' },
  { value: '10', label: 'Do 10 km' },
  { value: '25', label: 'Do 25 km' },
  { value: '50', label: 'Do 50 km' },
]

/**
 * Filtry w adresie (SPEC 3.1). Na komputerze działają od razu, na telefonie w dolnym panelu.
 * Termin startu jest w wyszukiwarce nad wynikami – tu go nie powtarzamy.
 */
export function Filters({ params, scope, hasLocality, activeCount }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const go = (patch: Partial<SearchParams>) =>
    startTransition(() => router.push(searchHref(params, patch), { scroll: false }))
  const toggleScope = (value: string, on: boolean) => {
    const current = new Set(params.zakres ?? [])
    if (on) current.add(value)
    else current.delete(value)
    go({ zakres: current.size ? [...current] : undefined })
  }

  const body = (
    <div className="flex flex-col gap-6">
      {hasLocality && (
        <label className="flex flex-col gap-2 text-small font-medium">
          Obszar
          <Select
            options={RADII}
            value={params.promien ?? ''}
            onChange={(event) =>
              go({ promien: (event.target.value || undefined) as SearchParams['promien'] })
            }
          />
        </label>
      )}
      {scope.length > 0 && (
        <fieldset className="flex flex-col">
          <legend className="mb-1 text-small font-medium">Zakres prac</legend>
          {scope.map((item) => (
            <CheckboxField
              key={item.value}
              id={`zakres-${item.value}`}
              label={item.label}
              checked={params.zakres?.includes(item.value) ?? false}
              onCheckedChange={(checked) => toggleScope(item.value, checked === true)}
            />
          ))}
        </fieldset>
      )}
      <fieldset className="flex flex-col">
        <legend className="mb-1 text-small font-medium">Firma</legend>
        <CheckboxField
          id="vat"
          label="Wystawia faktury VAT"
          checked={params.vat === '1'}
          onCheckedChange={(checked) => go({ vat: checked ? '1' : undefined })}
        />
        <CheckboxField
          id="ocena"
          label="Ocena 4,5 i wyżej"
          checked={params.ocena === '1'}
          onCheckedChange={(checked) => go({ ocena: checked ? '1' : undefined })}
        />
        <CheckboxField
          id="gwarancja"
          label="Daje gwarancję"
          checked={params.gwarancja === '1'}
          onCheckedChange={(checked) => go({ gwarancja: checked ? '1' : undefined })}
        />
      </fieldset>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">{body}</div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary" className="lg:hidden">
            <Icon icon={SlidersHorizontal} />
            Filtry{activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        </SheetTrigger>
        <SheetContent
          title="Filtry"
          onDismiss={() => setOpen(false)}
          footer={
            <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>
              Pokazuję wyniki
            </Button>
          }
        >
          {body}
        </SheetContent>
      </Sheet>
    </>
  )
}
