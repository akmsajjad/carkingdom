import { Link, useParams } from 'react-router-dom'
import { BriefcaseBusiness, PhoneCall, Send } from 'lucide-react'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import PageHeader from '../components/common/PageHeader'
import { LoadingBlock } from '../components/common/Spinner'
import JobApplicationForm from '../components/careers/JobApplicationForm'
import JobFacts from '../components/careers/JobFacts'
import JobGrid from '../components/careers/JobGrid'
import JobSection from '../components/careers/JobSection'
import JobMeta from '../components/careers/JobMeta'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useHashScroll from '../hooks/useHashScroll'
import { getJobBySlug, getRelatedJobs } from '../services/careers'
import { MAILTO_HREF, SITE, TEL_HREF } from '../data/site'

/** §36's sections, in the order a candidate reads them: what the job is, what
 *  you would do, what you need, what you get. */
const SECTIONS = [
  { key: 'duties', title: 'Duties', marker: 'dot' },
  { key: 'responsibilities', title: 'Responsibilities', marker: 'dot' },
  { key: 'skills', title: 'Skills' },
  { key: 'qualifications', title: 'Qualifications' },
  { key: 'experience', title: 'Experience' },
  { key: 'benefits', title: 'Benefits' },
]

const HIRING_STEPS = [
  'We read it ourselves — usually within a week.',
  'A phone call with the department manager.',
  'A paid half-day on the floor with the team.',
  'An offer, and a start date that works for you.',
]

/**
 * One job posting.
 *
 * The application form lives on this page rather than in a dialog. A résumé
 * plus a cover letter is more than a modal comfortably holds, and an application
 * is the kind of thing people leave half-finished and come back to — which a
 * URL and a scroll position survive and a dialog does not.
 *
 * The form is reached by an in-page anchor, so a card's Apply button can point
 * at `#apply` directly. That deep link needs the effect below: `ScrollToTop`
 * runs as soon as the route changes, which is before the lazy chunk and the
 * request have produced the element it is looking for.
 */
export default function JobDetails() {
  const { slug } = useParams()

  const { data: job, loading, error, reload } = useAsync(
    () => getJobBySlug(slug),
    slug,
  )

  const { data: related = [], loading: relatedLoading } = useAsync(
    () => getRelatedJobs(slug, 2),
    slug,
  )

  useDocumentTitle(job?.title ?? 'Job')

  // Held until the posting has arrived: the `#apply` section is rendered from
  // `job`, so before the request resolves there is nothing to scroll to. See the
  // note in `useHashScroll` about why `ScrollToTop` alone is not enough here.
  useHashScroll(Boolean(job))

  if (loading && !job) {
    return (
      <div className="container-page py-20">
        <LoadingBlock label="Loading this role…" />
      </div>
    )
  }

  if (error) {
    const notFound = error.status === 404

    return (
      <>
        {/* Both branches keep a header so the page still has exactly one h1,
            which is what the route sweep checks and what a screen-reader user
            navigates by. */}
        <PageHeader
          eyebrow={notFound ? 'Not found' : 'Unavailable'}
          title={notFound ? 'That role is no longer open' : 'We couldn’t load this role'}
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Careers', to: '/careers' },
            { label: 'Role' },
          ]}
        />

        <div className="container-page py-12">
          {notFound ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="We've filled it, or the link is old"
              description="Postings come down as soon as a role is filled, so this one is probably gone. Everything still open is on the careers page — and we keep résumés on file for six months either way."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/careers">See all open roles</Button>
                  <Button
                    href={`${MAILTO_HREF}?subject=${encodeURIComponent('Application — Car Kingdom')}`}
                    variant="outline"
                  >
                    Email your résumé
                  </Button>
                </div>
              }
            />
          ) : (
            <ErrorState
              description={
                error.message ||
                'Something went wrong fetching this posting. Please try again.'
              }
              onRetry={reload}
            />
          )}
        </div>
      </>
    )
  }

  if (!job) return null

  return (
    <>
      <PageHeader
        eyebrow={job.department}
        title={job.title}
        description={job.shortDescription}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Careers', to: '/careers' },
          { label: job.title },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          {/* A plain anchor, not a router link: the target is on this page, so
              the browser's own hash scroll is both correct and instant. */}
          <Button href="#apply" variant="accent" icon={Send}>
            Apply now
          </Button>
          <Button to="/careers" variant="white">
            All open roles
          </Button>
        </div>
      </PageHeader>

      <div className="container-page py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-10">
            <JobMeta job={job} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" />

            <section>
              <h2 className="text-xl font-bold text-brand-900">Overview</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{job.overview}</p>
            </section>

            {SECTIONS.map(({ key, title, marker }) => (
              <JobSection
                key={key}
                title={title}
                items={job[key]}
                marker={marker}
              />
            ))}
          </div>

          {/* Sticky so the pay, the hours and the way to apply stay in view
              through eight sections of reading. */}
          <Card className="lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{job.department}</Badge>
              <Badge>{job.employmentType}</Badge>
            </div>

            <JobFacts job={job} className="mt-5" />

            <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
              <Button
                href="#apply"
                variant="accent"
                icon={Send}
                className="w-full"
              >
                Apply for this role
              </Button>
              <Button
                href={TEL_HREF}
                variant="outline"
                icon={PhoneCall}
                className="w-full"
                aria-label={`Call Car Kingdom about this role on ${SITE.phoneDisplay}`}
              >
                Questions? Call us
              </Button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h2 className="text-sm font-semibold text-brand-900">
                What happens next
              </h2>
              <ol className="mt-3 space-y-3">
                {HIRING_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800"
                    >
                      {index + 1}
                    </span>
                    <span className="leading-relaxed text-slate-600">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>

        <section id="apply" className="mt-16 scroll-mt-24">
          <div className="mx-auto max-w-3xl">
            {/* No heading or blurb here — `JobApplicationForm` renders its own,
                because the ones that belong to the form have to disappear with
                it once the application is sent. */}
            <Card>
              <JobApplicationForm defaultPosition={job.slug} />
            </Card>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-brand-900">
                Other roles we&rsquo;re hiring for
              </h2>
              <Link
                to="/careers"
                className="text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                See all open roles
              </Link>
            </div>

            <JobGrid
              jobs={related}
              loading={relatedLoading}
              skeletonCount={2}
              className="mt-8"
            />
          </section>
        )}
      </div>
    </>
  )
}
