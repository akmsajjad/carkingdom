import Rating from '../common/Rating'
import SectionHeading from '../common/SectionHeading'
import { TESTIMONIALS } from '../../data/testimonials'

/**
 * Customer reviews.
 *
 * The aggregate figure in `TESTIMONIAL_SUMMARY` is deliberately not rendered.
 * Quotes read as one customer's opinion, but "4.8 from 127 reviews" is a
 * specific factual claim about the business, and inventing it is the kind of
 * thing the Competition Act treats as a deceptive marketing practice. The
 * quotes themselves are placeholders too and are flagged as such in the data
 * file — replace both before this goes live.
 */
export default function Testimonials() {
  const shown = TESTIMONIALS.slice(0, 6)

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Reviews"
          title="What customers say"
          description="The complaints we hear about other dealerships are almost always the same three: surprise fees, pressure, and work that did not need doing. These are customers telling us we did none of that."
          align="center"
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((testimonial) => (
            <li
              key={testimonial.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <Rating value={testimonial.rating} size="sm" />

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <footer className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-brand-900">
                  {testimonial.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {testimonial.location} &middot; {testimonial.vehicle}
                </p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
