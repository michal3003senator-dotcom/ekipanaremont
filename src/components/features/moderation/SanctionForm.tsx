'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { sanctionAction } from '@/app/(frontend)/moderacja/actions'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import {
  SANCTION_SCOPES,
  SANCTION_TYPES,
  type SanctionScope,
  type SanctionType,
} from '@/lib/moderation/options'

import type { ReasonTemplate } from './DecisionBar'

type Props = {
  accounts: { id: string; label: string; sanctions: number }[]
  reportId?: string
  templates: ReasonTemplate[]
}

const asOptions = (entries: Record<string, string>) =>
  Object.entries(entries).map(([value, label]) => ({ value, label }))

const DURATIONS = [
  { value: '7', label: '7 dni' },
  { value: '30', label: '30 dni' },
  { value: '90', label: '90 dni' },
  { value: 'none', label: 'Bezterminowo' },
]

/** Ostrzeżenie lub blokada konta firmy (SPEC 3.11) – rozwijane pod kartą, żeby nie kusiło. */
export function SanctionForm({ accounts, reportId, templates }: Props) {
  const router = useRouter()
  const prefix = useId()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [type, setType] = useState<SanctionType>('warning')
  const [scope, setScope] = useState<SanctionScope>('account')
  const [days, setDays] = useState('30')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (accounts.length === 0) return null
  if (!open)
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => setOpen(true)}
      >
        Ostrzeżenie lub blokada…
      </Button>
    )

  const submit = () =>
    startTransition(async () => {
      const result = await sanctionAction({
        accountId,
        scope,
        type,
        days: type === 'ban' && days !== 'none' ? Number(days) : null,
        reason: reason.trim(),
        reportId,
      })
      if (!result.ok) {
        setError(result.fieldErrors?.reason ?? result.message ?? 'Nie udało się zapisać sankcji.')
        return
      }
      toast({ title: type === 'ban' ? 'Nałożono blokadę' : 'Wysłano ostrzeżenie', tone: 'success' })
      setOpen(false)
      router.refresh()
    })

  return (
    <fieldset className="flex flex-col gap-3 rounded-control border border-line p-4">
      <legend className="px-1 font-medium">Sankcja dla konta firmy</legend>
      {accounts.length > 1 && (
        <Select
          aria-label="Konto"
          value={accountId}
          onChange={(event) => setAccountId(event.target.value)}
          options={accounts.map((account) => ({
            value: account.id,
            label: `${account.label}${account.sanctions ? ` · sankcje: ${account.sanctions}` : ''}`,
          }))}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <Select
          aria-label="Rodzaj"
          value={type}
          onChange={(event) => setType(event.target.value as SanctionType)}
          options={asOptions(SANCTION_TYPES)}
        />
        <Select
          aria-label="Zakres"
          value={scope}
          onChange={(event) => setScope(event.target.value as SanctionScope)}
          options={asOptions(SANCTION_SCOPES)}
        />
      </div>
      {type === 'ban' && (
        <Select
          aria-label="Czas blokady"
          value={days}
          onChange={(event) => setDays(event.target.value)}
          options={DURATIONS}
        />
      )}
      {templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => setReason(template.text)}
              className="state-layer rounded-pill border border-line-strong px-3 py-2 text-small"
            >
              {template.label}
            </button>
          ))}
        </div>
      )}
      <Textarea
        id={`${prefix}-reason`}
        aria-label="Uzasadnienie sankcji"
        value={reason}
        rows={3}
        maxLength={5000}
        onChange={(event) => {
          setReason(event.target.value)
          setError(null)
        }}
        placeholder="Uzasadnienie – firma dostanie je e-mailem z linkiem do odwołania."
      />
      {error && <p className="text-small text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          Anuluj
        </Button>
        <Button type="button" variant="danger" loading={pending} onClick={submit}>
          {type === 'ban' ? 'Blokuję' : 'Ostrzegam'}
        </Button>
      </div>
    </fieldset>
  )
}
