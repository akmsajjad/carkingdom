import { mockRequest } from './mock'

/**
 * Lead capture: vehicle enquiries, test drive bookings, finance requests and
 * service appointments.
 *
 * These endpoints accept a payload and return a receipt. **They do not deliver
 * anything.** There is no mail server, no CRM and no stored record — §1 keeps
 * this build frontend-only. Wiring them up is a Django endpoint plus an email
 * backend, at which point each function body below becomes one `api.post(...)`
 * call and no component changes.
 *
 * The components therefore treat them as real: they await, they can fail, and
 * they surface the failure. Only the success copy is written for a world where
 * the backend exists — which is the world this is being built for.
 */

/** Longer than a read: a form submission is meant to feel like it left. */
const SUBMIT_DELAY = 750

function receipt(payload) {
  return {
    ok: true,
    submittedAt: new Date().toISOString(),
    ...payload,
  }
}

/** POST /api/leads/enquiry/ */
export async function submitVehicleEnquiry({ vehicleId, ...fields }) {
  return mockRequest(() => receipt({ vehicleId, type: 'enquiry', ...fields }), {
    delay: SUBMIT_DELAY,
  })
}

/** POST /api/leads/test-drive/ */
export async function submitTestDriveBooking({ vehicleId, ...fields }) {
  return mockRequest(
    () => receipt({ vehicleId, type: 'test-drive', ...fields }),
    { delay: SUBMIT_DELAY },
  )
}

/** POST /api/leads/finance/ */
export async function submitFinanceRequest({ vehicleId, ...fields }) {
  return mockRequest(() => receipt({ vehicleId, type: 'finance', ...fields }), {
    delay: SUBMIT_DELAY,
  })
}

/**
 * POST /api/leads/appointment/
 *
 * The one lead a real backend would have to do more with than file away: two
 * customers can hold the same slot in this build, because nothing reserves it.
 * A Django version would have to check and hold the slot inside the same
 * transaction that writes the appointment.
 */
export async function submitServiceAppointment({ serviceSlug, ...fields }) {
  return mockRequest(
    () => receipt({ serviceSlug, type: 'appointment', ...fields }),
    { delay: SUBMIT_DELAY },
  )
}

/**
 * POST /api/orders/parts/
 *
 * A parts order request. The cart is sent as line items rather than as a total,
 * because the price of a part can change between a cart being filled and an
 * order being placed, and the counter has to re-price against the shelf anyway.
 *
 * Nothing is charged and nothing is reserved — §1 keeps this build
 * frontend-only, and `OrderSummary` says so on the page rather than letting the
 * customer assume a payment happened.
 */
export async function submitPartsOrder({ items, fulfilment, ...fields }) {
  return mockRequest(
    () =>
      receipt({
        type: 'parts-order',
        fulfilment,
        items: items.map((item) => ({
          id: item.id,
          sku: item.sku,
          quantity: item.quantity,
        })),
        ...fields,
      }),
    { delay: SUBMIT_DELAY },
  )
}
