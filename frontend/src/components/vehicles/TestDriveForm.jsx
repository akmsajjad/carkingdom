import { useMemo } from 'react'
import Field from '../common/Field'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import ContactFields from '../forms/ContactFields'
import FormActions from '../forms/FormActions'
import FormErrorSummary from '../forms/FormErrorSummary'
import FormSuccess from '../forms/FormSuccess'
import useLeadForm from '../../hooks/useLeadForm'
import { submitTestDriveBooking } from '../../services/leads'
import { isFilled, isSunday, todayIso, validateContact } from '../../utils/validation'
import { SITE } from '../../data/site'

/** Hourly slots inside the hours published in `data/site.js` — the lot opens at
 *  9 and shuts at 6 on weekdays, and at 10 and 5 on Saturdays, so the last
 *  bookable slot is an hour before closing. */
const WEEKDAY_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
]
const SATURDAY_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM',
]

function slotsFor(iso) {
  if (!iso) return WEEKDAY_SLOTS
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return WEEKDAY_SLOTS
  return date.getDay() === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS
}

/**
 * Test drive booking.
 *
 * The closed-day rule is enforced here rather than left to the backend: a
 * customer offered a Sunday slot and then told it is impossible has been
 * failed twice. The date input carries a `min` of today for the same reason —
 * a control that cannot express the wrong answer beats an error message
 * explaining it.
 */
export default function TestDriveForm({ vehicle, onDone }) {
  const initialValues = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      notes: '',
    }),
    [],
  )

  const validate = useMemo(
    () => (values) => {
      const errors = validateContact(values)
      const today = todayIso()

      if (!isFilled(values.date)) {
        errors.date = 'Please choose a day for your test drive.'
      } else if (values.date < today) {
        errors.date = 'Please choose a date from today onwards.'
      } else if (isSunday(values.date)) {
        errors.date = 'We are closed on Sundays — please pick another day.'
      }

      if (!isFilled(values.time)) {
        errors.time = 'Please choose a time.'
      }

      return errors
    },
    [],
  )

  const onSubmit = useMemo(
    () => (values) => submitTestDriveBooking({ vehicleId: vehicle.id, ...values }),
    [vehicle.id],
  )

  const {
    values,
    errors,
    errorCount,
    submitting,
    submitted,
    setField,
    handleSubmit,
    reset,
  } = useLeadForm({
    initialValues,
    validate,
    onSubmit,
    successMessage: 'Test drive requested',
  })

  const closed = isSunday(values.date)
  const slots = slotsFor(values.date)

  if (submitted) {
    return (
      <FormSuccess
        title="Your test drive is booked"
        description={`We'll confirm your ${values.date} appointment at ${values.time} by ${values.name ? 'phone or email' : 'phone'} shortly. Bring your driver's licence and we'll have the ${vehicle.title} ready and warmed up.`}
        onReset={reset}
        resetLabel="Book another time"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormErrorSummary count={errorCount} />

      <ContactFields values={values} errors={errors} onChange={setField} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preferred day" required error={errors.date}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="date"
              type="date"
              min={todayIso()}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.date}
              onChange={(event) => {
                setField('date', event.target.value)
                // The slot list differs between weekdays and Saturday, so a
                // time chosen before the day changed may no longer exist.
                setField('time', '')
              }}
            />
          )}
        </Field>

        <Field label="Preferred time" required error={errors.time}>
          {({ id, describedBy, invalid }) => (
            <Select
              id={id}
              name="time"
              placeholder={closed ? 'Closed on Sundays' : 'Choose a time'}
              options={slots}
              disabled={closed}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.time}
              onChange={(event) => setField('time', event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field
        label="Anything we should know?"
        hint="A trade-in you'd like appraised, a child seat to fit, or a route you want to try."
      >
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            name="notes"
            rows={3}
            aria-describedby={describedBy}
            value={values.notes}
            onChange={(event) => setField('notes', event.target.value)}
          />
        )}
      </Field>

      <p className="text-xs text-slate-500">
        Test drives run during opening hours: {SITE.hours[0].days} {SITE.hours[0].time},{' '}
        {SITE.hours[1].days} {SITE.hours[1].time}. We are closed {SITE.hours[2].days.toLowerCase()}.
      </p>

      <FormActions
        submitLabel="Request test drive"
        submitting={submitting}
        onCancel={onDone}
      />
    </form>
  )
}
