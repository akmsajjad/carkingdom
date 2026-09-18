/**
 * Display formatting, in one place.
 *
 * Currency and number output goes through `Intl` rather than string
 * concatenation so thousands separators and the Canadian dollar format are
 * correct without hand-rolled logic.
 */

const CURRENCY = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

/** Service and parts prices carry cents; vehicle prices do not. */
const CURRENCY_EXACT = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const INTEGER = new Intl.NumberFormat('en-CA')

const DECIMAL = new Intl.NumberFormat('en-CA', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** $34,995 */
export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return CURRENCY.format(Number(value))
}

/** $69.95 — rounded to the dollar, a $69.95 oil change and a $70 one look like
 *  different prices to the customer, and only one of them is true. */
export function formatPriceExact(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return CURRENCY_EXACT.format(Number(value))
}

/** 41,200 */
export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return INTEGER.format(Number(value))
}

/** 41,200 km */
export function formatMileage(km) {
  if (km == null) return '—'
  return `${INTEGER.format(Number(km))} km`
}

/** 9.1 L/100km */
export function formatFuelEconomy(value) {
  if (value == null) return '—'
  return `${DECIMAL.format(Number(value))} L/100km`
}

/** Roughly what a vehicle costs per month, for the "from $X/mo" hint.
 *  A real payment depends on rate, term and down payment — the UI always
 *  labels this an estimate.
 *
 *  `downPayment` is an absolute amount. Omit it and 10% is assumed, which is
 *  the figure the vehicle cards and the marketplace show. */
export function estimateMonthlyPayment(
  price,
  { months = 60, rate = 0.089, downPayment } = {},
) {
  if (!price) return null

  const down = downPayment == null ? Number(price) * 0.1 : Number(downPayment)
  const principal = Number(price) - down

  // Nothing to finance — a fully-covered purchase has no monthly payment, and
  // the annuity formula below would otherwise divide by zero at 0 months.
  if (principal <= 0) return 0
  if (!months || months <= 0) return null

  const monthlyRate = rate / 12
  const payment =
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  return Math.round(payment)
}

/** September 4, 2026 */
export function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** "3 days ago" — coarse on purpose; an exact timestamp adds nothing here. */
export function formatRelativeDate(iso) {
  if (!iso) return ''
  const then = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(then.getTime())) return ''

  const days = Math.round((Date.now() - then.getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return 'Last week'
  if (days < 60) return `${Math.round(days / 7)} weeks ago`
  return formatDate(iso)
}

/** Formats a VIN or stock number for display without pretending to validate it. */
export function formatCode(value) {
  return value ? String(value).toUpperCase() : '—'
}

/** 2.4 MB — the size a person recognises, not the byte count a browser reports.
 *  Deliberately no decimal for anything under 10 KB, where "0.0 KB" would be
 *  less informative than "512 B". */
export function formatFileSize(bytes) {
  const size = Number(bytes)
  if (!Number.isFinite(size) || size < 0) return '—'
  if (size < 1024) return `${size} B`

  const kb = size / 1024
  if (kb < 1000) return `${Math.round(kb)} KB`

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
