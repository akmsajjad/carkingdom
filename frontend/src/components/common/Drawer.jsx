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
 * it, and Escape closes it. The last two come from `useOverlay`, along with
 * the focus trap and the focus that is handed back to the trigger on close.
 *
 * The panel is hidden at `lg` and above; on desktop the same content is
 * rendered inline by the caller.
 *
 * `id` is for the control that opens the panel, so it can carry
 * `aria-controls`. Optional, because a panel nothing points at is still a
 * working panel.
 *
 * ## Tone
 *
 * `tone="dark"` gives the panel the header's graphite and switches its chrome
 * to light-on-dark. The mobile navigation uses it so the menu that opens from
 * the header reads as an extension of that header rather than as a white sheet
 * laid over it.
 *
 * It is a prop rather than the drawer's own styling because the filter drawers
 * share this component and are a different thing: they hold form controls that
 * are built for light surfaces, and they open from a white results page, not
 * from the header. Darkening them would mean restyling every control inside
 * them for a change nobody asked for.
 */
export default function Drawer({
  id,
  open,
  onClose,
  label,
  side = 'right',
  width = 'w-[min(20rem,85vw)]',
  tone = 'light',
  title,
  children,
  footer,
}) {
  const panelRef = useOverlay(open, onClose)

  const { edge, hidden } = SIDES[side]
  const dark = tone === 'dark'

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
      {/* The tap-outside-to-close area. `tabIndex={-1}` keeps it out of the
          tab order — it is the first element in the panel's DOM, so without
          this it was the first Tab stop and the focus trap had to fight it.
          `aria-hidden` because a keyboard user already has Escape and the
          close button; leaving it exposed would also give them two controls
          both named "Close {label}" and no way to tell which was which. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-brand-950/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 flex flex-col shadow-2xl transition-transform duration-300 ease-out focus:outline-none',
          dark ? 'bg-brand-900' : 'bg-white',
          edge,
          width,
          open ? 'translate-x-0' : hidden,
        )}
      >
        <header
          className={cn(
            'flex h-header shrink-0 items-center justify-between gap-4 border-b px-5',
            dark ? 'border-white/10' : 'border-slate-200',
          )}
        >
          {title}
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${label}`}
            className={cn(
              '-mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
              dark
                ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-brand-900',
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div
            className={cn(
              'shrink-0 border-t p-4',
              dark ? 'border-white/10' : 'border-slate-200',
            )}
          >
            {footer}
          </div>
        )}
      </aside>
    </div>
  )
}
