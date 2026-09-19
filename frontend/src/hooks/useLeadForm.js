import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'

/**
 * The submit-and-validate cycle shared by every lead form.
 *
 * Three forms ask for different things but behave identically: hold values,
 * validate on submit, disable the button while in flight, and end in either a
 * success panel or a message on the fields that need attention. Writing that
 * once means a fix to the error handling lands in all three.
 *
 * Validation runs on submit rather than on every keystroke. Complaining that an
 * email address is invalid while it is still being typed is the most common way
 * a form becomes irritating.
 *
 * `onSuccess` is optional and fires once the submit has actually gone through,
 * after the success state is set. Only the parts checkout needs it — see the
 * note on `CheckoutForm` about why "the order exists" and "the customer is done
 * reading the confirmation" are different moments. It is read through a ref so
 * an inline arrow at the call site does not rebuild `handleSubmit` on every
 * render.
 */
export default function useLeadForm({
  initialValues,
  validate,
  onSubmit,
  successMessage,
  onSuccess,
}) {
  const toast = useToast()

  const onSuccessRef = useRef(onSuccess)
  useEffect(() => {
    onSuccessRef.current = onSuccess
  })

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const setField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    // Clear the error as soon as the field is touched, so the message
    // disappears while the customer is fixing it rather than after.
    setErrors((current) =>
      current[name] ? { ...current, [name]: undefined } : current,
    )
  }, [])

  /**
   * Sets a field's error without going through a submit.
   *
   * Only the résumé upload uses this, and only because it is the one control
   * that can be wrong the instant it is touched: a customer who picks a 40 MB
   * file should hear about it then, not after they have typed a cover letter.
   * Pass `undefined` to clear. Every other field still validates on submit —
   * see the note at the top of this file.
   */
  const setError = useCallback((name, message) => {
    setErrors((current) => ({ ...current, [name]: message || undefined }))
  }, [])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      const found = validate(values)
      // `undefined` values left behind by `setField` do not count as errors.
      const messages = Object.entries(found).filter(([, message]) => message)

      if (messages.length > 0) {
        setErrors(Object.fromEntries(messages))
        return
      }

      setErrors({})
      setSubmitting(true)

      try {
        await onSubmit(values)
        setSubmitted(true)
        toast.success(successMessage)
        onSuccessRef.current?.()
      } catch (error) {
        toast.error(
          error?.message ||
            'We could not send that just now. Please try again or call us.',
        )
      } finally {
        setSubmitting(false)
      }
    },
    [validate, values, onSubmit, successMessage, toast],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setSubmitted(false)
    setSubmitting(false)
  }, [initialValues])

  const errorCount = Object.values(errors).filter(Boolean).length

  return {
    values,
    errors,
    errorCount,
    submitting,
    submitted,
    setField,
    setError,
    handleSubmit,
    reset,
  }
}
