import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Filter state held in the URL, for any catalogue.
 *
 * The URL is the source of truth rather than component state, which buys three
 * things for free: filters survive a refresh, a filtered result can be shared
 * or bookmarked, and the browser's back button undoes a filter change. It also
 * means a footer link like `/parts?category=Brakes` just works.
 *
 * This is the machinery only — parsing, updating, counting, clearing. Which
 * filters exist is the caller's business, passed in as `fields`, so the vehicle
 * marketplace and the parts catalogue share one implementation instead of two
 * that drift. The two differ in their field lists and their sort options and in
 * nothing else, and that difference is data.
 *
 * A field is described once:
 *
 *   { key: 'category', type: 'array', label: 'Category' }
 *
 * `type` decides the URL encoding:
 *   array  — repeated params (`?brand=Bosch&brand=ACDelco`) rather than a
 *            joined string, so a value containing a comma cannot corrupt the
 *            list
 *   number — a numeric bound, absent rather than zero when unset
 *   flag   — present or absent, no value
 *   text   — a free-text param
 *
 * `format` names how a chip renders the value ('price', 'mileage'), not how it
 * is stored. Parsing out of the URL, counting the active filters, clearing
 * them, and labelling the removable chips all read this same table, so adding a
 * filter is one line here rather than four edits in four places.
 */

/** The subset of `filters` actually narrowing the results. */
export function countActiveFilters(fields, filters) {
  let count = 0

  for (const { key, type } of fields) {
    if (type === 'array') count += filters[key].length
    else if (type === 'number') count += filters[key] != null ? 1 : 0
    else if (type === 'flag') count += filters[key] ? 1 : 0
    else if (filters[key]) count += 1
  }

  return count
}

function groupByType(fields) {
  const groups = { array: [], number: [], flag: [], text: [] }
  for (const field of fields) groups[field.type]?.push(field)
  return groups
}

function parse(searchParams, groups, { sortValues, defaultSort, viewValues, defaultView }) {
  const filters = {}

  for (const { key } of groups.array) {
    filters[key] = searchParams.getAll(key).filter(Boolean)
  }

  for (const { key } of groups.number) {
    const raw = searchParams.get(key)
    filters[key] = raw === null || raw === '' ? null : Number(raw)
  }

  for (const { key } of groups.flag) {
    filters[key] = searchParams.get(key) === 'true'
  }

  for (const { key } of groups.text) {
    filters[key] = searchParams.get(key) ?? ''
  }

  // Sort and view are presentation rather than filtering, so they are not in
  // `fields` and do not count towards "3 filters active". They are still read
  // from the URL and validated on the way in: an unrecognised `?sort=` would
  // otherwise fall through to the comparator's default while the select
  // rendered blank, showing one order and applying another.
  const sort = searchParams.get('sort')
  const view = searchParams.get('view')

  filters.sort = sortValues.has(sort) ? sort : defaultSort
  filters.view = viewValues.has(view) ? view : defaultView
  filters.page = Math.max(1, Number(searchParams.get('page')) || 1)

  return filters
}

export default function useUrlFilters({
  fields = [],
  sortOptions = [],
  defaultSort = '',
  views = [],
  defaultView = '',
} = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const config = useMemo(
    () => ({
      sortValues: new Set(sortOptions.map((option) => option.value)),
      defaultSort,
      viewValues: new Set(views),
      defaultView,
    }),
    [sortOptions, defaultSort, views, defaultView],
  )

  const groups = useMemo(() => groupByType(fields), [fields])

  const filters = useMemo(
    () => parse(searchParams, groups, config),
    [searchParams, groups, config],
  )

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
      for (const { key } of fields) next.delete(key)
      next.delete('page')
    })
  }, [update, fields])

  const activeCount = useMemo(
    () => countActiveFilters(fields, filters),
    [fields, filters],
  )

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
    fields,
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
