/**
 * Field validation for the lead forms.
 *
 * Kept as plain predicates rather than a schema library: the rules are few and
 * a dependency would be more code to read than the rules themselves. The
 * messages are written as sentences addressed to the customer, because they are
 * the only feedback they get when a submission is refused.
 *
 * Date and opening-hours rules are deliberately NOT here — they live in
 * `scheduling.js`, which is the only module that knows when the shop is open.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isFilled(value) {
  return String(value ?? '').trim().length > 0
}

export function isEmail(value) {
  return EMAIL.test(String(value).trim())
}

/**
 * North American phone number, judged on digit count alone.
 *
 * Deliberately loose. A customer who types `(639) 384-9999`, `639-384-9999` or
 * `+1 639 384 9999` has given us a usable number in all three cases, and
 * rejecting a valid international number is a worse failure than accepting a
 * typo we would have caught on the call anyway.
 */
export function isPhone(value) {
  const digits = String(value).replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

/**
 * The name, email and phone rules every lead form shares.
 *
 * Returns a map of field name to message, empty when the values are good. The
 * three forms differ in what else they ask; they never differ in this.
 */
export function validateContact({ name, email, phone }) {
  const errors = {}

  if (!isFilled(name)) {
    errors.name = 'Please enter your name.'
  }

  if (!isFilled(email)) {
    errors.email = 'Please enter your email address.'
  } else if (!isEmail(email)) {
    errors.email = 'That email address does not look right.'
  }

  if (!isFilled(phone)) {
    errors.phone = 'Please enter a phone number so we can reach you.'
  } else if (!isPhone(phone)) {
    errors.phone = 'Please enter a phone number with at least 10 digits.'
  }

  return errors
}
