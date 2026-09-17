import { useMemo } from 'react'
import Field from '../common/Field'
import Textarea from '../common/Textarea'
import SchedulePicker from '../appointments/SchedulePicker'
import ContactFields from '../forms/ContactFields'
import FormActions from '../forms/FormActions'
import FormErrorSummary from '../forms/FormErrorSummary'
import FormSuccess from '../forms/FormSuccess'
import useLeadForm from '../../hooks/useLeadForm'
import { submitTestDriveBooking } from '../../services/leads'
import { isFilled, validateContact } from '../../utils/validation'
import { formatDate } from '../../utils/format'
import { isClosedOn, nextBookableDay } from '../../utils/scheduling'
import { SITE } from '../../data/site'

/**
 * Test drive booking.
 *
 * The picker only offers days the shop is open and times that are actually
 * free, so the closed-day rule is enforced by the control rather than by an
 * error message after the fact — a customer offered a Sunday slot and then told
 * it is impossible has been failed twice.
 *
 * It opens on the next open day, so the times are on screen immediately instead
 * of behind a click.
 */
export default function TestDriveForm({ vehicle, onDone }) {
  const initialValues = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      date: nextBookableDay() ?? '',
      time: '',
      notes: '',
    }),
    [],
  )

  const validate = useMemo(
    () => (values) => {
      const errors = validateContact(values)

      if (!isFilled(values.date)) {
        errors.date = 'Please choose a day for your test drive.'
      } else if (isClosedOn(values.date)) {
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

  if (submitted) {
    return (
      <FormSuccess
        title="Your test drive is booked"
        description={`We'll confirm your ${formatDate(values.date)} appointment at ${values.time} by phone or email shortly. Bring your driver's licence and we'll have the ${vehicle.title} ready and warmed up.`}
        onReset={reset}
        resetLabel="Book another time"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormErrorSummary count={errorCount} />

      <ContactFields values={values} errors={errors} onChange={setField} />

      <SchedulePicker
        date={values.date}
        time={values.time}
        onChange={setField}
        dateError={errors.date}
        timeError={errors.time}
        durationHours={1}
      />

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
        Looking further ahead than the days above? Call us and we&rsquo;ll arrange it.
      </p>

      <FormActions
        submitLabel="Request test drive"
        submitting={submitting}
        onCancel={onDone}
      />
    </form>
  )
}
