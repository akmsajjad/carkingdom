import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * One collapsible group in the filter sidebar.
 *
 * Built from a button and `aria-expanded` rather than the native `<details>`
 * element. `<details>` looks simpler, but its `open` attribute is a DOM
 * property React re-applies on every render, so toggling any filter would snap
 * every section back to its default state.
 *
 * Collapsed rather than hidden by default: eleven facet groups shown at once is
 * a wall, and the same markup serves as the mobile drawer's content.
 */
export default function FilterSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className="border-b border-slate-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-2 rounded-sm text-left text-sm font-semibold text-brand-900 transition-colors hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          {title}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-slate-400 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
      </h3>

      <div id={panelId} hidden={!open} className="mt-3 space-y-2.5">
        {children}
      </div>
    </div>
  )
}
