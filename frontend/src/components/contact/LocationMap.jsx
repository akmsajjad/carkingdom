import { MapPin, Navigation } from 'lucide-react'
import Button from '../common/Button'
import { FULL_ADDRESS, SITE, mapEmbedUrl } from '../../data/site'

/**
 * §39's map section.
 *
 * An embedded Google Maps frame rather than a picture of a map, because the
 * thing a visitor does with it is work out how to get here — and a screenshot
 * cannot be dragged, zoomed or routed from. The address, the directions link and
 * the frame all come from `site.js`, so correcting the address moves the pin.
 *
 * `loading="lazy"` matters more here than anywhere else on the site: the embed
 * is a third-party document with its own scripts, and without it every visitor
 * to the contact page pays for it even though most of them scrolled past it.
 * `title` is not decoration — an iframe without one is announced as an unnamed
 * frame, which tells a screen-reader user nothing about what is inside it.
 */
export default function LocationMap({ className }) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-card">
        <iframe
          src={mapEmbedUrl()}
          title={`Map showing ${SITE.name} at ${FULL_ADDRESS}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-80 w-full border-0 sm:h-96"
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <address className="flex items-start gap-3 text-sm not-italic text-slate-600">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-accent-600"
            aria-hidden="true"
          />
          {FULL_ADDRESS}
        </address>

        <Button
          href={SITE.googleMapsUrl}
          variant="outline"
          icon={Navigation}
          rel="noreferrer noopener"
          target="_blank"
          className="shrink-0"
        >
          Get directions
        </Button>
      </div>
    </div>
  )
}
