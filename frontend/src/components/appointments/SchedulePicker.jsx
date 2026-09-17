import { useMemo } from 'react'
import { Ban, CalendarX } from 'lucide-react'
import Skeleton from '../common/Skeleton'
import { errorClasses, hintClasses, labelClasses } from '../common/formStyles'
import useAsync from '../../hooks/useAsync'
import { getAppointmentAvailability } from '../../services/appointments'
import { upcomingDays } from '../../utils/scheduling'
import { cn } from '../../utils/cn'

/**
 * Picks a day and a time, showing which times are actually free.
 *
 * Shared by the test-drive form and the service-appointment form. Both need the
 * same three things — the days the shop is shut, the hourly slots, and which of
 * those are already taken — and a second copy of that would be a second place
 * for the opening hours to be wrong.
 *
 * The day chips are toggle buttons carrying `aria-pressed`, not a radiogroup.
 * A radiogroup contract obliges you to implement arrow-key roving focus, and a
 * half-built version of that is worse for a keyboard user than plain Tab and
 * Enter through a row of buttons, which is what this is.
 */
export default function SchedulePicker({
  date,
  time,
  onChange,
  dateError,
  timeError,
  durationHours = 1,
}) {
  const days = useMemo(() => upcomingDays(), [])

  const { data: availability, loading } = useAsync(
    () => getAppointmentAvailability(date, { durationHours }),
    `${date}|${durationHours}`,
  )

  const slots = availability?.slots ?? []
  const hasFreeSlot = slots.some((slot) => slot.available)

  /**
   * Changing the day always clears the time.
   *
   * The slot list is per-day, so a time chosen on Tuesday may not exist, or may
   * already be taken, on Wednesday. Clearing is done here rather than in each
   * form because this is the only place that knows the two are connected — and
   * `setField` applies functional updates, so both land in one render.
   */
  const selectDay = (iso) => {
    onChange('date', iso)
    onChange('time', '')
  }

  // Derived during render rather than cleared in an effect: a slot can only
  // stop being free if the day changed or the diary did, and both of those are
  // already handled by the form clearing `time`. This is the backstop for the
  // day the mock becomes a real backend that re-reads availability.
  const staleChoice =
    Boolean(time) && slots.length > 0 && !slots.some((slot) => slot.value === time && slot.available)

  return (
    <div className="space-y-5">
      {/*
        `min-w-0` on the fieldsets is load-bearing, not decoration. The browser's
        default stylesheet gives `fieldset` a `min-width: min-content`, so the
        day strip's fourteen chips — 896px of them — became the fieldset's
        minimum width. The fieldset then refused to shrink, stretched its
        ancestors, and the strip never scrolled: on a phone the card clipped it
        at about the fifth day, leaving the rest of the fortnight both invisible
        and unreachable, and on a desktop it clipped the last chip. Overriding
        that one inherited default is what lets `overflow-x-auto` below actually
        do its job.
      */}
      <fieldset className="min-w-0 space-y-2">
        <legend className={labelClasses}>Preferred day</legend>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pt-1 pb-2">
          {days.map((day) => {
            const selected = day.iso === date

            return (
              <button
                key={day.iso}
                type="button"
                disabled={day.closed}
                aria-pressed={selected}
                aria-label={day.closed ? `${day.label} — closed` : day.label}
                onClick={() => selectDay(day.iso)}
                // Closed days come first and the branches are exclusive. As a
                // separate `day.closed && ...` clause they were not: both set
                // `bg-*`, `text-*` and `border-*`, `cn` is a plain join rather
                // than a conflict-resolving merge, and the winner is decided by
                // stylesheet order — which handed it to the open-day branch.
                // The measured result was a shut Sunday rendering exactly like
                // an open one, so the only thing telling a customer it could not
                // be picked was that tapping it did nothing.
                className={cn(
                  'flex w-14 shrink-0 flex-col items-center rounded-lg border px-1 py-2 transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
                  day.closed
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500'
                    : selected
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                )}
              >
                <span className="text-[11px] font-medium tracking-wide uppercase">
                  {day.weekdayShort}
                </span>
                <span className="text-base leading-tight font-bold">
                  {day.dayOfMonth}
                </span>
                <span
                  className={cn(
                    'text-[10px] uppercase',
                    selected ? 'text-brand-200' : 'text-slate-400',
                  )}
                >
                  {day.monthShort}
                </span>
              </button>
            )
          })}
        </div>

        {dateError && <p className={errorClasses}>{dateError}</p>}
      </fieldset>

      <fieldset className="min-w-0 space-y-2">
        <legend className={labelClasses}>Preferred time</legend>

        {loading && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        )}

        {!loading && slots.length === 0 && (
          <p className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <CalendarX className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span>
              {availability?.reason ?? 'We are closed that day.'} Pick another day,
              or call us on the number at the top of the page.
            </span>
          </p>
        )}

        {!loading && slots.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const selected = slot.value === time

                return (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={!slot.available}
                    aria-pressed={selected}
                    // The reason travels in the accessible name as well as the
                    // tooltip: a greyed-out button that will not say why is the
                    // most common complaint about booking widgets.
                    aria-label={
                      slot.available
                        ? slot.label
                        : `${slot.label} — ${slot.reason ?? 'unavailable'}`
                    }
                    title={slot.available ? undefined : slot.reason}
                    onClick={() => onChange('time', slot.value)}
                    // Same exclusive-branch rule as the day chips above: as a
                    // separate clause the unavailable styling lost to the
                    // enabled styling on every property they shared, leaving
                    // `line-through` — the one that did not collide — as the
                    // sole signal that a time was gone.
                    className={cn(
                      'h-10 rounded-lg border text-sm font-medium transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
                      !slot.available
                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500 line-through'
                        : selected
                          ? 'border-brand-900 bg-brand-900 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    {slot.label}
                  </button>
                )
              })}
            </div>

            {!hasFreeSlot && (
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <Ban className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span>
                  Every time on this day has gone. Try another day, or call us — we
                  can usually fit you in.
                </span>
              </p>
            )}

            {hasFreeSlot && (
              <p className={hintClasses}>
                Crossed-out times are already booked or too late to start this job.
              </p>
            )}
          </>
        )}

        {staleChoice && (
          <p className={errorClasses}>
            That time is no longer available — please pick another.
          </p>
        )}
        {timeError && <p className={errorClasses}>{timeError}</p>}
      </fieldset>
    </div>
  )
}
