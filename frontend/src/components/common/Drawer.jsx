import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import useOverlay from '../../hooks/useOverlay'

const SIDES = {
  right: { edge: 'right-0', hidden: 'translate-x-full' },
  left: { edge: 'left-0', hidden: '-translate-x-full' },
}

/**
 * A slide-over panel for small screens.
 *
 * Used by the mobile navigation and the mobile filter drawer. Both need the
 * same four things, and getting any of them subtly wrong is easy to do twice:
 * the panel stays mounted so it can animate in *and* out, it is marked `inert`
 * while closed so its links leave the tab order, page scroll is locked behind
 * it, and Escape closes it. The last two come from `useOverlay`.
 *
 * The panel is hidden at `lg` and above; on desktop the same content is
 * rendered inline by the caller.
 */
export default function Drawer({
  open,
  onClose,
  label,
  side = 'right',
  width = 'w-[min(20rem,85vw)]',
  title,
  children,
  footer,
}) {
  useOverlay(open, onClose)

  const { edge, hidden } = SIDES[side]

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      // `inert` rather than `aria-hidden`: the drawer stays mounted so it can
      // animate, and its links would otherwise remain reachable by Tab while
      // it is off-screen. inert removes the whole subtree from both the tab
      // order and the accessibility tree, which aria-hidden alone does not.
      inert={!open}
    >
      <button
        type="button"
        aria-label={`Close ${label}`}
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-brand-950/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          'absolute inset-y-0 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
          edge,
          width,
          open ? 'translate-x-0' : hidden,
        )}
      >
        <header className="flex h-header shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5">
          {title}
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${label}`}
            className="-mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-900"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-slate-200 p-4">{footer}</div>
        )}
      </aside>
    </div>
  )
}
