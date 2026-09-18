import { mockRequest } from './mock'
import {
  closeHourFor,
  isClosedOn,
  isFullyBooked,
  isPastSlot,
  isSlotTaken,
  slotsForDate,
} from '../utils/scheduling'

/**
 * Service-bay availability.
 *
 * **This is a mock and it books nothing.** §1 keeps the build frontend-only —
 * there is no diary, no bay allocation and no stored reservation. What it does
 * model honestly is the *shape* of availability, so the booking UI is written
 * against real constraints instead of against a list of times that are always
 * free: which days the shop is shut, which slots have already gone by, which
 * are taken, and which are too late to start a job of a given length.
 *
 * The rules for "closed", "gone" and "taken" live in `utils/scheduling.js`
 * rather than here, because the booking forms have to ask the same questions
 * to decide which day to open on. See the note there.
 */

/**
 * GET /api/appointments/availability/?date=YYYY-MM-DD&hours=2
 *
 * @param {string} iso  the day being asked about
 * @param {{ durationHours?: number }} options  how long the job needs, used to
 *   drop slots that would run past closing time.
 * @returns {{ date, closed, fullyBooked, reason, slots: {value,label,available}[] }}
 */
export async function getAppointmentAvailability(iso, { durationHours = 1 } = {}) {
  return mockRequest(
    () => {
      const closed = isClosedOn(iso)
      const all = slotsForDate(iso)

      if (closed) {
        return {
          date: iso,
          closed: true,
          fullyBooked: false,
          reason: 'We are closed that day.',
          slots: [],
        }
      }

      if (isFullyBooked(iso)) {
        return {
          date: iso,
          closed: false,
          fullyBooked: true,
          reason: 'The bay is fully booked that day.',
          slots: all.map((slot) => ({ ...slot, available: false })),
        }
      }

      // Closing hour comes from the same schedule the slot list does, so the
      // "runs past closing" rule cannot drift away from the opening hours.
      const close = closeHourFor(iso)

      const slots = all.map((slot) => {
        const hour = Number(slot.value.split(':')[0])

        // A job that cannot finish before the shop shuts is not bookable, no
        // matter how empty the diary looks.
        if (hour + Number(durationHours) > close) {
          return { ...slot, available: false, reason: 'Too late for this job' }
        }

        if (isPastSlot(iso, slot.value)) {
          return { ...slot, available: false, reason: 'Already gone' }
        }

        if (isSlotTaken(iso, slot.value)) {
          return { ...slot, available: false, reason: 'Already booked' }
        }

        return { ...slot, available: true }
      })

      return {
        date: iso,
        closed: false,
        fullyBooked: false,
        reason: slots.some((slot) => slot.available)
          ? null
          : 'Nothing left that day.',
        slots,
      }
    },
    { delay: 220 },
  )
}
