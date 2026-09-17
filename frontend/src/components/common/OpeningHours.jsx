import { cn } from '../../utils/cn'
import { SITE } from '../../data/site'

/**
 * The opening hours, wherever they are shown.
 *
 * `tone` follows the same pattern as `SectionHeading`: the footer sits on navy
 * and the services pages sit on white, and the two sets of colours have to be
 * chosen together rather than fought over with `className` overrides.
 *
 * `columns` splits the three rows into a horizontal grid, which is what the
 * footer wants and what a sidebar does not.
 */
export default function OpeningHours({ tone = 'light', columns = false, className }) {
  const dark = tone === 'dark'

  return (
    <dl
      className={cn(
        'grid gap-2 text-sm',
        columns && 'sm:grid-cols-3',
        className,
      )}
    >
      {SITE.hours.map((entry) => (
        <div
          key={entry.days}
          className={cn(
            'flex justify-between gap-4',
            columns && 'sm:flex-col sm:gap-1',
          )}
        >
          <dt className={dark ? 'text-slate-400' : 'text-slate-500'}>
            {entry.days}
          </dt>
          <dd
            className={cn(
              'font-medium',
              dark ? 'text-slate-200' : 'text-brand-900',
            )}
          >
            {entry.time}
          </dd>
        </div>
      ))}
    </dl>
  )
}
