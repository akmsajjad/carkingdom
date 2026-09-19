import { cn } from '../../utils/cn'

/**
 * Shown when a list or collection is legitimately empty. Always offers a way
 * out — an empty state without a next action is a dead end.
 *
 * `as` defaults to `h2` because these replace a page's main content, directly
 * under its `h1`. It is overridable for the rare nesting where a heading
 * already sits above it. It used to be a hard-coded `h3`, which skipped a
 * level on every page that used it.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  as: Heading = 'h2',
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100">
          <Icon className="size-7 text-slate-400" aria-hidden="true" />
        </span>
      )}
      <Heading className="text-lg font-semibold text-slate-900">{title}</Heading>
      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
