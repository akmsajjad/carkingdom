import { useMemo } from 'react'
import Field from '../common/Field'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import SchedulePicker from './SchedulePicker'
import ContactFields from '../forms/ContactFields'
import FormActions from '../forms/FormActions'
import FormErrorSummary from '../forms/FormErrorSummary'
import FormSuccess from '../forms/FormSuccess'
import useLeadForm from '../../hooks/useLeadForm'
import { submitServiceAppointment } from '../../services/leads'
import { SERVICES } from '../../data/services'
import { isFilled, validateContact } from '../../utils/validation'
import { formatDate } from '../../utils/format'
import { isClosedOn, nextBookableDay } from '../../utils/scheduling'
import { SITE } from '../../data/site'

const SERVICE_OPTIONS = SERVICES.map((service) => ({
  value: service.slug,
  label: `${service.name} — from ${service.duration}`,
}))

/**
 * Booking a service appointment.
 *
 * The slot list is filtered by how long the chosen job takes, so a brake job
 * that needs three hours is not offered at four o'clock. That is the one thing
 * that separates this from a contact form with a date on it: the times offered
 * are times the shop can actually honour.
 *
 * A vehicle description is free text rather than a year/make/model triple.
 * Customers write "2016 Civic" or "Ram 1500, diesel" and both are fine; three
 * dropdowns would reject the second one.
 */
export default function AppointmentForm({ defaultService = '', onDone }) {
  const initialValues = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      serviceSlug: defaultService,
      vehicle: '',
      date: nextBookableDay() ?? '',
      time: '',
      notes: '',
    }),
    [defaultService],
  )

  const validate = useMemo(
    () => (values) => {
      const errors = validateContact(values)

      if (!isFilled(values.serviceSlug)) {
        errors.serviceSlug = 'Please choose the service you need.'
      }

      if (!isFilled(values.vehicle)) {
        errors.vehicle = 'Please tell us the vehicle — year, make and model is plenty.'
      }

      if (!isFilled(values.date)) {
        errors.date = 'Please choose a day.'
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
    () => (values) => submitServiceAppointment(values),
    [],
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
    successMessage: 'Appointment requested',
  })

  const chosen = SERVICES.find((service) => service.slug === values.serviceSlug)

  if (submitted) {
    return (
      <FormSuccess
        title="Your appointment is booked"
        description={`We'll confirm ${formatDate(values.date)} at ${values.time} by phone or email. The ${chosen?.name.toLowerCase() ?? 'work'} is booked for about ${chosen?.duration ?? 'an hour'} — bring the vehicle in a few minutes early and we'll take it from there.`}
        onReset={reset}
        resetLabel="Book another appointment"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormErrorSummary count={errorCount} />

      <Field label="What do you need done?" required error={errors.serviceSlug}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            name="serviceSlug"
            placeholder="Choose a service"
            options={SERVICE_OPTIONS}
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.serviceSlug}
            onChange={(event) => {
              setField('serviceSlug', event.target.value)
              // The slot list depends on how long the job takes, so a time
              // chosen for a one-hour oil change may not suit a four-hour
              // detail. The picker re-reads availability and the choice goes.
              setField('time', '')
            }}
          />
        )}
      </Field>

      <Field
        label="Which vehicle?"
        required
        error={errors.vehicle}
        hint="Year, make and model — for example, 2018 Honda Civic."
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="vehicle"
            autoComplete="off"
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.vehicle}
            onChange={(event) => setField('vehicle', event.target.value)}
          />
        )}
      </Field>

      <ContactFields values={values} errors={errors} onChange={setField} />

      <SchedulePicker
        date={values.date}
        time={values.time}
        onChange={setField}
        dateError={errors.date}
        timeError={errors.time}
        durationHours={chosen?.durationHours ?? 1}
      />

      <Field
        label="Anything else we should know?"
        hint="A noise you can describe, a warning light, or a time you need the vehicle back by."
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
        The times shown are when we can start the job. For longer work we&rsquo;ll
        confirm the drop-off and pick-up when we call. Prefer to talk it through?
        Call {SITE.phoneDisplay}.
      </p>

      <FormActions
        submitLabel="Request appointment"
        submitting={submitting}
        onCancel={onDone}
      />
    </form>
  )
}
