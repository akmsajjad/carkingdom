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
 */
export default function Toaster({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-auto sm:items-end sm:p-6"
    >
      {toasts.map((toast) => {
        const { icon: Icon, accent } = VARIANTS[toast.variant] ?? VARIANTS.info

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card-hover',
              'animate-toast-in',
            )}
            role="status"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', accent)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {toast.title && (
                <p className="text-sm font-semibold text-slate-900">
                  {toast.title}
                </p>
              )}
              <p className="text-sm text-slate-600">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick?.()
                    onDismiss(toast.id)
                  }}
                  className="mt-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mt-1 -mr-1 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
