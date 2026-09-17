import useUrlFilters from './useUrlFilters'
import { SORT_OPTIONS } from '../data/parts'

/**
 * The parts catalogue's filter configuration.
 *
 * Everything here is data. The parsing, URL writing, chip building and counts
 * live in `useUrlFilters`, which the vehicle marketplace uses too — this file
 * exists only to say which filters a part has, which is the one thing that
 * genuinely differs between the two catalogues.
 *
 * The `key`s are the query-parameter names, so they are also the names the
 * Django endpoint will receive, and the names the footer's category links
 * already use (`/parts?category=Brakes`).
 */
export const FILTER_FIELDS = [
  { key: 'q', type: 'text', label: 'Search' },
  { key: 'category', type: 'array', label: 'Category' },
  { key: 'brand', type: 'array', label: 'Brand' },
  { key: 'minPrice', type: 'number', label: 'Min price', format: 'price' },
  { key: 'maxPrice', type: 'number', label: 'Max price', format: 'price' },
  { key: 'minRating', type: 'number', label: 'Rating', format: 'rating' },
  { key: 'inStock', type: 'flag', label: 'In stock only' },
  { key: 'onSale', type: 'flag', label: 'On sale' },
  { key: 'universal', type: 'flag', label: 'Universal fit' },
]

export const DEFAULT_SORT = 'newest'
export const DEFAULT_VIEW = 'grid'

const VIEWS = ['grid', 'list']

const CONFIG = {
  fields: FILTER_FIELDS,
  sortOptions: SORT_OPTIONS,
  defaultSort: DEFAULT_SORT,
  views: VIEWS,
  defaultView: DEFAULT_VIEW,
}

export default function usePartFilters() {
  return useUrlFilters(CONFIG)
}
