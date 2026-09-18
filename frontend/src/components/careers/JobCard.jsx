import { ArrowRight } from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import JobMeta from './JobMeta'
import { cn } from '../../utils/cn'

/**
 * One open role, as it appears in the listing.
 *
 * Unlike every other card on this site, this one is **not** a single stretched
 * link. §35 asks the card for an Apply button, and an Apply button that lands
 * on the posting rather than on the form is the kind of thing a candidate only
 * discovers after filling the form in twice. So the card carries two explicit
 * targets pointing at two different places — the posting, and the form at the
 * bottom of it — and the title is plain text rather than a third link to the
 * same URL as the first button.
 */
export default function JobCard({ job, className }) {
  const href = `/careers/${job.slug}`

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card',
        'transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">{job.department}</Badge>
        {job.openings > 1 && (
          <Badge variant="accent">{job.openings} openings</Badge>
        )}
      </div>

      <h3 className="mt-4 text-lg leading-snug font-semibold text-brand-900">
        {job.title}
      </h3>

      <JobMeta job={job} className="mt-3" />

      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
        {job.shortDescription}
      </p>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        <Button to={href} variant="outline" size="sm" className="flex-1">
          Full posting
        </Button>
        <Button
          to={`${href}#apply`}
          variant="accent"
          size="sm"
          className="flex-1"
          iconRight={ArrowRight}
        >
          Apply now
        </Button>
      </div>
    </article>
  )
}
