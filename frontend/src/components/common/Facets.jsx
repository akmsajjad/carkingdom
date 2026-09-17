import { useId } from 'react'
import Checkbox from './Checkbox'
import Input from './Input'

/**
 * One group of facet checkboxes, and the single checkbox that needs a unique
 * id — both shared by the vehicle marketplace and the parts catalogue.
 *
 * The ids come from `useId` rather than from the facet value, because each of
 * these panels is rendered twice: once in the desktop column, once in the
 * mobile drawer. A literal id like `filter-make-Toyota` would then exist twice
 * in the document, and `htmlFor` resolves to the first match — so the drawer's
 * label would silently operate the hidden desktop input.
 */

export default function FacetList({ group, options, selected, counts, onToggle }) {
  const uid = useId()

  if (!options?.length) return null

  return (
    <>
      {options.map((value) => (
        <Checkbox
          key={value}
          id={`${uid}-${group}-${value}`}
          checked={selected.includes(value)}
          onChange={() => onToggle(group, value)}
          label={
            <span className="flex flex-1 items-center justify-between gap-2">
              <span>{value}</span>
              {counts?.[value] != null && (
                <span className="text-xs text-slate-400 tabular-nums">
                  {counts[value]}
                </span>
              )}
            </span>
          }
        />
      ))}
    </>
  )
}

/** A standalone checkbox that owns its own id, for the flags that are not part
 *  of a facet group ("Featured only", "In stock only"). */
export function LoneCheckbox({ checked, onChange, label }) {
  const id = useId()

  return <Checkbox id={id} checked={checked} onChange={onChange} label={label} />
}

/**
 * A paired min/max numeric range.
 *
 * Controlled straight from the URL — the mock service answers instantly, and
 * `useAsync` discards a superseded response, so typing "15000" costs a few
 * abandoned timers rather than a stale render.
 */
export function RangeInputs({
  minKey,
  maxKey,
  minLabel,
  maxLabel,
  filters,
  onSetFilter,
  bounds,
  step,
  format = (value) => value,
  hint,
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={bounds?.min ?? 0}
          max={bounds?.max}
          step={step}
          placeholder="Min"
          aria-label={minLabel}
          value={filters[minKey] ?? ''}
          onChange={(event) => onSetFilter(minKey, event.target.value)}
        />
        <span aria-hidden="true" className="text-slate-400">
          –
        </span>
        <Input
          type="number"
          inputMode="numeric"
          min={bounds?.min ?? 0}
          max={bounds?.max}
          step={step}
          placeholder="Max"
          aria-label={maxLabel}
          value={filters[maxKey] ?? ''}
          onChange={(event) => onSetFilter(maxKey, event.target.value)}
        />
      </div>
      {bounds && (
        <p className="text-xs text-slate-400">
          {hint
            ? hint(format(bounds.min), format(bounds.max))
            : `Ranges from ${format(bounds.min)} to ${format(bounds.max)}`}
        </p>
      )}
    </>
  )
}
