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
            <>
              {/* The asterisk is decoration; this is what actually tells a
                  screen reader the field is required. Without it the control
                  announces as an ordinary input on every form in the site. */}
              <span className="sr-only"> (required)</span>
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            </>
          )}
        </label>
      )}

      {children({ id, describedBy, invalid: Boolean(error), required })}

      {hint && !error && (
        <p id={hintId} className={hintClasses}>
          {hint}
        </p>
      )}
      {error && (
        // A field error appears in response to a submit the user just made, so
        // it has to announce itself — the summary at the top of the form is
        // not necessarily where attention is.
        <p id={errorId} className={errorClasses} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
