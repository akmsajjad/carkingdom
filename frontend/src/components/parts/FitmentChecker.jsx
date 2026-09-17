import { useEffect, useState } from 'react'
import { CheckCircle2, Search, TriangleAlert } from 'lucide-react'
import Button from '../common/Button'
import Field from '../common/Field'
import Select from '../common/Select'
import { cn } from '../../utils/cn'
import { SITE, TEL_HREF } from '../../data/site'
import {
  checkFitment,
  getFitmentMakes,
  getFitmentModels,
  getFitmentYears,
} from '../../services/parts'

/**
 * "Does this fit my car?" — the question the parts counter answers twenty times
 * a day, and the one a catalogue page has to answer before anyone will add a
 * part to a cart.
 *
 * The three pickers cascade, and each one clears the ones below it. Changing
 * the make while a model from the previous make is still selected would let a
 * customer submit "Toyota Camry" against a list of Ford models — a combination
 * that is not merely unfittable but incoherent, and one that would come back
 * with a confident wrong answer.
 *
 * The answer is fetched rather than computed here, because whether a part fits
 * is a property of the fitment catalogue and not of the part object. That is
 * also what makes it survive the move to Django: the endpoint does the work.
 */
export default function FitmentChecker({ part, className }) {
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])
  const [years, setYears] = useState([])

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')

  const [result, setResult] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    let cancelled = false
    getFitmentMakes().then((list) => {
      if (!cancelled) setMakes(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleMake = async (value) => {
    setMake(value)
    setModel('')
    setYear('')
    setYears([])
    setResult(null)
    setModels(value ? await getFitmentModels(value) : [])
  }

  const handleModel = async (value) => {
    setModel(value)
    setYear('')
    setResult(null)
    setYears(value ? await getFitmentYears(make, value) : [])
  }

  const handleYear = (value) => {
    setYear(value)
    setResult(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setChecking(true)
    try {
      setResult(await checkFitment(part.slug, { make, model, year }))
    } finally {
      setChecking(false)
    }
  }

  const complete = make && model && year

  return (
    <section
      aria-labelledby="fitment-heading"
      className={cn(
        'rounded-xl border border-slate-200 bg-slate-50/60 p-5',
        className,
      )}
    >
      <h2
        id="fitment-heading"
        className="flex items-center gap-2 text-base font-semibold text-brand-900"
      >
        <Search className="size-4 text-slate-400" aria-hidden="true" />
        Will this fit my vehicle?
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Pick your vehicle and we will check it against the fitment list for this
        part.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Make">
          {({ id }) => (
            <Select
              id={id}
              value={make}
              onChange={(event) => handleMake(event.target.value)}
              placeholder="Select a make"
              options={makes}
            />
          )}
        </Field>

        <Field label="Model">
          {({ id }) => (
            <Select
              id={id}
              value={model}
              onChange={(event) => handleModel(event.target.value)}
              placeholder={make ? 'Select a model' : 'Choose a make first'}
              options={models}
              disabled={!make}
            />
          )}
        </Field>

        <Field label="Year">
          {({ id }) => (
            <Select
              id={id}
              value={year}
              onChange={(event) => handleYear(event.target.value)}
              placeholder={model ? 'Select a year' : 'Choose a model first'}
              options={years}
              disabled={!model}
            />
          )}
        </Field>

        <div className="sm:col-span-3">
          <Button type="submit" icon={Search} loading={checking} disabled={!complete}>
            Check fitment
          </Button>
        </div>
      </form>

      {/* `aria-live` rather than a bare div: the answer appears below a button
          the customer just pressed, and without it a screen-reader user gets
          no indication that anything happened. */}
      <div aria-live="polite" className="mt-4">
        {result && (
          <div
            className={cn(
              'flex items-start gap-2.5 rounded-lg border p-3.5 text-sm',
              result.fits
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900',
            )}
          >
            {result.fits ? (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
            ) : (
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0 text-amber-600"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="font-semibold">
                {result.fits ? 'Fits your vehicle' : 'We could not confirm a fit'}
              </p>
              <p className="mt-0.5">{result.message}</p>
              {!result.fits && (
                <p className="mt-1.5 text-amber-800">
                  Call the parts counter at{' '}
                  <a
                    href={TEL_HREF}
                    className="font-semibold underline underline-offset-2"
                  >
                    {SITE.phoneDisplay}
                  </a>{' '}
                  with your VIN and we will match it exactly.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
