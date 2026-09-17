import Button from '../common/Button'

/**
 * The Cancel / submit row at the foot of every lead form.
 *
 * Extracted because all three forms had it character for character, and the
 * one thing that must never drift between them is the submit button's
 * `type="submit"`: lose that on one form and it silently stops submitting,
 * which no amount of reading the other two forms would reveal.
 *
 * The submit button comes last in the DOM and is the accent-filled one, which
 * is the order the eye and the tab key both expect.
 */
export default function FormActions({ submitLabel, submitting, onCancel }) {
  return (
    <div className="flex flex-wrap justify-end gap-3 pt-1">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </div>
  )
}
