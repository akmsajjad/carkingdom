import { Clock, Mail, MapPin, PhoneCall } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import OpeningHours from '../components/common/OpeningHours'
import PageHeader from '../components/common/PageHeader'
import ContactForm from '../components/contact/ContactForm'
import ContactMethods from '../components/contact/ContactMethods'
import LocationMap from '../components/contact/LocationMap'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { FULL_ADDRESS, MAILTO_HREF, SITE, TEL_HREF } from '../data/site'

/**
 * §39. Business information, the enquiry form, a map, opening hours, and the
 * call / email / appointment routes out.
 *
 * The business details sit in a column beside the form rather than under it.
 * Somebody who came here to find the phone number should not have to scroll past
 * a form to get it, and somebody who came to write a message should be able to
 * see that calling is also an option while they are deciding.
 */
export default function Contact() {
  useDocumentTitle('Contact us')

  const details = [
    {
      icon: MapPin,
      label: 'Visit',
      value: FULL_ADDRESS,
      href: SITE.googleMapsUrl,
      external: true,
    },
    {
      icon: PhoneCall,
      label: 'Call',
      value: SITE.phoneDisplay,
      href: TEL_HREF,
      external: false,
    },
    {
      icon: Mail,
      label: 'Email',
      value: SITE.email,
      href: MAILTO_HREF,
      external: false,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to Car Kingdom"
        description="Call, email, write to us, or just drive in. Somebody is at the desk from open to close, and the person who picks up can usually answer the question."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button href={TEL_HREF} variant="accent" icon={PhoneCall}>
            {SITE.phoneDisplay}
          </Button>
          <Button to="/appointments" variant="white">
            Book an appointment
          </Button>
        </div>
      </PageHeader>

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
          {/* The id is the target for the mobile bar's Message button while it
              is already on this page — see `MobileCta`. `scroll-mt-24` keeps
              the card clear of the sticky header when it is scrolled to. */}
          <Card id="contact-form" className="scroll-mt-24 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-900">
              Send us a message
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We read these ourselves and reply within one business day. If it
              cannot wait, call instead — the form does not ring.
            </p>

            <div className="mt-6">
              <ContactForm />
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="text-sm font-semibold text-brand-900">
                Direct lines
              </h2>
              <ul className="mt-4 space-y-4">
                {details.map(({ icon: Icon, label, value, href, external }) => (
                  <li key={label}>
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      <Icon
                        className="size-3.5 text-accent-600"
                        aria-hidden="true"
                      />
                      {label}
                    </p>
                    <a
                      href={href}
                      {...(external
                        ? { target: '_blank', rel: 'noreferrer noopener' }
                        : {})}
                      className="mt-1 block text-sm leading-relaxed text-slate-700 hover:text-brand-800"
                    >
                      {value}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                <Clock className="size-4 text-accent-600" aria-hidden="true" />
                Opening hours
              </h2>
              <OpeningHours className="mt-4" />

              <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
                Closed on statutory holidays. Service drop-off starts at opening,
                and the last appointment of the day is one hour before close.
              </p>
            </Card>

            <Card tone="muted">
              <h2 className="text-sm font-semibold text-brand-900">
                Sales, service or parts?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Ask for the department when you call and you will be put straight
                through. For parts, having the VIN ready saves a round trip.
              </p>
              <Button
                to="/services"
                variant="outline"
                className="mt-4 w-full"
              >
                See what the shop does
              </Button>
            </Card>
          </div>
        </div>

        {/* Three ways in that are not the form. */}
        <section className="mt-16 scroll-mt-24">
          <ContactMethods />

          <LocationMap className="mt-16" />
        </section>
      </div>
    </>
  )
}
