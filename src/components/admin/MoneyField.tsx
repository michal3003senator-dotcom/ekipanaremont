'use client'

import { TextInput, useField } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'
import { useState } from 'react'

import { groszeToZlotyInput, parseZlotyToGrosze } from '@/lib/format/number'

/**
 * Kwota w panelu admina: redaktor wpisuje złote („250” albo „249,99”), w bazie zostają grosze
 * (CLAUDE.md: kwoty jako integer).
 */
export const MoneyField: NumberFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
  const { value, setValue, showError, path } = useField<number | null>({
    potentiallyStalePath: pathFromProps,
  })
  const [text, setText] = useState(() =>
    typeof value === 'number' && Number.isFinite(value) ? groszeToZlotyInput(value) : '',
  )

  return (
    <TextInput
      path={path}
      label={field.label}
      required={field.required}
      readOnly={readOnly}
      showError={showError}
      value={text}
      description={field.admin?.description ?? 'Kwota w złotych, np. 250 albo 249,99.'}
      AfterInput={<span className="money-field__unit">zł</span>}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
        setValue(parseZlotyToGrosze(event.target.value))
      }}
    />
  )
}
