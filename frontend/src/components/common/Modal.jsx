import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * Built on the native <dialog> element, which gives focus trapping, Escape
 * handling, inertness of the page behind, and correct screen-reader semantics
 * for free — all things a hand-rolled div-based modal gets subtly wrong.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  const dialogRef = useRef(null)
  // A literal id would repeat in the document as soon as a page renders two
  // dialogs — a gallery lightbox and an enquiry form, say — and
  // `aria-labelledby` resolves to the first match, so the second dialog would
  // announce the first one's title.
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  // The dialog closes itself on Escape; mirror that back into React state.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => onClose?.()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-xl border border-slate-200 bg-white p-0 shadow-card-hover',
        'backdrop:bg-brand-950/50 backdrop:backdrop-blur-sm',
        SIZES[size],
      )}
      // Clicking the backdrop targets the dialog element itself.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose?.()
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          {title && (
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mr-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

      {footer && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  )
}
