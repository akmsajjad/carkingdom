/**
 * Tells the customer that a submission was refused.
 *
 * Field-level messages alone are not enough: they appear next to inputs, and a
 * dialog tall enough to need scrolling can hide all of them at once, leaving a
 * submit button that appears to have done nothing. `role="alert"` announces
 * this immediately, wherever the viewport happens to be.
 */
export default function FormErrorSummary({ count }) {
  if (!count) return null

  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
    >
      {count === 1
        ? 'Please check the highlighted field.'
        : `Please check the ${count} highlighted fields.`}
    </p>
  )
}
