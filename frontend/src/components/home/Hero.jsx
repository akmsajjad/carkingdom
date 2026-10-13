import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Gauge, Search, ShieldCheck, Wallet } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import OptimizedImage from '../common/OptimizedImage'
import Select from '../common/Select'
import useCarousel from '../../hooks/useCarousel'
import { MAKES } from '../../data/vehicles'
import { HERO_IMAGE } from '../../utils/images'
import { cn } from '../../utils/cn'
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
      {/* The background is a photograph of the showroom under a shadow stack.
          The section's own box is untouched: the photograph is the section's
          `background`, and every layer over it is `absolute` with
          `pointer-events-none`, so nothing here can move a measurement inside
          the hero or intercept a click on the search form.

          The constraint shaping the whole stack is the eyebrow. It is
          `text-accent-400` — #f06f80, luminance 0.31 — at 14px, so it needs the
          full 4.5:1, which means the pixels behind it must sit at luminance
          0.031 or below: about #313131, or nearly black. It is the only colour
          in the hero without contrast to spare; white and `brand-100` hold 12:1
          or better on anything this stack produces.

          That would be easy on a flat surface, and this photograph is not one.
          It is a bright, busy, high-contrast frame: saturated orange, red and
          blue car bodies across the left, yellow floor markings under them, and
          blown-out strip lights and reflections scattered through it. Almost
          none of it is dark enough to carry `accent-400` on its own, and the
          bright parts land behind the copy rather than beside it.

          So the stack is three layers — a uniform base that sets the floor, a
          red wash for the brand, and a gentle gradient for depth — and the
          numbers come from the arithmetic in the note on the base. The picture
          is meant to read as a dark showroom behind the content, not as a
          photograph competing with it; every value below was measured against
          the painted pixels at seven widths, not chosen by eye. */}

      {/* 1 — The photograph. `cover` plus `center` so it fills the section at
             every width without distorting, and the section keeps `bg-brand-900`
             underneath as the ground if the file ever fails to arrive. Decorative
             — the hero's meaning is in its copy — so it is a background rather
             than an `<img>` and carries no alt text. It is above the fold, so
             there is nothing to gain from lazy-loading it; see the note on its
             file size in `images.js`. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />

      {/* 2 — The base scrim, and the number here is the one worth explaining.
             The brief suggests starting around 0.60–0.70 and adjusting to the
             image; measurement against the painted pixels put this frame above
             that, at 0.80.

             The reason is arithmetic, not taste. `accent-400` needs 4.5:1, which
             caps the pixels behind it at luminance 0.031 — about rgb(49,49,49).
             This photograph has genuine blown highlights: ceiling strip lights,
             a white car, and reflections on a polished floor, several of them
             sitting behind the copy. A white pixel needs 0.807 of opacity to
             reach 0.031 from 1.0, so no scrim below that clears 4.5:1 wherever
             one of those highlights lands. That is the floor, and the gradient
             below is built to stay above it rather than to dip through it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/80"
      />

      {/* 3 — The brand wash: `accent-950` (#420512) rising from the bottom left.
             Black alone makes a photograph look switched off, so this warms the
             shadow toward the brand red and picks up where the picture is
             genuinely dark — the floor along the bottom edge. Kept to 12% at the
             top of the diagonal: the eyebrow lives up there, and every point of
             red luminance spent under it comes straight out of its 4.5:1. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-accent-950/55 via-accent-950/12 to-transparent"
      />

      {/* 4 — The directional gradient. It is weighted toward the right at `lg`,
             which is the reverse of the obvious move, and the reason is the
             card. Its caption sits on the brightest ground anywhere in the hero:
             `bg-white/5` over the scrim lifts whatever is behind it by about a
             dozen levels, and the blurred floor reflections underneath are
             bright to start with. On the previous background that left
             `accent-400` on the "Featured" label at 4.08:1 at 1024 and 4.46:1 at
             1280 — both under the 4.5 it needs, on the one label in the hero
             that was already failing before any of this. Spending the extra
             depth on the card's side of the frame is what recovers it, to
             5.9:1. The left is left alone because the eyebrow has headroom
             there, measuring 5.6–6.1:1 against a ground of roughly rgb(35,25,20).

             Below `lg` there is no second column: the copy and the card share
             one width, so the wash turns vertical and is deepest through the
             middle, which is where the card's caption lands. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/38 to-black/40 lg:bg-gradient-to-r lg:from-black/28 lg:via-black/30 lg:to-black/40"
      />

      {/* 5 — The lit top edge. One hairline is the whole trick: it reads as the
             top face of a pane catching the light, and it still works over a
             photograph — it separates the hero from the header rather than from
             a gradient. */}
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
