import {
  Banknote,
  Briefcase,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'

/**
 * The posting's terms, as a definition list for the sidebar panel.
 *
 * Separate from `JobMeta` rather than a variant of it because the two are
 * laid out differently on purpose: the card wants a single wrapped line, the
 * sidebar wants one fact per row with the label above it. The wage and hours
 * are long enough that they only ever appear here.
 *
 * `postedDate` is shown as an absolute date in this context. On the card
 * "Posted 9 days ago" is a freshness signal; on the posting itself, a candidate
 * comparing two roles wants to know which one went up first.
 */
export default function JobFacts({ job, className }) {
  const facts = [
    { icon: Banknote, label: 'Pay', value: job.wage },
    { icon: Clock, label: 'Hours', value: job.hours },
    { icon: Briefcase, label: 'Employment type', value: job.employmentType },
    { icon: MapPin, label: 'Location', value: job.location },
    {
      icon: Users,
      label: 'Openings',
      value: job.openings === 1 ? '1 position' : `${job.openings} positions`,
    },
    { icon: CalendarDays, label: 'Posted', value: formatDate(job.postedDate) },
  ]

  return (
    <dl className={cn('space-y-4', className)}>
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-3">
          <Icon
            className="mt-0.5 size-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {label}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-slate-700">
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
