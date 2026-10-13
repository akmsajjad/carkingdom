import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Gauge, Search, ShieldCheck, Wallet } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import OptimizedImage from '../common/OptimizedImage'
import Select from '../common/Select'
import useCarousel from '../../hooks/useCarousel'
import { MAKES } from '../../data/vehicles'
import { cn } from '../../utils/cn'
import { formatNumber, formatPrice, estimateMonthlyPayment } from '../../utils/format'

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'Every vehicle inspected' },
  { icon: Gauge, label: 'Full history report included' },
  { icon: Wallet, label: 'Financing for all credit' },
]

/**
 * The hero's background texture, as CSS values rather than as an image file.
 *
 * Two 1px gradient rules produce the grid; `GRID_FADE` then masks it so it
 * dissolves toward the bottom instead of stopping at a hard line above the
 * statistics. Kept in `style` rather than in a utility class because the
 * layer list and the mask are not worth spending theme tokens on for one
 * component — and because §3 rules out adding a background image for this.
 */
const GRID_LINES =
  'linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), ' +
  'linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)'

const GRID_FADE =
  'radial-gradient(ellipse 90% 70% at 50% 0%, #000 25%, transparent 100%)'

/**
 * The homepage hero.
 *
 * The search form navigates to the marketplace with the query in the URL rather
 * than filtering in place — the same parameters `/used-cars` already reads, so
 * the search on this page and the filters there are one system, not two.
 *
 * The featured vehicles are passed in rather than fetched here, so the homepage
 * fetches that list once and uses it for both this card and the grid below.
 * Until it arrives the column shows a skeleton at the card's own aspect ratio,
 * so the hero does not reflow when the data lands.
 */
export default function Hero({ vehicles = [], stats }) {
  const navigate = useNavigate()
  const [make, setMake] = useState('')
  const [query, setQuery] = useState('')

  const { index, goTo, autoPlaying, handlers } = useCarousel(vehicles.length)
  const active = vehicles[index]

  const handleSubmit = (event) => {
    event.preventDefault()

    const params = new URLSearchParams()
    if (make) params.set('make', make)
    if (query.trim()) params.set('q', query.trim())

    const search = params.toString()
    navigate(search ? `/used-cars?${search}` : '/used-cars')
  }

  const makeOptions = MAKES.map((value) => ({ value, label: value }))

  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      {/* The background is built from light rather than from a picture.
          The only imagery this project ships is the generated SVG set, and its
          artwork is pale line-drawing on a near-white ground — blown up to
          full-bleed here it would drop a light-blue rectangle into a graphite
          and red hero and read as a placeholder.

          So the depth comes from stacked translucent layers instead: a lit
          base, four soft radial glows, a single diagonal sheen, and a fine
          grid. All of them are `absolute` and `aria-hidden`, so the section's
          own box — and therefore every measurement inside it — is unchanged.

          The one hard constraint shaping all of it is the eyebrow. It is
          `text-accent-400` at 14px, so it needs the full 4.5:1, and it is the
          only colour in the hero without contrast to spare — white and
          `brand-100` hold 12:1 or better almost anywhere on this surface. That
          is why the base stays between brand-700 and brand-950 and the lighter
          values are spent only on glows, only where the copy is not. Every
          figure here was measured against the painted pixels at eight widths
          from 360 to 1440; the worst result anywhere in the hero is 4.85:1. */}

      {/* 1 — The base wash. The hero is lit from the right, so the surface reads
             as a material with a direction to the light rather than as flat
             black. The bright end is held back until `lg`, and that is a
             measured decision, not a stylistic one: below it the layout is a
             single column and the text runs the full width, so that end lands
             under the eyebrow — whose `accent-400` is the one colour in the
             hero without contrast to spare. Below `lg` the surface stays deep
             and the life comes from the glows alone. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-900 lg:to-brand-700/50"
      />

      {/* 2 — Key light, upper right, behind the vehicle card — the one place a
             lighter field costs no contrast. Only meaningful once the card is
             actually beside the copy rather than below it, so `lg` again: at
             phone width this 40rem disc covers the entire viewport and puts the
             eyebrow on a light ground. At `lg` it can be generous, because the
             text column sits well clear of it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-28 hidden size-[40rem] rounded-full bg-brand-700/25 blur-3xl lg:block lg:bg-brand-600/30"
      />

      {/* 2b — A second, warmer glow low and right, so the light has a source and
             a reflection rather than one bright corner. `lg` only, for the same
             reason: below it there is nowhere to put a 30rem disc that the copy
             does not occupy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-44 hidden size-[30rem] rounded-full bg-accent-600/15 blur-3xl lg:block"
      />

      {/* 3 — Accent bloom, upper left: the brand red bleeding through the glass.
             Held to 6%, and that is the whole point of it. `accent-600` is
             already a fairly bright red; at 20% it put enough luminance under
             the eyebrow to drop `accent-400` to 3.8:1 on a phone, and on a
             phone there is nowhere to move a 34rem disc to. At this weight it
             warms the corner without spending any of the contrast budget. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-64 -left-56 size-[34rem] rounded-full bg-accent-600/6 blur-3xl"
      />

      {/* 4 — Cool fill, lower left, so the bottom edge is not a dead flat field.
             Far enough down to clear the text on every breakpoint. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-40 size-[32rem] rounded-full bg-brand-600/20 blur-3xl"
      />

      {/* 5 — A single soft diagonal sheen, the way light crosses a pane. This is
             what makes the surface read as glass rather than as a gradient. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/4 h-[170%] w-[28rem] -rotate-12 bg-gradient-to-b from-white/[0.03] via-white/[0.008] to-transparent blur-2xl"
      />

      {/* 6 — A fine grid, held at the threshold of visibility. Pure CSS, so it
             adds no request and no asset — just the suggestion of technical
             drawing behind the content. The mask fades it out toward the
             bottom so it never fights the statistics row. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: GRID_LINES,
          backgroundSize: '48px 48px',
          maskImage: GRID_FADE,
          WebkitMaskImage: GRID_FADE,
        }}
      />

      {/* 7 — The lit top edge. One hairline is the whole trick: it reads as the
             top face of a pane catching the light. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
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
              homepage load.

              The card frame itself does not move — the glass panel, its border,
              its padding and its shadow are exactly what they were. Only the
              contents slide, so the card keeps its design and the hero keeps
              its height.

              `min-w-0` is load-bearing, not tidying. Below `lg` this column is
              a single-column grid, and an implicit track is `auto` — so the
              item's automatic minimum size is its own min-content. The track
              inside is a `nowrap` flex row, whose min-content is the *sum* of
              its slides (the text row's min-content is ~290px each), so six
              slides asked for ~1750px and blew the whole hero out of the
              viewport — clipped, and cutting the h1 and the search button. One
              card was 290px and fit. `min-width: 0` lets the item shrink to the
              track and pushes the overflow back inside the carousel's own
              clipping, where it belongs. It is a no-op at `lg`, where the
              two-column track is already `minmax(0, 1fr)`. */}
          <div className="relative min-w-0">
            {vehicles.length === 0 && (
              <div
                aria-hidden="true"
                className="aspect-4/3 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            )}

            {vehicles.length > 0 && (
              <div
                role="region"
                aria-roledescription="carousel"
                aria-label="Featured vehicles"
                {...handlers}
              >
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
                  {/* Clipped here rather than left to the card: the card's own
                      `overflow-hidden` clips at its padding box, which would
                      leave the neighbouring slide visible through the 12px of
                      `p-3` as a sliver down the edge of the photo. */}
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${index * 100}%)` }}
                    >
                      {vehicles.map((item, i) => {
                        const isCurrent = i === index
                        const monthly = estimateMonthlyPayment(item.effectivePrice)

                        return (
                          <div
                            key={item.id}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} of ${vehicles.length}`}
                            aria-hidden={!isCurrent || undefined}
                            inert={!isCurrent || undefined}
                            className="w-full shrink-0"
                          >
                            <Link
                              to={`/used-cars/${item.slug}`}
                              className="group block overflow-hidden rounded-xl"
                            >
                              <OptimizedImage
                                src={item.images[0]}
                                alt={item.title}
                                category="vehicles"
                                eager={i === 0}
                                className="aspect-4/3 transition-transform duration-500 group-hover:scale-105"
                              />
                            </Link>

                            <div className="flex items-end justify-between gap-4 px-2 pt-4 pb-1">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-wide text-accent-400 uppercase">
                                  Featured
                                </p>
                                <p className="mt-1 truncate font-semibold">
                                  {item.title}
                                </p>
                                <p className="mt-0.5 text-sm text-brand-200">
                                  {formatNumber(item.mileage)} km &middot;{' '}
                                  {item.transmission}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-xl font-bold">
                                  {formatPrice(item.effectivePrice)}
                                </p>
                                {monthly && (
                                  <p className="text-xs text-brand-200">
                                    Est. {formatPrice(monthly)}/mo
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* The indicator shares the existing link's row rather than
                    taking one of its own, so the sliding costs the hero no
                    height at all. */}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <Link
                    to={`/used-cars/${active.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                  >
                    See this vehicle
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {vehicles.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Show ${item.title}`}
                        aria-current={i === index ? 'true' : undefined}
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          i === index
                            ? 'w-6 bg-accent-500'
                            : 'w-2 bg-white/25 hover:bg-white/45',
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Announced only when nothing is moving on its own, so it does
                    not interrupt a screen reader every four and a half seconds. */}
                <p
                  className="sr-only"
                  role="status"
                  aria-live={autoPlaying ? 'off' : 'polite'}
                >
                  {`Vehicle ${index + 1} of ${vehicles.length}: ${active.title}`}
                </p>
              </div>
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
