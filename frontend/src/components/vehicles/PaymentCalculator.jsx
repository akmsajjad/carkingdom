import { useId, useState } from 'react'
import Input from '../common/Input'
import Select from '../common/Select'
import { estimateMonthlyPayment, formatPrice } from '../../utils/format'

const TERMS = [
  { value: '24', label: '24 mo' },
  { value: '36', label: '36 mo' },
  { value: '48', label: '48 mo' },
  { value: '60', label: '60 mo' },
  { value: '72', label: '72 mo' },
  { value: '84', label: '84 mo' },
]

/** The rate behind every figure this calculator shows. Published here so the
 *  number in the UI and the number in the copy cannot drift apart. */
const APR = 8.9

/**
 * A quick payment estimator, sitting beside the price where the question
 * "what would this cost me a month?" actually occurs to someone.
 *
 * It is an estimate and says so, twice: once on the rate line and once in the
 * footnote. The alternative — no calculator, and a customer left to guess —
 * loses the enquiry; a calculator presented as a quote would be worse, because
 * it is the kind of number someone budgets against.
 */
export default function PaymentCalculator({ price, className }) {
  const [term, setTerm] = useState('60')
  const [down, setDown] = useState('')
  const downId = useId()
  const termId = useId()

  const downValue = Number(down)
  const hasDown = down.trim() !== '' && !Number.isNaN(downValue) && downValue >= 0

  const monthly = estimateMonthlyPayment(price, {
    months: Number(term),
    downPayment: hasDown ? downValue : undefined,
  })

  const tooMuch = hasDown && downValue >= price

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-brand-900">
        Estimate your payment
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor={downId} className="block text-xs font-medium text-slate-600">
            Down payment
          </label>
          <Input
            id={downId}
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            placeholder="10%"
            value={down}
            invalid={tooMuch}
            onChange={(event) => setDown(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={termId} className="block text-xs font-medium text-slate-600">
            Term
          </label>
          <Select
            id={termId}
            options={TERMS}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
        </div>
      </div>

      <p className="mt-3 flex items-baseline gap-2 border-t border-slate-100 pt-3">
        <span className="text-2xl font-bold text-brand-900 tabular-nums">
          {tooMuch ? '—' : `${formatPrice(monthly)}`}
        </span>
        <span className="text-sm text-slate-500">/ month</span>
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {tooMuch
          ? 'That down payment covers the full price — there would be nothing to finance.'
          : `Estimated at ${APR}% APR over ${term} months, before taxes and fees.`}
      </p>
    </div>
  )
}
