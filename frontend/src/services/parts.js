import {
  PARTS,
  PART_BRANDS,
  PART_CATEGORIES,
  PRICE_BOUNDS,
  FITMENT_MAKES,
  modelsForMake,
  yearsForVehicle,
} from '../data/parts'
import { ApiError, mockRequest } from './mock'

/**
 * The parts API.
 *
 * Same contract as `services/vehicles.js`: every export has the signature a REST
 * endpoint would have and returns a plain JSON-shaped object, so swapping in
 * Django means replacing each body with the matching `api.get(...)` call and
 * deleting the helpers. No component changes.
 */

export const DEFAULT_PAGE_SIZE = 9

/** Fields a free-text search should look at. */
function searchableText(part) {
  return [
    part.name,
    part.brand,
    part.category,
    part.sku,
    part.description,
    ...(part.specs ?? []).map((spec) => `${spec.label} ${spec.value}`),
  ]
    .join(' ')
    .toLowerCase()
}

/** Normalises a possibly-single, possibly-array filter value to an array. */
function asArray(value) {
  if (value == null || value === '') return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

/** Case-insensitive equality, for values that arrived off a URL. */
function sameFold(a, b) {
  return String(a).toLowerCase() === String(b).toLowerCase()
}

function matches(part, filters) {
  const { q, brand, category, minPrice, maxPrice, minRating, inStock, onSale, universal } =
    filters

  if (q && !searchableText(part).includes(String(q).toLowerCase().trim())) {
    return false
  }

  const brands = asArray(brand)
  if (brands.length && !brands.some((value) => sameFold(value, part.brand))) {
    return false
  }

  // Folded rather than compared exactly: the category values travel in URLs —
  // `?category=Fluids %26 Chemicals`, copied out of the footer and pasted
  // around by hand — and a query string is exactly where a stray capital or a
  // re-encoded space shows up. A customer who clicked "Brakes" meant brakes.
  const categories = asArray(category)
  if (categories.length && !categories.some((value) => sameFold(value, part.category))) {
    return false
  }

  if (minPrice != null && part.effectivePrice < Number(minPrice)) return false
  if (maxPrice != null && part.effectivePrice > Number(maxPrice)) return false
  if (minRating != null && part.rating < Number(minRating)) return false

  // Flags arrive as `true`, `'true'` or `false` depending on whether they came
  // from `useUrlFilters` or a hand-written link, so a boolean flag only ever
  // excludes when it is genuinely on.
  if ((inStock === true || inStock === 'true') && !part.inStock) return false
  if ((onSale === true || onSale === 'true') && part.salePrice == null) return false
  if ((universal === true || universal === 'true') && !part.universal) return false

  return true
}

const COMPARATORS = {
  newest: (a, b) => b.dateAdded.localeCompare(a.dateAdded),
  'price-asc': (a, b) => a.effectivePrice - b.effectivePrice,
  'price-desc': (a, b) => b.effectivePrice - a.effectivePrice,
  'rating-desc': (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
}

function sortParts(list, sort) {
  const comparator = COMPARATORS[sort] ?? COMPARATORS.newest
  return [...list].sort(comparator)
}

/** Counts for the filter sidebar, computed against the whole catalogue. */
function buildFacets(base) {
  const countBy = (key) => {
    const counts = {}
    for (const part of base) {
      counts[part[key]] = (counts[part[key]] ?? 0) + 1
    }
    return counts
  }

  return {
    brand: countBy('brand'),
    category: countBy('category'),
  }
}

/**
 * GET /api/parts/
 * @returns {{ results, total, page, pageSize, totalPages, facets }}
 */
export async function getParts(params = {}) {
  return mockRequest(() => {
    const page = Math.max(1, Number(params.page) || 1)
    const pageSize = Math.max(1, Number(params.pageSize) || DEFAULT_PAGE_SIZE)

    const filtered = PARTS.filter((part) => matches(part, params))
    const sorted = sortParts(filtered, params.sort)

    const total = sorted.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize

    return {
      results: sorted.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
      facets: buildFacets(PARTS),
    }
  })
}

/** GET /api/parts/:slug/ */
export async function getPartBySlug(slug) {
  return mockRequest(() => {
    const part = PARTS.find((item) => item.slug === slug)
    if (!part) {
      throw new ApiError(`No part found for "${slug}".`, 404)
    }
    return part
  })
}

/** GET /api/parts/featured/ */
export async function getFeaturedParts(limit = 4) {
  return mockRequest(() =>
    PARTS.filter((part) => part.featured && part.inStock)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit),
  )
}

/**
 * GET /api/parts/:slug/related/
 *
 * Ranks by category first, then by brand — the two things a counter clerk asks
 * about when the exact part is out of stock: "what else fits" and "do you have
 * the other brand". Rating breaks the tie, so the better-reviewed alternative
 * is offered first rather than whichever happened to be listed first.
 */
export async function getRelatedParts(slug, limit = 4) {
  return mockRequest(() => {
    const source = PARTS.find((item) => item.slug === slug)
    if (!source) return []

    return PARTS.filter((part) => part.slug !== slug && part.inStock)
      .map((part) => ({
        part,
        score:
          (part.category === source.category ? 2 : 0) +
          (part.brand === source.brand ? 1 : 0),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.part.rating - a.part.rating)
      .slice(0, limit)
      .map((entry) => entry.part)
  })
}

/** GET /api/parts/filters/ — the option lists the sidebar renders. */
export async function getPartFilterOptions() {
  return mockRequest(
    () => ({
      brands: PART_BRANDS,
      categories: PART_CATEGORIES,
      priceBounds: PRICE_BOUNDS,
      // Offered as a picker rather than a slider: customers think in half
      // stars ("at least four"), and the steps are coarse enough that a
      // continuous control would be more precision than the data has.
      ratings: [4.5, 4, 3.5, 3],
    }),
    { delay: 120 },
  )
}

/** GET /api/parts/fitment/ — the makes the fitment checker can ask about. */
export async function getFitmentMakes() {
  return mockRequest(() => FITMENT_MAKES, { delay: 120 })
}

/** GET /api/parts/fitment/:make/ */
export async function getFitmentModels(make) {
  return mockRequest(() => modelsForMake(make), { delay: 120 })
}

/** GET /api/parts/fitment/:make/:model/ */
export async function getFitmentYears(make, model) {
  return mockRequest(() => yearsForVehicle(make, model), { delay: 120 })
}

/**
 * GET /api/parts/:slug/fitment/?make=&model=&year=
 *
 * The whole point of the checker, and the reason it is server-shaped rather
 * than a filter over `part.applications` in the component: whether a part fits
 * is a question about the fitment catalogue, not about the part object in
 * front of you. A universal part is `fits: true` with a caveat rather than a
 * bare yes — "universal" describes the part, not the customer's car, and a
 * wiper blade sold as universal still comes in lengths.
 */
export async function checkFitment(slug, { make, model, year } = {}) {
  return mockRequest(
    () => {
      const part = PARTS.find((item) => item.slug === slug)
      if (!part) {
        throw new ApiError(`No part found for "${slug}".`, 404)
      }

      if (part.universal) {
        return {
          fits: true,
          universal: true,
          message: `${part.name} is a universal part and is not tied to a specific vehicle.`,
        }
      }

      const applications = part.applications ?? []
      const exact = applications.find(
        (application) =>
          application.make === make &&
          application.model === model &&
          Number(year) >= application.yearFrom &&
          Number(year) <= application.yearTo,
      )

      if (exact) {
        return {
          fits: true,
          universal: false,
          message: `Fits your ${year} ${make} ${model} (${exact.yearFrom}–${exact.yearTo}).`,
        }
      }

      const sameVehicle = applications.find(
        (application) =>
          application.make === make && application.model === model,
      )

      if (sameVehicle) {
        return {
          fits: false,
          universal: false,
          message: `This part fits the ${make} ${model} from ${sameVehicle.yearFrom} to ${sameVehicle.yearTo} — not the ${year}.`,
        }
      }

      // The near-miss case, and the one worth naming: the part is listed for
      // this make but not this model, so the answer is "probably not, but ask"
      // rather than a flat no.
      const sameMake = applications.find(
        (application) => application.make === make,
      )

      if (sameMake) {
        return {
          fits: false,
          universal: false,
          message: `We list this part for other ${make} models but not the ${model}. Call us and we will confirm against your VIN.`,
        }
      }

      return {
        fits: false,
        universal: false,
        message: `This part is not listed for the ${make} ${model}. Call us with your VIN and we will find the right one.`,
      }
    },
    { delay: 420 },
  )
}

/** GET /api/parts/stats/ — headline numbers for the parts counter panel. */
export async function getPartsStats() {
  return mockRequest(
    () => ({
      total: PARTS.length,
      brands: PART_BRANDS.length,
      categories: PART_CATEGORIES.length,
      inStock: PARTS.filter((part) => part.inStock).length,
    }),
    { delay: 120 },
  )
}
