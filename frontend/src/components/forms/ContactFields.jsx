import Field from '../common/Field'
import Input from '../common/Input'

/**
 * The name, email and phone trio every lead form opens with.
 *
 * Shared rather than repeated because the three forms must agree on these
 * fields exactly — the same labels, the same `autoComplete` hints so a browser
 * can fill them in one tap, and the same error wiring through `Field`. Three
 * hand-written copies would drift the first time one of them was tweaked.
 */
export default function ContactFields({ values, errors, onChange }) {
  return (
    <>
      <Field label="Full name" required error={errors.name}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="name"
            autoComplete="name"
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" required error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
            />
          )}
        </Field>

        <Field label="Phone" required error={errors.phone}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.phone}
              onChange={(event) => onChange('phone', event.target.value)}
            />
          )}
        </Field>
      </div>
    </>
  )
}
