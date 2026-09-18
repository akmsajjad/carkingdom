import {
  VEHICLES,
  MAKES,
  BODY_TYPES,
  CONDITIONS,
  TRANSMISSIONS,
  FUEL_TYPES,
  DRIVETRAINS,
  PRICE_BOUNDS,
  YEAR_BOUNDS,
} from '../data/vehicles'
import { ApiError, mockRequest } from './mock'

/**
 * The vehicle API.
 *
 * Every export here has the signature a REST endpoint would have, and each one
 * returns a plain JSON-shaped object. To move to Django, replace the body of
 * each function with the matching `api.get(...)` call and delete the helpers —
 * no component changes.
 */

export const DEFAULT_PAGE_SIZE = 9

/** Fields a free-text search should look at. */
function searchableText(vehicle) {
  return [
    vehicle.title,
    vehicle.make,
    vehicle.model,
    vehicle.trim,
    vehicle.bodyType,
    vehicle.exteriorColor,
    vehicle.stockNumber,
    vehicle.condition,
  ]
    .join(' ')
    .toLowerCase()
}

/** Normalises a possibly-single, possibly-array filter value to an array. */
function asArray(value) {
  if (value == null || value === '') return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function matches(vehicle, filters) {
  const {
    q,
    make,
    bodyType,
    condition,
    transmission,
    fuelType,
    drivetrain,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
    featured,
    status,
  } = filters

  if (q && !searchableText(vehicle).includes(String(q).toLowerCase().trim())) {
    return false
  }

  const makes = asArray(make)
  if (makes.length && !makes.includes(vehicle.make)) return false

  const bodyTypes = asArray(bodyType)
  if (bodyTypes.length && !bodyTypes.includes(vehicle.bodyType)) return false

  const conditions = asArray(condition)
  if (conditions.length && !conditions.includes(vehicle.condition)) return false

  const transmissions = asArray(transmission)
  if (transmissions.length && !transmissions.includes(vehicle.transmission)) {
    return false
  }

  const fuelTypes = asArray(fuelType)
  if (fuelTypes.length && !fuelTypes.includes(vehicle.fuelType)) return false

  const drivetrains = asArray(drivetrain)
  if (drivetrains.length && !drivetrains.includes(vehicle.drivetrain)) {
    return false
  }

  if (minPrice != null && vehicle.effectivePrice < Number(minPrice)) return false
  if (maxPrice != null && vehicle.effectivePrice > Number(maxPrice)) return false
  if (minYear != null && vehicle.year < Number(minYear)) return false
  if (maxYear != null && vehicle.year > Number(maxYear)) return false
  if (maxMileage != null && vehicle.mileage > Number(maxMileage)) return false
  if (featured === true || featured === 'true') return vehicle.featured === true
  if (status && vehicle.status !== status) return false

  return true
}

const COMPARATORS = {
  newest: (a, b) => b.dateAdded.localeCompare(a.dateAdded),
  'price-asc': (a, b) => a.effectivePrice - b.effectivePrice,
  'price-desc': (a, b) => b.effectivePrice - a.effectivePrice,
  'year-desc': (a, b) => b.year - a.year || a.mileage - b.mileage,
  'mileage-asc': (a, b) => a.mileage - b.mileage,
}

function sortVehicles(list, sort) {
  const comparator = COMPARATORS[sort] ?? COMPARATORS.newest
  // `toSorted` would mutate nothing, but the list is already a fresh copy, and
  // sorting in place avoids a second allocation on every keystroke.
  return [...list].sort(comparator)
}

/** Counts for the filter sidebar, computed against everything except the
 *  filter being counted — so a facet never shows zero for its own selection. */
function buildFacets(base) {
  const countBy = (key) => {
    const counts = {}
    for (const vehicle of base) {
      counts[vehicle[key]] = (counts[vehicle[key]] ?? 0) + 1
    }
    return counts
  }

  return {
    make: countBy('make'),
    bodyType: countBy('bodyType'),
    condition: countBy('condition'),
    transmission: countBy('transmission'),
    fuelType: countBy('fuelType'),
    drivetrain: countBy('drivetrain'),
  }
}

/**
 * GET /api/vehicles/
 * @returns {{ results, total, page, pageSize, totalPages, facets }}
 */
export async function getVehicles(params = {}) {
  return mockRequest(() => {
    const page = Math.max(1, Number(params.page) || 1)
    const pageSize = Math.max(1, Number(params.pageSize) || DEFAULT_PAGE_SIZE)

    const filtered = VEHICLES.filter((vehicle) => matches(vehicle, params))
    const sorted = sortVehicles(filtered, params.sort)

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
      facets: buildFacets(VEHICLES),
    }
  })
}

/** GET /api/vehicles/:slug/ */
export async function getVehicleBySlug(slug) {
  return mockRequest(() => {
    const vehicle = VEHICLES.find((item) => item.slug === slug)
    if (!vehicle) {
      throw new ApiError(`No vehicle found for "${slug}".`, 404)
    }
    return vehicle
  })
}

/** GET /api/vehicles/featured/ */
export async function getFeaturedVehicles(limit = 6) {
  return mockRequest(() =>
    VEHICLES.filter((vehicle) => vehicle.featured && vehicle.status !== 'sold')
      .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
      .slice(0, limit),
  )
}

/**
 * GET /api/vehicles/?ids=ck-1001,ck-1004
 *
 * The saved list and the comparison both store ids, so both need to turn those
 * ids back into vehicles. Returns them in the order the ids were given, because
 * that order is the order the customer added them — a comparison table whose
 * columns reshuffle between visits would be worse than useless.
 *
 * An id with no vehicle behind it is dropped rather than returned as a hole.
 * That happens for real once the inventory is a live database: a car sells and
 * leaves the lot while somebody still has it saved. The caller can see the
 * shortfall and tidy up its own storage, which beats rendering a blank column.
 */
export async function getVehiclesByIds(ids = []) {
  const wanted = asArray(ids)
  if (wanted.length === 0) return []

  return mockRequest(() => {
    const byId = new Map(VEHICLES.map((vehicle) => [vehicle.id, vehicle]))
    return wanted.map((id) => byId.get(id)).filter(Boolean)
  })
}

/**
 * GET /api/vehicles/:slug/similar/
 * Ranks by shared body type, then by how close the price is — the same
 * judgement a salesperson makes when suggesting an alternative.
 */
export async function getSimilarVehicles(slug, limit = 3) {
  return mockRequest(() => {
    const source = VEHICLES.find((item) => item.slug === slug)
    if (!source) return []

    return VEHICLES.filter(
      (vehicle) =>
        vehicle.slug !== slug &&
        vehicle.status === 'available' &&
        vehicle.bodyType === source.bodyType,
    )
      .map((vehicle) => ({
        vehicle,
        distance: Math.abs(vehicle.effectivePrice - source.effectivePrice),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map((entry) => entry.vehicle)
  })
}

/** GET /api/vehicles/filters/ — the option lists the sidebar renders. */
export async function getVehicleFilterOptions() {
  return mockRequest(
    () => ({
      makes: MAKES,
      bodyTypes: BODY_TYPES,
      conditions: CONDITIONS,
      transmissions: TRANSMISSIONS,
      fuelTypes: FUEL_TYPES,
      drivetrains: DRIVETRAINS,
      priceBounds: PRICE_BOUNDS,
      yearBounds: YEAR_BOUNDS,
    }),
    { delay: 120 },
  )
}

/** GET /api/vehicles/stats/ — headline numbers for the homepage. */
export async function getInventoryStats() {
  return mockRequest(
    () => ({
      total: VEHICLES.length,
      makes: MAKES.length,
      available: VEHICLES.filter((v) => v.status === 'available').length,
      lowestPrice: PRICE_BOUNDS.min,
    }),
    { delay: 120 },
  )
}
