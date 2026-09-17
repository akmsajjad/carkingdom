import { SORT_OPTIONS } from '../data/vehicles'
import useUrlFilters from './useUrlFilters'

/**
 * The vehicle marketplace's filters.
 *
 * Everything mechanical — parsing the URL, updating it, counting what is
 * active, clearing — lives in `useUrlFilters`. What is left here is the part
 * that is actually about vehicles: which filters exist and how they sort. The
 * parts catalogue declares the same two things against the same hook, so a fix
 * to the shared machinery lands in both.
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

export const DEFAULT_SORT = 'newest'
export const DEFAULT_VIEW = 'grid'

const VIEWS = ['grid', 'list']

// Module-level so the hook's `useMemo`s on it are stable across renders.
const CONFIG = {
  fields: FILTER_FIELDS,
  sortOptions: SORT_OPTIONS,
  defaultSort: DEFAULT_SORT,
  views: VIEWS,
  defaultView: DEFAULT_VIEW,
}

export default function useVehicleFilters() {
  return useUrlFilters(CONFIG)
}
