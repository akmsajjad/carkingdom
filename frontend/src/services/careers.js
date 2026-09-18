import { JOBS } from '../data/careers'
import { ApiError, mockRequest } from './mock'

/**
 * The careers API.
 *
 * Same contract as `services.js` and `vehicles.js`: each export has the
 * signature the REST endpoint would have and returns plain JSON-shaped data,
 * so moving to Django means replacing each body with the matching
 * `api.get(...)` and deleting the helper. No component changes.
 */

/**
 * Newest posting first.
 *
 * Deliberately not alphabetical and not by department: a careers page is the
 * one place on this site where recency is the whole ordering, because a
 * candidate's first question is whether the job is still open.
 */
function byNewestFirst(a, b) {
  return String(b.postedDate).localeCompare(String(a.postedDate))
}

/** GET /api/jobs/ */
export async function getJobs() {
  return mockRequest(() => [...JOBS].sort(byNewestFirst))
}

/** GET /api/jobs/:slug/ */
export async function getJobBySlug(slug) {
  return mockRequest(() => {
    const job = JOBS.find((item) => item.slug === slug)
    if (!job) {
      throw new ApiError(`No job found for "${slug}".`, 404)
    }
    return job
  })
}

/**
 * GET /api/jobs/:slug/related/
 *
 * Other openings, same department first. Someone reading the service advisor
 * posting is more likely to want the technician posting than the detailer one,
 * but once the department is exhausted anything open beats an empty strip —
 * the useful thing to tell a candidate is that we are hiring at all.
 */
export async function getRelatedJobs(slug, limit = 3) {
  return mockRequest(() => {
    const job = JOBS.find((item) => item.slug === slug)

    return JOBS.filter((item) => item.slug !== slug)
      .sort((a, b) => {
        const aSame = a.department === job?.department ? 0 : 1
        const bSame = b.department === job?.department ? 0 : 1
        if (aSame !== bSame) return aSame - bSame
        return byNewestFirst(a, b)
      })
      .slice(0, limit)
  })
}
