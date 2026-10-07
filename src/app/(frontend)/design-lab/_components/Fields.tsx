import { cx } from '@/lib/cx'

type Option = { value: string; label: string }

export const START_OPTIONS: Option[] = [
  { value: 'obojetnie', label: 'obojętnie' },
  { value: '7', label: '7 dni' },
  { value: '14', label: '14 dni' },
  { value: '30', label: '30 dni' },
]

const labelClass = 'text-micro font-medium uppercase tracking-caps text-text-muted'

type SelectProps = {
  id: string
  label: string
  name: string
  options: readonly Option[]
  defaultValue?: string
  className?: string
}

export function SelectField({ id, label, name, options, defaultValue, className }: SelectProps) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue}
          className="h-12 w-full appearance-none rounded-control border border-line-strong bg-surface-2 ps-4 pe-10 text-body text-text transition-colors duration-150 hover:border-text-muted"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  )
}

type SegmentedProps = {
  legend: string
  name: string
  options: readonly Option[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}

/** Wybór jednej z kilku opcji (radio) w jednym polu, np. „Start: obojętnie / 7 / 14 / 30 dni”. */
export function SegmentedField(props: SegmentedProps) {
  const { legend, name, options, value, defaultValue, onChange, className } = props
  return (
    <fieldset className={cx('flex flex-col gap-1.5', className)}>
      <legend className={cx(labelClass, 'mb-1.5')}>{legend}</legend>
      <div className="grid h-12 grid-cols-4 gap-1 rounded-control border border-line-strong bg-surface-2 p-1">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={value === undefined ? defaultValue === option.value : undefined}
              onChange={onChange ? () => onChange(option.value) : undefined}
              className="peer sr-only"
            />
            <span className="flex h-full cursor-pointer items-center justify-center whitespace-nowrap rounded-badge px-2 text-small text-text-muted transition-colors duration-150 peer-checked:bg-surface-1 peer-checked:font-medium peer-checked:text-text peer-checked:ring-1 peer-checked:ring-line-strong peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:text-text">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function PrimaryButton({ children, className }: { children: string; className?: string }) {
  return (
    <button
      type="submit"
      className={cx(
        'h-12 cursor-pointer rounded-control bg-accent px-6 font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-hover',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
