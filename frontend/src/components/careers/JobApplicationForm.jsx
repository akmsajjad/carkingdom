import { useMemo } from 'react'
import Field from '../common/Field'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import ContactFields from '../forms/ContactFields'
import FormActions from '../forms/FormActions'
import FormErrorSummary from '../forms/FormErrorSummary'
import FormSuccess from '../forms/FormSuccess'
import ResumeUpload from './ResumeUpload'
import useLeadForm from '../../hooks/useLeadForm'
import { submitJobApplication } from '../../services/leads'
import { JOBS } from '../../data/careers'
import {
  isFilled,
  isUrl,
  validateContact,
  validateResumeFile,
} from '../../utils/validation'
import { SITE, TEL_HREF } from '../../data/site'

const POSITION_OPTIONS = JOBS.map((job) => ({
  value: job.slug,
  label: `${job.title} — ${job.department}`,
}))

/**
 * Applying for a role.
 *
 * The position is pre-filled from the posting it sits under, because a
 * candidate who scrolled to the bottom of the technician posting should not
 * have to tell us which job they mean — and, more to the point, should not be
 * able to get it wrong.
 *
 * The cover letter is optional and says so. Requiring one filters out people
 * who would have done the job well, and a letter written because a form
 * demanded it is not worth reading anyway.
 */
export default function JobApplicationForm({ defaultPosition = '' }) {
  const initialValues = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      position: defaultPosition,
      resume: null,
      coverLetter: '',
      profileUrl: '',
    }),
    [defaultPosition],
  )

  const validate = useMemo(
    () => (values) => {
      const errors = validateContact(values)

      if (!isFilled(values.position)) {
        errors.position = 'Please choose the role you are applying for.'
      }

      const resumeError = validateResumeFile(values.resume)
      if (resumeError) errors.resume = resumeError

      if (isFilled(values.profileUrl) && !isUrl(values.profileUrl)) {
        errors.profileUrl =
          'That does not look like a link. “linkedin.com/in/your-name” is fine — we add the https:// ourselves.'
      }

      return errors
    },
    [],
  )

  const onSubmit = useMemo(() => (values) => submitJobApplication(values), [])

  const {
    values,
    errors,
    errorCount,
    submitting,
    submitted,
    setField,
    setError,
    handleSubmit,
    reset,
  } = useLeadForm({
    initialValues,
    validate,
    onSubmit,
    successMessage: 'Application sent',
  })

  const chosen = JOBS.find((job) => job.slug === values.position)

  /**
   * The résumé is checked as soon as it is picked, unlike every other field.
   *
   * A text field is wrong one keystroke at a time and complaining early is
   * irritating; a file is wrong the instant it is chosen and the customer is
   * about to type a cover letter on top of it. `setError` is the escape hatch
   * `useLeadForm` provides for exactly this.
   */
  function handleResume(file) {
    setField('resume', file)
    setError('resume', file ? validateResumeFile(file) : undefined)
  }

  /**
   * The heading stays put across both states; only the copy under it changes.
   *
   * It used to live on the page, above this component — which meant that after
   * a successful submission the confirmation sat underneath a paragraph still
   * telling the customer to fill the form in. Anything that is only true while
   * the form is on screen belongs on this side of the `submitted` branch.
   */
  const heading = chosen ? `Apply for ${chosen.title}` : 'Apply for a role'

  if (submitted) {
    return (
      <div>
        <h2 className="text-xl font-bold text-brand-900">{heading}</h2>
        <FormSuccess
          title="Thanks — we have your application"
          description={`Your application for ${chosen?.title ?? 'the role'} is in. We read every one ourselves and reply either way, usually within a week. If you would rather talk it through first, call ${SITE.phoneDisplay}.`}
          onReset={reset}
          resetLabel="Send another application"
        />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-brand-900">{heading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        It takes a few minutes. If you would rather send a résumé with no cover
        letter, that is fine — we read every one.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <FormErrorSummary count={errorCount} />

        <ContactFields values={values} errors={errors} onChange={setField} />

        <Field label="Which role?" required error={errors.position}>
          {({ id, describedBy, invalid }) => (
            <Select
              id={id}
              name="position"
              placeholder="Choose a role"
              options={POSITION_OPTIONS}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.position}
              onChange={(event) => setField('position', event.target.value)}
            />
          )}
        </Field>

        {/* No `label` on `Field` here — the dropzone carries its own, so that the
            whole box is the label for the file input. `Field` still supplies the
            id, the error and the `aria-describedby` wiring. */}
        <Field error={errors.resume}>
          {({ id, describedBy, invalid }) => (
            <ResumeUpload
              id={id}
              describedBy={describedBy}
              invalid={invalid}
              file={values.resume}
              onChange={handleResume}
            />
          )}
        </Field>

        <Field
          label="Cover letter"
          hint="Optional, and we do read them. A few paragraphs on why this role and what you have done that is close to it is plenty."
        >
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              name="coverLetter"
              rows={6}
              aria-describedby={describedBy}
              value={values.coverLetter}
              onChange={(event) => setField('coverLetter', event.target.value)}
            />
          )}
        </Field>

        <Field
          label="LinkedIn or portfolio"
          error={errors.profileUrl}
          hint="Optional. A profile address is fine — we add the https:// ourselves."
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="profileUrl"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="linkedin.com/in/your-name"
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.profileUrl}
              onChange={(event) => setField('profileUrl', event.target.value)}
            />
          )}
        </Field>

        <p className="text-xs leading-relaxed text-slate-500">
          We keep applications on file for six months and we do not pass them to
          anyone else. Questions about the role before you apply? Call{' '}
          <a
            href={TEL_HREF}
            className="font-medium text-brand-700 hover:text-brand-900"
          >
            {SITE.phoneDisplay}
          </a>{' '}
          and ask for the department manager.
        </p>

        <FormActions submitLabel="Send application" submitting={submitting} />
      </form>
    </div>
  )
}
