import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { controlClasses, controlHeight } from './formStyles'

/**
 * Native select, styled. A native control is used deliberately: it is
 * keyboard- and screen-reader-correct for free, and on mobile it opens the
 * platform picker, which no custom dropdown matches.
 */
export default function Select({
  options = [],
  placeholder,
  invalid,
  className,
  children,
  ...props
}) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          controlClasses,
          controlHeight,
          'cursor-pointer appearance-none pr-10',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          // Three shapes are accepted, and the third is the one that bit: a
          // bare value that is neither a string nor a `{ value, label }` pair.
          // `yearsForVehicle` returns years as numbers, so `option.value` and
          // `option.label` were both `undefined` — React omitted the `value`
          // attribute and rendered an empty label, leaving a Year picker of
          // blank rows that still submitted nothing. Anything that is not a
          // plain object is now its own value and its own label.
          const isPair =
            option !== null && typeof option === 'object' && 'value' in option
          const value = isPair ? option.value : option
          const label = isPair ? option.label : option

          return (
            <option key={String(value)} value={value}>
              {label}
            </option>
          )
        })}
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  )
}
