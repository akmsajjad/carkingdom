import { cn } from '../../utils/cn'

/**
 * Shown when a list or collection is legitimately empty. Always offers a way
 * out — an empty state without a next action is a dead end.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
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
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
