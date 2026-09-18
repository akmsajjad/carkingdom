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

/**
 * Loose URL test. Accepts `linkedin.com/in/someone` and
 * `https://portfolio.example.ca` alike — a candidate who types their profile
 * without the scheme has still given us a usable link, and we prepend `https://`
 * when we render it.
 */
const URL_LIKE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#][^\s]*)?$/i

export function isFilled(value) {
  return String(value ?? '').trim().length > 0
}

export function isUrl(value) {
  return URL_LIKE.test(String(value).trim())
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

/**
 * The résumé upload rules.
 *
 * Live here rather than inside the dropzone because the same rules have to hold
 * in two places: the dropzone checks a file the moment it is chosen, and the
 * form checks it again on submit. Two copies of "5 MB" is how a form ends up
 * accepting a file it will later reject.
 */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024
const RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']

/** Returns an error message, or null when the file is acceptable. */
export function validateResumeFile(file) {
  if (!file) return 'Please attach your résumé.'

  const name = String(file.name ?? '').toLowerCase()
  if (!RESUME_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return 'Please attach a PDF, DOC or DOCX file.'
  }

  if (file.size > RESUME_MAX_BYTES) {
    return 'That file is over 5 MB. Please attach a smaller one.'
  }

  return null
}
