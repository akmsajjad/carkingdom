import { Mail, PhoneCall, UserPlus } from 'lucide-react'
import Button from '../components/common/Button'
import ErrorState from '../components/common/ErrorState'
import OptimizedImage from '../components/common/OptimizedImage'
import PageHeader from '../components/common/PageHeader'
import SectionHeading from '../components/common/SectionHeading'
import JobGrid from '../components/careers/JobGrid'
import WhyWorkWithUs from '../components/careers/WhyWorkWithUs'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getJobs } from '../services/careers'
import { CAREER_OVERVIEW } from '../data/careers'
import { careerImage } from '../utils/images'
import { MAILTO_HREF, SITE, TEL_HREF } from '../data/site'

/** Where "email us your résumé" goes. A subject line saves the hiring manager
 *  from opening an attachment called `resume.pdf` with no idea which role it
 *  is for. */
const RESUME_MAILTO = `${MAILTO_HREF}?subject=${encodeURIComponent('Application — Car Kingdom')}`

/**
 * Careers.
 *
 * Three answers in the order a candidate wants them: what is this place like,
 * why would I stay, and what is actually open. The third one is the only thing
 * most visitors came for, which is why it is a jump link away from the top and
 * why the roles are sorted newest first rather than by department.
 */
export default function Careers() {
  useDocumentTitle('Careers')

  const { data: jobs, loading, error, reload } = useAsync(() => getJobs())

  const openCount = jobs?.length ?? 0

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Work at Car Kingdom"
        description="A fourteen-person dealership and service centre on Dudley Street. We hire slowly, we train properly, and we keep people — two of our technicians started here as apprentices."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Careers' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#openings" variant="accent" icon={UserPlus}>
            See open roles
          </Button>
          <Button
            href={RESUME_MAILTO}
            variant="white"
            icon={Mail}
            aria-label={`Email your résumé to ${SITE.email}`}
          >
            Email your résumé
          </Button>
        </div>
      </PageHeader>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Career overview"
              title={CAREER_OVERVIEW.heading}
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              {CAREER_OVERVIEW.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <div className="aspect-4/3">
              <OptimizedImage
                src={careerImage('join-our-team')}
                alt="The Car Kingdom team in the service bay on Dudley Street"
                category="careers"
                eager
              />
            </div>
          </div>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAREER_OVERVIEW.facts.map(({ value, label }) => (
            <li
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card"
            >
              <p className="text-3xl font-bold text-brand-900">{value}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <WhyWorkWithUs />

      <section id="openings" className="container-page scroll-mt-24 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Open positions"
          title={
            openCount > 0
              ? `${openCount} ${openCount === 1 ? 'role' : 'roles'} open right now`
              : // Not "Roles open right now". At zero that heading asserts there
                // are openings, immediately above a grid saying there are none —
                // and the section's own copy promises every posting is a real
                // one, so a visitor who sees the contradiction has reason to
                // doubt the postings that do appear.
                'No roles open at the moment'
          }
          description="Every posting below is a real opening with a real start date — we are not collecting résumés. Each one lists the pay, the hours and what the job actually involves."
        />

        {/* `loading` is handed to the grid rather than branched on here. The
            page used a full-width spinner above the grid, which made the
            grid's own `skeletonCount` unreachable — four job-card skeletons
            were written and then never rendered. The skeletons are also the
            better answer: the page does not jump when the roles arrive,
            because the placeholder is already the shape of a job card. */}
        {error ? (
          <ErrorState
            className="mt-10"
            title="We couldn't load the open roles"
            description={
              error.message || 'The job listings are unavailable right now.'
            }
            onRetry={reload}
          />
        ) : (
          <JobGrid
            jobs={jobs ?? []}
            loading={loading}
            skeletonCount={4}
            className="mt-10"
            emptyAction={
              <Button href={RESUME_MAILTO} variant="outline" icon={Mail}>
                Email your résumé
              </Button>
            }
          />
        )}
      </section>

      <section className="bg-brand-950">
        <div className="container-page py-12 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Nothing here that fits?
              </h2>
              <p className="mt-3 leading-relaxed text-brand-100">
                Send us your résumé anyway and tell us what you are good at. We
                keep applications on file for six months and we call when
                something opens — several people here were hired that way.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:shrink-0">
              <Button href={RESUME_MAILTO} variant="accent" icon={Mail}>
                Email {SITE.email}
              </Button>
              <Button
                href={TEL_HREF}
                variant="white"
                icon={PhoneCall}
                aria-label={`Call Car Kingdom on ${SITE.phoneDisplay}`}
              >
                {SITE.phoneDisplay}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
