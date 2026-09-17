import { useId } from 'react'
import { cn } from '../../utils/cn'
import { errorClasses, hintClasses, labelClasses } from './formStyles'

/**
 * Wraps a single control with its label, required marker, hint, and error.
 *
 * Uses a render prop so the generated id is wired to the control's `id` and
 * `aria-describedby` — that association is what makes the error message
 * reachable by screen readers, and it's easy to forget when each form wires
 * its own markup.
 */
export default function Field({
  label,
  hint,
  error,
  required = false,
  className,
  children,
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint && !error && (
        <p id={hintId} className={hintClasses}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={errorClasses}>
          {error}
        </p>
      )}
    </div>
  )
}
