import { useMemo } from 'react'
import Field from '../common/Field'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import ContactFields from '../forms/ContactFields'
import FormActions from '../forms/FormActions'
import FormErrorSummary from '../forms/FormErrorSummary'
import FormSuccess from '../forms/FormSuccess'
import useLeadForm from '../../hooks/useLeadForm'
import { submitContact } from '../../services/leads'
import { CONTACT_SUBJECTS } from '../../data/contact'
import { isFilled, validateContact } from '../../utils/validation'
import { SITE, TEL_HREF } from '../../data/site'

const SUBJECT_OPTIONS = CONTACT_SUBJECTS.map(({ value, label }) => ({
  value,
  label,
}))

/**
 * §39's contact form: name, email, phone, subject, message.
 *
 * The subject defaults to a general question rather than to an empty select,
 * because a contact form is the one form on the site somebody reaches without
 * having decided what they want yet — and a required field that is really a
 * routing hint should not be able to stop the message being sent.
 *
 * Phone is required here, as it is on every other form on the site. That is
 * `ContactFields`' shared contract and deliberately not overridden: the three
 * lead forms have to agree on these fields, and the one that quietly made phone
 * optional would be the one whose customers never got a call back.
 */
export default function ContactForm({ onDone }) {
  const initialValues = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      subject: CONTACT_SUBJECTS[0].value,
      message: '',
    }),
    [],
  )

  const validate = useMemo(
    () => (values) => {
      const errors = validateContact(values)

      if (!isFilled(values.subject)) {
        errors.subject = 'Please choose what your message is about.'
      }

      if (!isFilled(values.message)) {
        errors.message = 'Please write your message.'
      } else if (values.message.trim().length < 10) {
        // Long enough to be a sentence. A one-word message is almost always a
        // mis-tap, and the reply to it is a phone call we could have made
        // without the form.
        errors.message = 'Please give us a little more detail — a sentence is plenty.'
      }

      return errors
    },
    [],
  )

  const onSubmit = useMemo(() => (values) => submitContact(values), [])

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
    successMessage: 'Message sent',
  })

  if (submitted) {
    const subject = CONTACT_SUBJECTS.find(
      (option) => option.value === values.subject,
    )

    return (
      <FormSuccess
        title="Thanks — your message is with us"
        description={`It has gone to the ${
          subject?.value === 'general' || subject?.value === 'other'
            ? 'front desk'
            : 'right department'
        }, and someone will reply to ${values.email} within one business day. If it is urgent, call ${SITE.phoneDisplay} rather than waiting on the form.`}
        onReset={reset}
        resetLabel="Send another message"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormErrorSummary count={errorCount} />

      <ContactFields values={values} errors={errors} onChange={setField} />

      <Field label="What is it about?" required error={errors.subject}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            name="subject"
            options={SUBJECT_OPTIONS}
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.subject}
            onChange={(event) => setField('subject', event.target.value)}
          />
        )}
      </Field>

      <Field
        label="Message"
        required
        error={errors.message}
        hint="If it is about a vehicle, the stock number or the link helps us answer in one reply rather than three."
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="message"
            rows={6}
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.message}
            onChange={(event) => setField('message', event.target.value)}
          />
        )}
      </Field>

      <p className="text-xs leading-relaxed text-slate-500">
        We answer every message, and we do not add you to a mailing list. Need an
        answer today? Call{' '}
        <a
          href={TEL_HREF}
          className="font-medium text-brand-700 hover:text-brand-900"
        >
          {SITE.phoneDisplay}
        </a>
        .
      </p>

      <FormActions
        submitLabel="Send message"
        submitting={submitting}
        onCancel={onDone}
      />
    </form>
  )
}
