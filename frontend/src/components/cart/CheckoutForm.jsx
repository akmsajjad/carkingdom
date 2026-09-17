import { CheckCircle2 } from 'lucide-react'
import Button from '../common/Button'
import Field from '../common/Field'
import Input from '../common/Input'
import Textarea from '../common/Textarea'
import FormActions from '../forms/FormActions'
import useLeadForm from '../../hooks/useLeadForm'
import { submitPartsOrder } from '../../services/leads'
import { SITE, TEL_HREF } from '../../data/site'
import { validateContact } from '../../utils/validation'

const INITIAL_VALUES = { name: '', email: '', phone: '', notes: '' }

/**
 * Checkout for a parts order.
 *
 * Three fields and a note, then it goes to the counter. There is no address
 * form and no card fields because there is no payment gateway and no delivery
 * logistics in this build (§1) — a fake card form would be worse than none, and
 * a real one is a different project. The copy says what actually happens.
 *
 * `validateContact` is the same name/email/phone rule the enquiry, test-drive
 * and finance forms use, so "what counts as a phone number" cannot drift
 * between four forms on the same site.
 */
export default function CheckoutForm({ items, fulfilment, onPlaced, onCancel }) {
  const { values, errors, submitting, submitted, setField, handleSubmit } =
    useLeadForm({
      initialValues: INITIAL_VALUES,
      validate: validateContact,
      onSubmit: (fields) => submitPartsOrder({ items, fulfilment, ...fields }),
      successMessage: 'Order request sent to the parts counter',
    })

  if (submitted) {
    return (
      <div className="py-4 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-7 text-emerald-600" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold text-brand-900">
          Your order request is with the counter
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          We will call {values.phone} within one business hour to confirm stock,
          fitment and payment. Nothing has been charged.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          In a hurry? Call{' '}
          <a href={TEL_HREF} className="font-semibold text-accent-700 underline underline-offset-2">
            {SITE.phoneDisplay}
          </a>
          .
        </p>
        <Button className="mt-6" onClick={onPlaced}>
          Done
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        {fulfilment === 'delivery'
          ? 'Local delivery — the counter will confirm the cost before anything ships.'
          : 'Pick up at the counter — we will have it bagged and waiting.'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={errors.name} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              autoComplete="name"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
            />
          )}
        </Field>

        <Field label="Phone" error={errors.phone} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="tel"
              aria-describedby={describedBy}
              invalid={invalid}
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => setField('phone', event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field label="Email" error={errors.email} required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            aria-describedby={describedBy}
            invalid={invalid}
            autoComplete="email"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
          />
        )}
      </Field>

      <Field
        label="Anything we should know?"
        hint="Year, make and model, or your VIN — it lets us check fitment before we call."
      >
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            rows={3}
            value={values.notes}
            onChange={(event) => setField('notes', event.target.value)}
          />
        )}
      </Field>

      <FormActions
        submitLabel="Send order request"
        submitting={submitting}
        onCancel={onCancel}
      />
    </form>
  )
}
