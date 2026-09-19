import { BriefcaseBusiness } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import JobCard from './JobCard'
import { cn } from '../../utils/cn'

/**
 * The open-roles listing.
 *
 * Two columns rather than the three the service and parts grids use: a job
 * card carries a title that runs to two lines, four meta facts and a
 * description, and at three across on a laptop the two buttons in the footer
 * start wrapping onto separate rows.
 *
 * `emptyAction` is supplied by the page — the way out of an empty roles list
 * is the careers page's to decide, and it is the one place that knows where a
 * speculative application should go. Its only empty-capable call site is
 * `/careers`; the related strip on a job page is guarded and never renders it.
 */
const COLUMNS = 'grid gap-6 md:grid-cols-2'

export default function JobGrid({
  jobs = [],
  loading = false,
  skeletonCount = 4,
  emptyAction,
  className,
}) {
  if (loading && jobs.length === 0) {
    return (
      <div className={cn(COLUMNS, className)} aria-busy="true">
        <p role="status" className="sr-only">
          Loading open roles…
        </p>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="No roles open right now"
        description="We hire when we need to, not to keep a pipeline warm. Send us your résumé anyway — we keep them, and we call when something opens."
        action={emptyAction}
      />
    )
  }

  return (
    <div className={cn(COLUMNS, className)}>
      {jobs.map((job) => (
        <JobCard key={job.slug} job={job} />
      ))}
    </div>
  )
}
