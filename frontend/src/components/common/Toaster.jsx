import { CircleCheck, CircleX, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const VARIANTS = {
  success: { icon: CircleCheck, accent: 'text-emerald-600' },
  error: { icon: CircleX, accent: 'text-red-600' },
  info: { icon: Info, accent: 'text-brand-600' },
}

/**
 * Renders the toast stack. Lives at the bottom on mobile and top-right on
 * larger screens, where it is least likely to cover controls.
 *
 * On a phone it clears the mobile call-to-action bar rather than sitting on
 * top of it. Both are pinned to the bottom edge, and a toast landing exactly
 * where the bar was reads as the bar having disappeared; the offset keeps the
 * bar in place and the message above it. The vehicle page swaps in its own bar
 * at roughly the same height, so one offset covers both.
 *
 * The live region is the text block inside each toast, not the whole card. It
 * used to be both — an `aria-live` container *and* `role="status"` per toast —
 * so every message was announced twice; and the buttons sat inside the region,
 * which drags "Dismiss notification" into the announcement. Errors announce
 * assertively: a rejected submit is the one message that should not queue
 * behind whatever else the screen reader is saying.
 */
export default function Toaster({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-mobile-cta z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-auto sm:items-end sm:p-6">
      {toasts.map((toast) => {
        const { icon: Icon, accent } = VARIANTS[toast.variant] ?? VARIANTS.info
        const isError = toast.variant === 'error'

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card-hover',
              'animate-toast-in',
            )}
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', accent)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div role={isError ? 'alert' : 'status'} aria-atomic="true">
                {toast.title && (
                  <p className="text-sm font-semibold text-slate-900">
                    {toast.title}
                  </p>
                )}
                <p className="text-sm text-slate-600">{toast.message}</p>
              </div>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick?.()
                    onDismiss(toast.id)
                  }}
                  className="mt-2 rounded-sm text-sm font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mt-1 -mr-1 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
