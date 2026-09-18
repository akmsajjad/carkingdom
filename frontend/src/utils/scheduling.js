/**
 * Opening hours, expressed as bookable time.
 *
 * The shop's hours live in `data/site.js`; this module turns them into the
 * things a booking form needs — which days are open, which hourly slots exist
 * on a given day, and which of those have already passed. Both the test-drive
 * form and the service-appointment form read from here, so the two can never
 * disagree about when the lot is open.
 */
import { SITE } from '../data/site'

/** JavaScript's `getDay()` number to the entry in `SITE.hours` that owns it. */
const BY_WEEKDAY = new Map()
for (const entry of SITE.hours) {
  for (const weekday of entry.weekdays) BY_WEEKDAY.set(weekday, entry)
}

/** How many days ahead the pickers offer. Further out, we ask for a call —
 *  a dealership diary is not reliable enough three weeks ahead to promise a
 *  specific hour, and a booking form that lies is worse than a shorter list. */
export const BOOKING_WINDOW_DAYS = 14

/** `'09:00'` -> `'9:00 AM'`, the form customers read. */
export function formatTime(hhmm) {
  const [hours, minutes] = String(hhmm).split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/** The parsed date for a `YYYY-MM-DD` string, at noon to sidestep any
 *  daylight-saving shift moving it onto the previous day. */
export function parseIso(iso) {
  if (!iso) return null
  const date = new Date(`${iso}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Today in the `YYYY-MM-DD` form a date input expects, in local time.
 *  `toISOString` converts to UTC first and would hand back yesterday for
 *  anyone west of Greenwich after 6pm — which is everyone in Saskatchewan. */
export function todayIso() {
  return toIso(new Date())
}

export function toIso(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** The hours entry covering a date, or null if the date is unparseable. */
export function scheduleForDate(iso) {
  const date = parseIso(iso)
  if (!date) return null
  return BY_WEEKDAY.get(date.getDay()) ?? null
}

/** True when the lot is shut on a `YYYY-MM-DD` — a Sunday, or a bad string. */
export function isClosedOn(iso) {
  const schedule = scheduleForDate(iso)
  return !schedule || schedule.open == null
}

/** The hour the shop shuts on a date, as a 24-hour number, or null if closed.
 *  Used to work out whether a job of a given length can start at a given time. */
export function closeHourFor(iso) {
  const schedule = scheduleForDate(iso)
  if (!schedule || schedule.close == null) return null
  return Number(String(schedule.close).split(':')[0])
}

/**
 * The hourly slots bookable on a date, as `{ value, label }`.
 *
 * The last slot starts an hour before closing: booking someone in for a
 * two-hour job at ten to six is a promise the shop cannot keep.
 */
export function slotsForDate(iso) {
  const schedule = scheduleForDate(iso)
  if (!schedule || schedule.open == null) return []

  const [openHour] = schedule.open.split(':').map(Number)
  const [closeHour] = schedule.close.split(':').map(Number)

  const slots = []
  for (let hour = openHour; hour < closeHour; hour += 1) {
    const value = `${String(hour).padStart(2, '0')}:00`
    slots.push({ value, label: formatTime(value) })
  }
  return slots
}

/** True when a slot on a given date has already gone by. Slots on future dates
 *  are never past; on today, anything before the current hour is. */
export function isPastSlot(iso, value, now = new Date()) {
  if (iso !== toIso(now)) return false
  const [hour] = String(value).split(':').map(Number)
  return hour <= now.getHours()
}

/* -------------------------------------------------------------------------
 * How busy the diary is.
 *
 * The mock has to answer "is this slot taken" in two places that must agree:
 * the availability response that renders the grid, and `hasBookableSlot`, which
 * chooses the day the form opens on. When only the first knew about bookings,
 * a form opened late in the afternoon could land on a day whose every remaining
 * hour was already taken — nine greyed-out times, and the customer's first job
 * was to work out they had to pick another day.
 *
 * Availability is derived from a hash of the date and time rather than
 * `Math.random()`. That matters more than it looks: a slot that is free when
 * the customer opens the form and gone when they look again is exactly the
 * behaviour that makes people phone instead. The same date always produces the
 * same diary, and it changes only when the date does.
 * ---------------------------------------------------------------------- */

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
export function busyThreshold(iso) {
  const date = parseIso(iso)
  const base = date?.getDay() === 6 ? BUSY_PERCENT.saturday : BUSY_PERCENT.weekday
  // ±6 points of day-to-day variation.
  return base + (hash(`day:${iso}`) % 13) - 6
}

/** A day is fully booked when its own hash lands in a narrow band — rare
 *  enough to be believable, common enough to be reached in a two-week window
 *  and give the "nothing left" state something real to render. */
export function isFullyBooked(iso) {
  return hash(`full:${iso}`) % 9 === 0
}

/** True when a specific hour on a date has already been taken by somebody
 *  else. Takes a date that is already known to be open. */
export function isSlotTaken(iso, value) {
  return hash(`${iso} ${value}`) % 100 < busyThreshold(iso)
}

/**
 * The next `count` days for the picker's day strip.
 *
 * Each entry carries everything the chip renders and everything the slot grid
 * needs, so the strip does not have to re-derive the schedule per day.
 */
export function upcomingDays(count = BOOKING_WINDOW_DAYS, now = new Date()) {
  const days = []

  for (let offset = 0; offset < count; offset += 1) {
    const date = new Date(now)
    date.setDate(date.getDate() + offset)
    const iso = toIso(date)

    days.push({
      iso,
      weekdayShort: date.toLocaleDateString('en-CA', { weekday: 'short' }),
      dayOfMonth: date.getDate(),
      monthShort: date.toLocaleDateString('en-CA', { month: 'short' }),
      // What a screen reader announces. "Tue 22" is ambiguous out loud; the
      // full sentence is not.
      label: date.toLocaleDateString('en-CA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      isToday: offset === 0,
      closed: isClosedOn(iso),
    })
  }

  return days
}

/**
 * True when at least one slot on a date can actually be booked.
 *
 * Not merely "still in the future". A closed day has no slots and so is never
 * bookable — but neither is an *open* day that has already run out of hours,
 * nor one whose every remaining hour the diary hash has taken. Both are days
 * the form would otherwise open on, showing a grid of greyed-out times and
 * leaving the customer to work out that they have to pick another day.
 *
 * Blind to how long the job takes; see the note on `nextBookableDay`.
 */
export function hasBookableSlot(iso, now = new Date()) {
  if (isFullyBooked(iso)) return false
  return slotsForDate(iso).some(
    (slot) => !isPastSlot(iso, slot.value, now) && !isSlotTaken(iso, slot.value),
  )
}

/** The next day a booking can actually start on, or null within the window.
 *  Skips the days the shop is shut and the days with nothing left to book.
 *
 *  Deliberately blind to how long the job takes. A two-hour job late in the
 *  afternoon may still find its last slot "Too late for this job" on the day
 *  this returns, because the job length is chosen after the day is; threading
 *  it in would mean moving a date the customer had already picked. The picker
 *  explains that case per slot and the day strip is one tap away. */
export function nextBookableDay(fromIso = todayIso(), now = new Date()) {
  const start = parseIso(fromIso)
  if (!start) return null

  for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
    const date = new Date(start)
    date.setDate(date.getDate() + offset)
    const iso = toIso(date)
    if (hasBookableSlot(iso, now)) return iso
  }
  return null
}
