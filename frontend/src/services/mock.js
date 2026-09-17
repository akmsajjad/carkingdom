/**
 * Gives the mock data layer the shape of a network call.
 *
 * Every service module wraps its body in `mockRequest`, so callers already
 * await a promise, already handle rejection, and already see a loading state.
 * Replacing the mock with Django is then a change to the function body only —
 * the components never learn that anything happened.
 */

const DEFAULT_DELAY = 320

/**
 * Simulated failure rate, 0–1. Off by default.
 *
 * Exists so the error states are reachable and reviewable rather than
 * theoretical. In the browser console:
 *
 *     await import('/src/services/mock.js').then(m => m.setMockFailureRate(1))
 */
let failureRate = 0

export function setMockFailureRate(rate) {
  failureRate = Math.min(Math.max(rate, 0), 1)
}

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Runs `produce` after a delay and resolves with a deep copy of the result.
 *
 * The copy matters: the data modules are module-level singletons, so handing
 * out references would let one component's edit leak into every other view.
 */
export function mockRequest(produce, { delay = DEFAULT_DELAY } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failureRate > 0 && Math.random() < failureRate) {
        reject(new ApiError('The request could not be completed.', 503))
        return
      }

      try {
        resolve(structuredClone(produce()))
      } catch (error) {
        reject(error)
      }
    }, delay)
  })
}
