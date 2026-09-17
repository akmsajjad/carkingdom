import { SERVICES } from '../data/services'
import { ApiError, mockRequest } from './mock'

/**
 * The service-department API.
 *
 * Same contract as `vehicles.js`: each export has the signature a REST endpoint
 * would have and returns plain JSON-shaped data, so moving to Django means
 * replacing each body with the matching `api.get(...)` and deleting the
 * helpers. No component changes.
 */

/** GET /api/services/ */
export async function getServices() {
  return mockRequest(() => SERVICES)
}

/** GET /api/services/:slug/ */
export async function getServiceBySlug(slug) {
  return mockRequest(() => {
    const service = SERVICES.find((item) => item.slug === slug)
    if (!service) {
      throw new ApiError(`No service found for "${slug}".`, 404)
    }
    return service
  })
}

/**
 * GET /api/services/:slug/related/
 *
 * Everything else in the catalogue, cheapest first — a customer reading about
 * brakes is usually deciding what else to have done while the car is on the
 * hoist, so the useful ordering is by price rather than by similarity.
 */
export async function getRelatedServices(slug, limit = 3) {
  return mockRequest(() =>
    SERVICES.filter((service) => service.slug !== slug)
      .sort((a, b) => a.startingPrice - b.startingPrice)
      .slice(0, limit),
  )
}
