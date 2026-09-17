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
          const value = typeof option === 'string' ? option : option.value
          const label = typeof option === 'string' ? option : option.label
          return (
            <option key={value} value={value}>
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
