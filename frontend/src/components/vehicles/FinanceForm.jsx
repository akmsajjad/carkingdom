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
import { submitFinanceRequest } from '../../services/leads'
import { estimateMonthlyPayment, formatPrice } from '../../utils/format'
import { isFilled, validateContact } from '../../utils/validation'

/** Terms in months, the range a Canadian dealership actually offers. */
const TERMS = [
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
  { value: '48', label: '48 months' },
  { value: '60', label: '60 months' },
  { value: '72', label: '72 months' },
  { value: '84', label: '84 months' },
]

/**
 * Finance pre-approval request.
 *
 * This deliberately does not ask for a social insurance number, date of birth
 * or employer. A pre-approval request is a request to be contacted; collecting
 * identity data through an unauthenticated web form that has no backend to
 * store it safely would be a liability, not a convenience. The credit
 * application proper belongs on paper or in a secure portal, and the copy says
 * so.
 *
 * The live payment figure is the same estimate the sidebar shows, recalculated
 * as the customer edits the down payment or term — so the number they carry
 * into the conversation is one they chose the inputs for.
 */
export default function FinanceForm({ vehicle, onDone }) {
  const initialValues = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      downPayment: '',
      term: '60',
      notes: '',
    }),
    [],
  )

  const validate = useMemo(
    () => (values) => {
      const errors = validateContact(values)
      const price = vehicle.effectivePrice

      if (isFilled(values.downPayment)) {
        const down = Number(values.downPayment)
        if (Number.isNaN(down) || down < 0) {
          errors.downPayment = 'Please enter a down payment amount.'
        } else if (down >= price) {
          errors.downPayment = `That covers the whole ${formatPrice(price)} — there would be nothing to finance.`
        }
      }

      return errors
    },
    [vehicle.effectivePrice],
  )

  const onSubmit = useMemo(
    () => (values) => submitFinanceRequest({ vehicleId: vehicle.id, ...values }),
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
    successMessage: 'Finance request sent',
  })

  const monthly = estimateMonthlyPayment(vehicle.effectivePrice, {
    months: Number(values.term),
    downPayment: isFilled(values.downPayment) ? Number(values.downPayment) : undefined,
  })

  if (submitted) {
    return (
      <FormSuccess
        title="Thanks — we'll be in touch about financing"
        description={`A member of our team will call you to go over options for the ${vehicle.title}. Have your driver's licence and proof of income handy, and we can usually give you an answer the same day.`}
        onReset={reset}
        resetLabel="Send another request"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormErrorSummary count={errorCount} />

      <ContactFields values={values} errors={errors} onChange={setField} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Down payment"
          error={errors.downPayment}
          hint={`Optional — ${vehicle.title} is listed at ${formatPrice(vehicle.effectivePrice)}.`}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="downPayment"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="e.g. 5000"
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.downPayment}
              onChange={(event) => setField('downPayment', event.target.value)}
            />
          )}
        </Field>

        <Field label="Preferred term">
          {({ id }) => (
            <Select
              id={id}
              name="term"
              options={TERMS}
              value={values.term}
              onChange={(event) => setField('term', event.target.value)}
            />
          )}
        </Field>
      </div>

      {monthly != null && (
        // Not a live region: the number tracks a control the customer is
        // already operating, and announcing every keystroke of "15000" would
        // be noise rather than feedback.
        <p className="rounded-lg bg-slate-50 px-3.5 py-3 text-sm text-slate-600">
          Estimated payment{' '}
          <strong className="text-base font-bold text-brand-900">
            {formatPrice(monthly)}/mo
          </strong>{' '}
          over {values.term} months at 8.9% APR. An estimate only — your rate
          and term are confirmed with the lender.
        </p>
      )}

      <Field
        label="Anything else?"
        hint="A trade-in, a co-signer, or a monthly budget you need to stay under."
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
        Please do not send a social insurance number or banking details through
        this form. We will complete the credit application with you directly.
      </p>

      <FormActions
        submitLabel="Request pre-approval"
        submitting={submitting}
        onCancel={onDone}
      />
    </form>
  )
}
