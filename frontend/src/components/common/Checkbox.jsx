import { cn } from '../../utils/cn'

export default function Checkbox({ label, className, id, ...props }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 select-none',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="size-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30"
        {...props}
      />
      {label}
    </label>
  )
}
