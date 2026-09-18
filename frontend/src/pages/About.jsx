import { Handshake, MapPin, Target, Telescope, Users } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import OptimizedImage from '../components/common/OptimizedImage'
import PageHeader from '../components/common/PageHeader'
import SectionHeading from '../components/common/SectionHeading'
import CompanyValues from '../components/about/CompanyValues'
import TeamGrid from '../components/about/TeamGrid'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useHashScroll from '../hooks/useHashScroll'
import {
  COMPANY_INTRO,
  COMPANY_STORY,
  MISSION,
  VISION,
} from '../data/company'
import { SITE } from '../data/site'
import { generalImage } from '../utils/images'

/**
 * §38. Our Company, Mission, Vision, Our Values, Our Team — in that order.
 *
 * Nothing here is fetched. These are facts about the business, and a dealership
 * that could not render its own About page without a round trip would be a
 * stranger arrangement than one that simply has the words.
 */
export default function About() {
  useDocumentTitle('About us')

  // The footer links to `/about#team`, and that link has to land on the team
  // rather than at the top of the page.
  useHashScroll()

  const facts = [
    {
      icon: Handshake,
      label: 'Family-run',
      value: `Since ${COMPANY_INTRO.founded}`,
    },
    {
      icon: Users,
      label: 'On the team',
      value: `${COMPANY_INTRO.employees} people`,
    },
    {
      icon: MapPin,
      label: 'Where',
      value: `${SITE.address.city}, ${SITE.address.province}`,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A small dealership on Dudley Street"
        description={COMPANY_INTRO.summary}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#team" variant="white">
            Meet the team
          </Button>
          <Button to="/contact" variant="accent">
            Come see us
          </Button>
        </div>
      </PageHeader>

      {/* Our Company */}
      <section id="company" className="container-page scroll-mt-24 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our company"
              title="Four vehicles and one rule"
              as="h2"
            />

            <div className="mt-6 space-y-4">
              {COMPANY_STORY.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-slate-600">
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <li
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    <Icon
                      className="size-3.5 text-accent-600"
                      aria-hidden="true"
                    />
                    {label}
                  </span>
                  <p className="mt-1 font-semibold text-brand-900">{value}</p>
                </li>
              ))}
            </ul>
          </div>

          <OptimizedImage
            src={generalImage('about')}
            alt={`The ${SITE.name} showroom on Dudley Street in Saskatoon`}
            category="general"
            className="aspect-4/3 rounded-2xl border border-slate-200 shadow-card"
          />
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-page py-16 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { icon: Target, eyebrow: 'Our mission', entry: MISSION },
              { icon: Telescope, eyebrow: 'Our vision', entry: VISION },
            ].map(({ icon: Icon, eyebrow, entry }) => (
              <Card key={eyebrow} className="flex flex-col p-6 sm:p-8">
                <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50">
                  <Icon className="size-5 text-brand-700" aria-hidden="true" />
                </span>

                <p className="mt-4 text-sm font-semibold tracking-wider text-accent-600 uppercase">
                  {eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-bold text-brand-900 sm:text-2xl">
                  {entry.statement}
                </h2>
                <p className="mt-4 leading-relaxed text-slate-600">
                  {entry.explanation}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <CompanyValues />

      {/* Our Team — the footer links straight to this heading. */}
      <section id="team" className="container-page scroll-mt-24 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Our team"
          title="The people you will actually deal with"
          description="Fourteen of us in total. These are the ones whose names you will learn, because they are the ones who answer the phone."
        />

        <TeamGrid className="mt-12" />

        <p className="mt-8 text-sm text-slate-500">
          Every one of them is on the floor on Dudley Street, not at a call centre
          somewhere else. If you would rather talk to a person than read a card,
          call{' '}
          <a
            href={`tel:${SITE.phone}`}
            className="font-medium text-brand-700 hover:text-brand-900"
          >
            {SITE.phoneDisplay}
          </a>
          .
        </p>
      </section>

      <section className="bg-brand-950">
        <div className="container-page flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Hiring, most years
            </h2>
            <p className="mt-2 max-w-xl leading-relaxed text-brand-100">
              We would rather train somebody who cares than hire somebody who
              already knows. Everything open right now is on the careers page.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button to="/careers" variant="accent">
              See open roles
            </Button>
            <Button to="/contact" variant="white">
              Contact us
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
