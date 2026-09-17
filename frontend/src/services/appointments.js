import { mockRequest } from './mock'
import {
  closeHourFor,
  isClosedOn,
  isPastSlot,
  parseIso,
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
 * Availability is derived from a hash of the date and time rather than
 * `Math.random()`. That matters more than it looks: a slot that is free when
 * the customer opens the form and gone when they look again is exactly the
 * behaviour that makes people phone instead. The same date always produces the
 * same diary, and it changes only when the date does.
 */

/** Weekdays run busier than Saturdays, which is also true of a real shop. */
const BUSY_PERCENT = { weekday: 34, saturday: 20 }

/** 32-bit FNV-1a. Small, fast, and stable across reloads — which is the whole
 *  point; `Math.random()` would reshuffle the diary on every render. */
function hash(value) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

/** Stable per-day busy threshold, so one day is reliably quieter than another. */
function busyThreshold(iso) {
  const date = parseIso(iso)
  const base = date?.getDay() === 6 ? BUSY_PERCENT.saturday : BUSY_PERCENT.weekday
  // ±6 points of day-to-day variation.
  return base + (hash(`day:${iso}`) % 13) - 6
}

/** A day is fully booked when its own hash lands in a narrow band — rare
 *  enough to be believable, common enough to be reached in a two-week window
 *  and give the "nothing left" state something real to render. */
function isFullyBooked(iso) {
  return hash(`full:${iso}`) % 9 === 0
}

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

      const threshold = busyThreshold(iso)
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

        if (hash(`${iso} ${slot.value}`) % 100 < threshold) {
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
