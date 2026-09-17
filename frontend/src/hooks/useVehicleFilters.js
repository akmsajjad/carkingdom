import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SORT_OPTIONS } from '../data/vehicles'

/**
 * Vehicle filters, stored in the URL.
 *
 * The URL is the source of truth rather than component state, which buys three
 * things for free: filters survive a refresh, a filtered result can be shared
 * or bookmarked, and the browser's back button undoes a filter change. It also
 * means a footer link like `/used-cars?condition=New` just works.
 */

/**
 * Every filter the marketplace understands, described once.
 *
 * Parsing out of the URL, counting the active filters, clearing them, and
 * labelling the removable chips all read this table. Adding a filter is
 * therefore a single line here rather than four edits in four places — the way
 * a filter half-wired into one of those lists used to go wrong.
 *
 * `type` decides the URL encoding:
 *   array  — repeated params (`?make=Toyota&make=Honda`) rather than a joined
 *            string, so a value containing a comma cannot corrupt the list
 *   number — a numeric bound, absent rather than zero when unset
 *   flag   — present or absent, no value
 *   text   — a free-text param
 *
 * `format` is how the chip renders the value, not how it is stored.
 */
export const FILTER_FIELDS = [
  { key: 'q', type: 'text', label: 'Search' },
  { key: 'make', type: 'array', label: 'Make' },
  { key: 'bodyType', type: 'array', label: 'Body type' },
  { key: 'condition', type: 'array', label: 'Condition' },
  { key: 'transmission', type: 'array', label: 'Transmission' },
  { key: 'fuelType', type: 'array', label: 'Fuel type' },
  { key: 'drivetrain', type: 'array', label: 'Drivetrain' },
  { key: 'minPrice', type: 'number', label: 'Min price', format: 'price' },
  { key: 'maxPrice', type: 'number', label: 'Max price', format: 'price' },
  { key: 'minYear', type: 'number', label: 'From year' },
  { key: 'maxYear', type: 'number', label: 'To year' },
  { key: 'maxMileage', type: 'number', label: 'Max mileage', format: 'mileage' },
  { key: 'featured', type: 'flag', label: 'Featured only' },
]

/** Sort and view are presentation, not filtering, so they stay out of the
 *  table above — they must not count towards "3 filters active". They are still
 *  read from the URL and validated on the way in: an unrecognised `?sort=` would
 *  otherwise fall through to the comparator's default while the select rendered
 *  blank, showing one order and applying another. */
export const DEFAULT_SORT = 'newest'
export const DEFAULT_VIEW = 'grid'

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value))
const VIEW_VALUES = new Set(['grid', 'list'])

const FIELDS_BY_TYPE = {
  array: FILTER_FIELDS.filter((field) => field.type === 'array'),
  number: FILTER_FIELDS.filter((field) => field.type === 'number'),
  flag: FILTER_FIELDS.filter((field) => field.type === 'flag'),
  text: FILTER_FIELDS.filter((field) => field.type === 'text'),
}

function parse(searchParams) {
  const filters = {}

  for (const { key } of FIELDS_BY_TYPE.array) {
    filters[key] = searchParams.getAll(key).filter(Boolean)
  }

  for (const { key } of FIELDS_BY_TYPE.number) {
    const raw = searchParams.get(key)
    filters[key] = raw === null || raw === '' ? null : Number(raw)
  }

  for (const { key } of FIELDS_BY_TYPE.flag) {
    filters[key] = searchParams.get(key) === 'true'
  }

  for (const { key } of FIELDS_BY_TYPE.text) {
    filters[key] = searchParams.get(key) ?? ''
  }

  const sort = searchParams.get('sort')
  const view = searchParams.get('view')

  filters.sort = SORT_VALUES.has(sort) ? sort : DEFAULT_SORT
  filters.view = VIEW_VALUES.has(view) ? view : DEFAULT_VIEW
  filters.page = Math.max(1, Number(searchParams.get('page')) || 1)

  return filters
}

/** The subset of filters actually narrowing the results. */
export function countActiveFilters(filters) {
  let count = 0
  for (const { key, type } of FILTER_FIELDS) {
    if (type === 'array') count += filters[key].length
    else if (type === 'number') count += filters[key] != null ? 1 : 0
    else if (type === 'flag') count += filters[key] ? 1 : 0
    else if (filters[key]) count += 1
  }
  return count
}

export default function useVehicleFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => parse(searchParams), [searchParams])

  /**
   * Applies a change and resets to page 1. Changing a filter while on page 4
   * should show the first page of the new result, not an empty page 4.
   */
  const update = useCallback(
    (mutate, { keepPage = false } = {}) => {
      const next = new URLSearchParams(searchParams)
      mutate(next)
      if (!keepPage) next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const setFilter = useCallback(
    (key, value) => {
      update((next) => {
        if (value == null || value === '' || value === false) next.delete(key)
        else next.set(key, String(value))
      })
    },
    [update],
  )

  const toggleArrayFilter = useCallback(
    (key, value) => {
      update((next) => {
        const current = next.getAll(key)
        next.delete(key)
        const remaining = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value]
        remaining.forEach((item) => next.append(key, item))
      })
    },
    [update],
  )

  const setPage = useCallback(
    (page) => {
      update(
        (next) => {
          if (page <= 1) next.delete('page')
          else next.set('page', String(page))
        },
        { keepPage: true },
      )
    },
    [update],
  )

  const clearAll = useCallback(() => {
    update((next) => {
      for (const { key } of FILTER_FIELDS) next.delete(key)
      next.delete('page')
    })
  }, [update])

  const activeCount = useMemo(() => countActiveFilters(filters), [filters])

  /**
   * A stable string for `useAsync`'s key, built from the filter values rather
   * than the searchParams object, so a re-render with an identical query does
   * not refetch. `view` is excluded: switching between grid and list changes
   * nothing about the data, and refetching for it would flash a skeleton.
   */
  const requestKey = useMemo(() => {
    const { view, ...requested } = filters
    void view
    return JSON.stringify(requested)
  }, [filters])

  return {
    filters,
    requestKey,
    activeCount,
    hasFilters: activeCount > 0,
    setFilter,
    toggleArrayFilter,
    setPage,
    clearAll,
  }
}
