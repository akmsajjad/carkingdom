import { Construction } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Temporary scaffold for a route that exists but whose content is built in a
 * later phase.
 *
 * It exists so the foundation can be navigated and tested end to end — every
 * route resolves, the navbar highlights correctly, and nothing 404s — without
 * pretending the page is finished. Each of these is replaced by real content
 * in its phase, and the `phase` prop makes it obvious which ones are still
 * outstanding.
 */
export default function PagePlaceholder({
  title,
  description,
  phase,
  className,
}) {
  return (
    <div className={cn('container-page py-20', className)}>
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Construction className="size-7 text-accent-600" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-brand-950">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        {phase && (
          <p className="mt-6 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-800 uppercase">
            {phase}
          </p>
        )}
      </div>
    </div>
  )
}
