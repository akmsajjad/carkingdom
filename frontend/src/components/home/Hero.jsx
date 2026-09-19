import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Gauge, Search, ShieldCheck, Wallet } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import OptimizedImage from '../common/OptimizedImage'
import Select from '../common/Select'
import { MAKES } from '../../data/vehicles'
import { formatNumber, formatPrice, estimateMonthlyPayment } from '../../utils/format'

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'Every vehicle inspected' },
  { icon: Gauge, label: 'Full history report included' },
  { icon: Wallet, label: 'Financing for all credit' },
]

/**
 * The homepage hero.
 *
 * The search form navigates to the marketplace with the query in the URL rather
 * than filtering in place — the same parameters `/used-cars` already reads, so
 * the search on this page and the filters there are one system, not two.
 *
 * The featured vehicle is passed in rather than fetched here, so the homepage
 * fetches the featured list once and uses it for both the hero and the grid
 * below. Until it arrives `OptimizedImage` shows the category fallback at the
 * right aspect ratio, so nothing jumps.
 */
export default function Hero({ vehicle, stats }) {
  const navigate = useNavigate()
  const [make, setMake] = useState('')
  const [query, setQuery] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const params = new URLSearchParams()
    if (make) params.set('make', make)
    if (query.trim()) params.set('q', query.trim())

    const search = params.toString()
    navigate(search ? `/used-cars?${search}` : '/used-cars')
  }

  const makeOptions = MAKES.map((value) => ({ value, label: value }))
  const monthly = vehicle ? estimateMonthlyPayment(vehicle.effectivePrice) : null

  return (
    <section className="relative overflow-hidden bg-brand-950 text-white">
      {/* A soft radial wash instead of a photographic background: the only
          imagery this project ships is the generated SVG set, and blown up to
          full-bleed it reads as a placeholder rather than as a hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -right-40 size-[38rem] rounded-full bg-brand-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-40 size-[32rem] rounded-full bg-accent-500/10 blur-3xl"
      />

      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold tracking-wider text-accent-400 uppercase">
              Saskatoon, Saskatchewan
            </p>

            {/* `text-white` is not redundant with the section's own
                `text-white`. `index.css` sets a colour on `h1`-`h4` directly,
                and a declaration that lands on the element always beats one it
                would otherwise inherit — so without this the heading renders
                brand-950, near-black, on the graphite hero. Every heading on a
                dark surface in this project has to say so itself. */}
            <h1 className="mt-3 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
              Quality vehicles, honest service, and the parts to keep them
              running.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
              A Saskatoon dealership that shows you the inspection report
              before you ask for it, prices the car without the haggling, and
              services what it sells.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm sm:flex-row"
            >
              <div className="w-full sm:w-44 sm:shrink-0">
                <Select
                  aria-label="Filter by make"
                  value={make}
                  onChange={(event) => setMake(event.target.value)}
                  options={makeOptions}
                  placeholder="Any make"
                />
              </div>

              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Model, colour, or stock number"
                  aria-label="Search inventory"
                  className="pl-10"
                />
              </div>

              <Button type="submit" variant="accent" className="sm:shrink-0">
                Search
              </Button>
            </form>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-sm text-brand-100"
                >
                  <Icon className="size-4 shrink-0 text-accent-400" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Always rendered: showing the hero image column only once the
              featured fetch resolves would reflow the whole hero on every
              homepage load. */}
          <div className="relative">
            {!vehicle && (
              <div
                aria-hidden="true"
                className="aspect-4/3 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            )}

            {vehicle && (
              <>
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
                  <Link
                    to={`/used-cars/${vehicle.slug}`}
                    className="group block overflow-hidden rounded-xl"
                  >
                    <OptimizedImage
                      src={vehicle.images[0]}
                      alt={vehicle.title}
                      category="vehicles"
                      eager
                      className="aspect-4/3 transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex items-end justify-between gap-4 px-2 pt-4 pb-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-wide text-accent-400 uppercase">
                        Featured
                      </p>
                      <p className="mt-1 truncate font-semibold">{vehicle.title}</p>
                      <p className="mt-0.5 text-sm text-brand-200">
                        {formatNumber(vehicle.mileage)} km &middot;{' '}
                        {vehicle.transmission}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xl font-bold">
                        {formatPrice(vehicle.effectivePrice)}
                      </p>
                      {monthly && (
                        <p className="text-xs text-brand-200">
                          Est. {formatPrice(monthly)}/mo
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/used-cars/${vehicle.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                >
                  See this vehicle
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>

        {stats && (
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3 lg:max-w-2xl">
            <div>
              <dt className="text-sm text-brand-200">Vehicles in stock</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {formatNumber(stats.total)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-brand-200">Makes available</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {formatNumber(stats.makes)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-brand-200">Starting from</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {formatPrice(stats.lowestPrice)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  )
}
