import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import Logo from '../common/Logo'
import { FOOTER_SECTIONS } from '../../data/navigation'
import { FULL_ADDRESS, MAILTO_HREF, SITE, TEL_HREF } from '../../data/site'

/**
 * The site footer: a brand column carrying the contact details, plus the four
 * link columns defined in `data/navigation.js`.
 *
 * There are deliberately no social-media icons here. No social accounts were
 * supplied for this business, and inventing profile URLs would produce links
 * that 404 — worse than not offering them. "Get Directions" points at the
 * Google Maps listing we do have.
 */
export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-950 text-slate-300">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo variant="light" />

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              {SITE.tagline}
            </p>

            <address className="mt-6 space-y-3 text-sm not-italic">
              <p className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-accent-400"
                  aria-hidden="true"
                />
                <span>{FULL_ADDRESS}</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-accent-400" aria-hidden="true" />
                <a
                  href={TEL_HREF}
                  className="transition-colors hover:text-white"
                >
                  {SITE.phoneDisplay}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-accent-400" aria-hidden="true" />
                <a
                  href={MAILTO_HREF}
                  className="transition-colors hover:text-white"
                >
                  {SITE.email}
                </a>
              </p>
            </address>

            <a
              href={SITE.googleMapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Get directions
            </a>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav
              key={section.title}
              aria-label={section.title}
              className="lg:col-span-2"
            >
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.to}-${link.label}`}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Clock className="size-4 text-accent-400" aria-hidden="true" />
            Hours
          </h2>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            {SITE.hours.map((entry) => (
              <div key={entry.days} className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                <dt className="text-slate-400">{entry.days}</dt>
                <dd className="font-medium text-slate-200">{entry.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>
            Prices exclude GST and PST. Taxes and fees are estimated and
            confirmed at the time of sale.
          </p>
        </div>
      </div>
    </footer>
  )
}
