import { CalendarCheck, ClipboardList, PhoneCall } from 'lucide-react'

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Pick a service and a time',
    description:
      'The times you see are ones we can actually start the job at, based on how long it takes.',
  },
  {
    icon: PhoneCall,
    title: 'We confirm with you',
    description:
      'A call or an email within one business day to lock the time in and check the details.',
  },
  {
    icon: ClipboardList,
    title: 'Bring it in',
    description:
      'We inspect it, quote anything we find before we start, and call you if the job changes.',
  },
]

/**
 * The three steps between booking and the vehicle being on the hoist.
 *
 * Shown on the catalogue and again beside the booking form, because the two
 * audiences differ: someone browsing wants to know it is easy, someone filling
 * in a form wants to know what happens next.
 */
export default function BookingSteps({ className }) {
  return (
    <ol className={className}>
      {STEPS.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-800">
              {index + 1}
            </span>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="w-px flex-1 bg-slate-200"
              />
            )}
          </div>

          <div className={index < STEPS.length - 1 ? 'pb-6' : undefined}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-900">
              <step.icon className="size-4 text-accent-600" aria-hidden="true" />
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
