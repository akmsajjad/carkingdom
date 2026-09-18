import { Link } from 'react-router-dom'
import { ArrowRight, Check, Minus } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'
import { cn } from '../../utils/cn'
import {
  COMPARISON_ROWS,
  FEATURES_ROW_LABEL,
} from '../../data/comparison'
import { buildFeatureMatrix, rowDiffers } from '../../utils/comparison'
import { formatMileage, formatPrice } from '../../utils/format'

/** Named formatters, so `data/comparison.js` can stay a data file. */
const FORMATTERS = {
  price: formatPrice,
  mileage: formatMileage,
}

const CELL = 'px-4 py-3 align-middle'

/**
 * §26's comparison table.
 *
 * One `<table>` at every width, inside a horizontally scrolling container with
 * the attribute column pinned to the left. The alternative — a card per vehicle
 * on small screens — means reading nine attributes four times over and holding
 * the differences in your head, which is the opposite of comparing. Scrolling
 * between columns keeps an attribute and the values for it on screen together,
 * which is what the eye needs; the pinned first column is what stops it losing
 * track of which row it is on.
 *
 * The header row is sticky for the same reason as the first column: past the
 * third attribute, "which column was the RAV4" is a fair question.
 *
 * A real table, not a grid of divs. These are rows and columns of comparable
 * data, and a screen reader announces the column header for each cell as a
 * result — on a comparison page that is most of the value.
 */
export default function CompareTable({ vehicles, showOnlyDifferences = false }) {
  const features = buildFeatureMatrix(vehicles)
  const featureRows = showOnlyDifferences
    ? features.filter((row) => row.differs)
    : features

  const hiddenFeatureCount = features.length - featureRows.length

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Specification comparison of {vehicles.length} vehicles
        </caption>

        <thead>
          <tr>
            <th
              scope="col"
              className={cn(
                'sticky left-0 z-20 min-w-32 border-b border-slate-200 bg-white',
                CELL,
                'text-left text-xs font-semibold tracking-wide text-slate-500 uppercase',
              )}
            >
              <span className="sr-only">Specification</span>
            </th>

            {vehicles.map((vehicle) => (
              <th
                key={vehicle.id}
                scope="col"
                className="min-w-56 border-b border-l border-slate-200 bg-white p-4 text-left align-top font-normal"
              >
                <div className="relative">
                  <OptimizedImage
                    src={vehicle.images[0]}
                    alt={vehicle.title}
                    category="vehicles"
                    className="aspect-4/3 rounded-lg"
                  />

                  <p className="mt-3 text-xs font-semibold tracking-wide text-accent-600 uppercase">
                    {vehicle.condition}
                  </p>

                  <h2 className="mt-1 text-base leading-snug font-semibold text-brand-900">
                    <Link
                      to={`/used-cars/${vehicle.slug}`}
                      className="rounded-sm hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                    >
                      {vehicle.title}
                    </Link>
                  </h2>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {COMPARISON_ROWS.map((row) => {
            const format = FORMATTERS[row.format]
            const differs = rowDiffers(vehicles, row.key)

            return (
              <tr key={row.key} className="even:bg-slate-50/60">
                <th
                  scope="row"
                  className={cn(
                    CELL,
                    // Opaque, not transparent: a sticky cell lets the columns
                    // scroll underneath it, and `even:bg-slate-50/60` would let
                    // them show through.
                    differs ? 'bg-amber-50/70' : 'bg-white',
                    'sticky left-0 z-10 border-b border-slate-100 text-left font-medium text-slate-600',
                  )}
                >
                  {row.label}
                  {differs && (
                    <span className="ml-2 rounded bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-900 uppercase">
                      Differs
                    </span>
                  )}
                </th>

                {vehicles.map((vehicle) => {
                  const value = vehicle[row.key]
                  const shown =
                    value == null || value === ''
                      ? '—'
                      : format
                        ? format(value)
                        : value

                  return (
                    <td
                      key={vehicle.id}
                      className={cn(
                        CELL,
                        'border-b border-l border-slate-100 text-slate-900',
                        differs && 'font-semibold',
                      )}
                    >
                      {shown}
                    </td>
                  )
                })}
              </tr>
            )
          })}

          <tr>
            <th
              scope="row"
              className={cn(
                CELL,
                'sticky left-0 z-10 border-b border-slate-100 bg-white text-left align-top font-medium text-slate-600',
              )}
            >
              {FEATURES_ROW_LABEL}
              {hiddenFeatureCount > 0 && (
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  {hiddenFeatureCount} shared hidden
                </span>
              )}            </th>

            {/* One cell per vehicle holding that vehicle's slice of the matrix,
                so each column reads as a checklist rather than the table
                reading as a grid of ticks with no owner. */}
            {vehicles.map((vehicle, column) => (
              <td
                key={vehicle.id}
                className={cn(
                  CELL,
                  'border-b border-l border-slate-100 align-top',
                )}
              >
                {featureRows.length === 0 ? (
                  <p className="text-slate-400">Identical</p>
                ) : (
                  <ul className="space-y-1.5">
                    {featureRows.map((row) => (
                      <li key={row.feature} className="flex items-start gap-2">
                        {row.present[column] ? (
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-emerald-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <Minus
                            className="mt-0.5 size-4 shrink-0 text-slate-300"
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={cn(
                            row.present[column]
                              ? 'text-slate-700'
                              : 'text-slate-400',
                          )}
                        >
                          {row.feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            ))}
          </tr>

          {/* The way out of the table. Comparing cars is a step towards buying
              one, and a comparison with no route to a conversation is a dead
              end. */}
          <tr>
            <th
              scope="row"
              className="sticky left-0 z-10 bg-white px-4 py-4 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Next
            </th>

            {vehicles.map((vehicle) => (
              <td
                key={vehicle.id}
                className="border-l border-slate-100 px-4 py-4"
              >
                <Link
                  to={`/used-cars/${vehicle.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
                >
                  View this {vehicle.bodyType}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
