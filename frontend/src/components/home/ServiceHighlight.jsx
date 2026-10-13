import { ArrowRight, CalendarCheck } from 'lucide-react'
import Button from '../common/Button'
import SectionHeading from '../common/SectionHeading'
import ServiceGrid from '../services/ServiceGrid'
import { FEATURED_SERVICE_SLUGS, SERVICES } from '../../data/services'

const HIGHLIGHTED = FEATURED_SERVICE_SLUGS.map((slug) =>
  SERVICES.find((service) => service.slug === slug),
).filter(Boolean)

/**
 * The homepage's service-department section.
 *
 * This band used to be the one dark block between the white Featured Vehicles
 * grid and the two `slate-50` sections below it, and it carried its own inverted
 * card for that reason — the shared `ServiceCard` is white and could not sit on
 * navy without a `tone` prop that would have put two colour schemes in one
 * component. Now that the band is light, that reason is gone, so it uses
 * `ServiceGrid` like every other service list in the application and the
 * hand-written card is deleted. The photograph, the crop, the alt text, the
 * lazy loading and the hover treatment are all the shared card's, which means
 * they are also the ones already exercised on `/services`.
 *
 * `showIcon={false}` because the picture is the point here: the card's icon tile
 * earns its place in the catalogue, where it gives a scannable shape to a list
 * of nine similar rows, but under a photograph it is a second, smaller picture
 * of the same subject.
 *
 * The background is a light blue-grey wash rather than a flat fill, and it is
 * deliberately borderless: the two sections either side already draw the rules
 * that meet it — `WhyChooseUs` has `border-y` above and `Testimonials` has
 * `border-t` below — so a border here would land a second 1px line on top of
 * each of them. The wash alone is the seam.
 */
export default function ServiceHighlight() {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-brand-100">
      <div className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Service department"
            title="We fix them too"
            description="Our own shop on Dudley Street handles everything from an oil change to a provincial safety inspection. Booked online, done the same week."
            className="max-w-2xl"
          />

          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Button to="/services" variant="outline" iconRight={ArrowRight}>
              All services
            </Button>
            <Button to="/appointments" variant="accent" icon={CalendarCheck}>
              Book appointment
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <ServiceGrid services={HIGHLIGHTED} columns={4} showIcon={false} />
        </div>
      </div>
    </section>
  )
}
