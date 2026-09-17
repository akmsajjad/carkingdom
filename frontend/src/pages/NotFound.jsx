import { CarFront, Phone, Search } from 'lucide-react'
import Button from '../components/common/Button'
import { TEL_HREF, SITE } from '../data/site'

/**
 * A real 404, not a placeholder — this page is finished and stays as it is.
 * It offers the three things someone who hit a dead link actually wants: the
 * inventory, the phone number, and a way back to the start.
 */
export default function NotFound() {
  return (
    <div className="container-page py-20 lg:py-28">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50">
          <CarFront className="size-8 text-brand-800" aria-hidden="true" />
        </span>

        <p className="mt-6 text-sm font-bold tracking-[0.2em] text-accent-600 uppercase">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-brand-950 sm:text-4xl">
          This page took a wrong turn
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          The page you were looking for does not exist or has been moved. The
          vehicle may have sold, or the link may be out of date.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to="/" variant="primary" size="lg">
            Back to home
          </Button>
          <Button to="/used-cars" variant="outline" size="lg" icon={Search}>
            Browse inventory
          </Button>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Need a hand?{' '}
          <a
            href={TEL_HREF}
            className="inline-flex items-center gap-1.5 font-semibold text-brand-800 hover:text-brand-950"
          >
            <Phone className="size-3.5" aria-hidden="true" />
            Call {SITE.phoneDisplay}
          </a>
        </p>
      </div>
    </div>
  )
}
