import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * The banner at the top of every inner page.
 *
 * One component so the heading scale, the dark band and the breadcrumb
 * placement stay identical from page to page. `children` is the slot for page
 * actions — a search field, a filter button — and the breadcrumb is omitted
 * entirely rather than rendered as a lone "Home" link on top-level pages.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  className,
}) {
  return (
    <header className={cn('bg-brand-950 text-white', className)}>
      <div className="container-page py-10 sm:py-14">
        {breadcrumbs?.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-brand-200">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1

                return (
                  <li key={crumb.to ?? crumb.label} className="flex items-center gap-1.5">
                    {index > 0 && (
                      <ChevronRight
                        className="size-3.5 shrink-0 text-brand-400"
                        aria-hidden="true"
                      />
                    )}
                    {isLast || !crumb.to ? (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className="text-brand-100"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.to}
                        className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-sm font-semibold tracking-wider text-accent-400 uppercase">
                {eyebrow}
              </p>
            )}
            <h1
              className={cn(
                'text-3xl font-bold tracking-tight sm:text-4xl',
                eyebrow && 'mt-2',
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-base leading-relaxed text-brand-100">
                {description}
              </p>
            )}
          </div>

          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
    </header>
  )
}
