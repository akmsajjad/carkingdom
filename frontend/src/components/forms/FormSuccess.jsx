import { CircleCheck } from 'lucide-react'
import Button from '../common/Button'

/**
 * The panel a lead form is replaced by once its submission succeeds.
 *
 * A toast alone is the wrong shape for this: the customer has just handed over
 * their contact details and needs to know what happens next, and a message that
 * clears itself after five seconds cannot carry that. The dialog stays open
 * with the confirmation until they dismiss it.
 */
export default function FormSuccess({ title, description, onReset, resetLabel = 'Send another' }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50">
        <CircleCheck className="size-7 text-emerald-600" aria-hidden="true" />
      </span>

      {/* `role="status"` rather than `alert`: the dialog is already the focus of
          attention, and an alert would interrupt before the heading is read. */}
      <h3 role="status" className="text-lg font-semibold text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      )}

      {onReset && (
        <Button variant="outline" className="mt-6" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </div>
  )
}
