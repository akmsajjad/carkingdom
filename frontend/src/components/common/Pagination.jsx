import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Builds the page list as first, last, current, and the pages either side of
 * it, with a gap marker wherever numbers were skipped — so the control keeps a
 * fixed width whether there are 3 pages or 30.
 */
function pageItems(page, totalPages) {
  const wanted = new Set([1, totalPages, page, page - 1, page + 1])
  const numbers = [...wanted]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b)

  const items = []
  let previous = 0

  for (const value of numbers) {
    if (previous && value - previous > 1) {
      items.push({ type: 'gap', key: `gap-${previous}` })
    }
    items.push({ type: 'page', key: `page-${value}`, value })
    previous = value
  }

  return items
}

const ARROW_CLASSES =
  'inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-900 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500'

/**
 * Pagination for any paged list.
 *
 * Rendered as navigation rather than as a list of buttons, and the current page
 * carries `aria-current="page"` — which is what tells a screen reader which
 * number in the row is the one you are on, rather than leaving it to colour.
 *
 * `label` is the only thing a caller might want to change: a screen-reader user
 * hearing "Inventory pages" on the parts catalogue would reasonably think they
 * had been sent back to the vehicles.
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
  label = 'Inventory pages',
  className,
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label={label}
      className={cn('flex items-center justify-center gap-2', className)}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={ARROW_CLASSES}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      <ul className="flex items-center gap-1">
        {pageItems(page, totalPages).map((item) =>
          item.type === 'gap' ? (
            <li key={item.key} aria-hidden="true" className="px-1 text-slate-400">
              <MoreHorizontal className="size-4" />
            </li>
          ) : (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onChange(item.value)}
                aria-label={`Page ${item.value}`}
                aria-current={item.value === page ? 'page' : undefined}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
                  item.value === page
                    ? 'bg-brand-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-brand-900',
                )}
              >
                {item.value}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={ARROW_CLASSES}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
