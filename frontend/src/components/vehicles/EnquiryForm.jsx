import { useMemo } from 'react'
import Field from '../common/Field'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import ContactFields from '../forms/ContactFields'
import FormActions from '../forms/FormActions'
import FormErrorSummary from '../forms/FormErrorSummary'
import FormSuccess from '../forms/FormSuccess'
import useLeadForm from '../../hooks/useLeadForm'
import { submitVehicleEnquiry } from '../../services/leads'
import { isFilled, validateContact } from '../../utils/validation'
import { SITE } from '../../data/site'

const CONTACT_METHODS = ['Email', 'Phone call', 'Text message']

/**
 * "Ask about this vehicle" — the general-purpose enquiry.
 *
 * The message is pre-filled with the vehicle and stock number. A customer who
 * edits it gives us more to go on, and one who does not still sends an enquiry
 * that says which car it is about; making them write that themselves is how you
 * receive a blank message and no way to know which of forty cars it meant.
 */
export default function EnquiryForm({ vehicle, onDone }) {
  const initialValues = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      preferredContact: 'Email',
      message: `I'm interested in the ${vehicle.title} (Stock ${vehicle.stockNumber}). Please send me more information.`,
    }),
    [vehicle.title, vehicle.stockNumber],
  )

  const validate = useMemo(
    () => (values) => {
      const errors = validateContact(values)
      if (!isFilled(values.message)) {
        errors.message = 'Please add a short message.'
      }
      return errors
    },
    [],
  )

  const onSubmit = useMemo(
    () => (values) => submitVehicleEnquiry({ vehicleId: vehicle.id, ...values }),
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
    successMessage: 'Enquiry sent',
  })

  if (submitted) {
    return (
      <FormSuccess
        title="Thanks — your enquiry is on its way"
        description={`We'll get back to you about the ${vehicle.title} within one business day. If it's urgent, call us on ${SITE.phoneDisplay}.`}
        onReset={reset}
        resetLabel="Send another enquiry"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormErrorSummary count={errorCount} />

      <ContactFields values={values} errors={errors} onChange={setField} />

      <Field label="How should we reach you?">
        {({ id }) => (
          <Select
            id={id}
            name="preferredContact"
            options={CONTACT_METHODS}
            value={values.preferredContact}
            onChange={(event) => setField('preferredContact', event.target.value)}
          />
        )}
      </Field>

      <Field
        label="Message"
        required
        error={errors.message}
        hint="Anything you want us to know — a trade-in, a question about the history, or a time that suits you."
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="message"
            rows={5}
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.message}
            onChange={(event) => setField('message', event.target.value)}
          />
        )}
      </Field>

      <FormActions
        submitLabel="Send enquiry"
        submitting={submitting}
        onCancel={onDone}
      />
    </form>
  )
}
