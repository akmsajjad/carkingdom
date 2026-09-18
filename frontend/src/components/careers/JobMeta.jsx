import { Briefcase, CalendarDays, MapPin, Users } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatRelativeDate } from '../../utils/format'

/**
 * The line of facts under a job title: employment type, location, when it was
 * posted, and how many seats are open.
 *
 * Shared by the job card and the posting itself so the two can never disagree
 * about where the job is — the card promising "on site" while the posting says
 * "remote" is a mistake nobody catches by reading either one alone.
 *
 * The department is deliberately absent: it renders as a badge on both, and a
 * fact stated twice reads as two facts.
 */
export default function JobMeta({ job, className }) {
  const posted = formatRelativeDate(job.postedDate)

  const items = [
    { icon: Briefcase, text: job.employmentType },
    { icon: MapPin, text: job.location },
    posted && {
      icon: CalendarDays,
      // `formatRelativeDate` capitalises for sentence position ("Today",
      // "Last week"); here it follows the word "Posted", so the capital goes.
      text: `Posted ${posted.charAt(0).toLowerCase()}${posted.slice(1)}`,
    },
    job.openings > 1 && { icon: Users, text: `${job.openings} openings` },
  ].filter(Boolean)

  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600',
        className,
      )}
    >
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-1.5">
          <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  )
}
