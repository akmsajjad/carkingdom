import { Link, useLocation } from 'react-router-dom'
import { CalendarCheck, MessageSquare, Phone } from 'lucide-react'
import { SITE, TEL_HREF } from '../../data/site'
import { scrollBehavior } from '../../utils/scroll'

const CELL =
  'flex flex-col items-center justify-center gap-1 text-xs font-semibold text-brand-900 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500'

/**
 * One cell of the bar.
 *
 * Renders a `Link`, or a `button` when the destination is the page the visitor
 * is already on — see the note on `MobileCta` for why that case needs handling
 * rather than being left as a link to here.
 */
function CtaCell({ to, anchor, icon: Icon, label, ariaLabel, className = CELL }) {
  const { pathname } = useLocation()

  const content = (
    <>
      <Icon className="size-5 text-accent-600" aria-hidden="true" />
      {label}
    </>
  )

  if (pathname !== to) {
    return (
      <Link to={to} aria-label={ariaLabel} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-current="page"
      onClick={() => {
        // The element is looked up by id rather than held in a ref, because the
        // page that owns it is not this component's to reach into.
        const target = anchor ? document.getElementById(anchor) : null
        const destination = target ?? document.getElementById('main-content')
        // Falling back to the top of `main` matters: an anchor that is missing
        // would otherwise scroll nowhere, which is the dead press this whole
        // branch exists to remove.
        destination?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
      }}
      className={className}
    >
      {content}
    </button>
  )
}

/**
 * The global bottom bar on phones.
 *
 * Three things a dealership site exists to produce — a phone call, a message,
 * and a booked appointment. On a small screen the header's contact strip is the
 * first thing to go, and this keeps all three within a thumb's reach from
 * anywhere on the site without routing through the menu.
 *
 * Deliberately quiet: no filled button, no colour beyond the icons, one border.
 * It is a persistent fixture, and anything louder would compete with the page
 * content it is meant to sit under. Its height is a theme token, because the
 * shell reserves the same amount of padding so the footer is not left behind
 * it — and because the toast stack is offset by it. All three come from
 * `--spacing-mobile-cta`, so they cannot drift apart.
 *
 * `z-40`, matching the header and the vehicle action bar, keeps it under the
 * toast stack at `z-50`: a confirmation briefly overlapping the bar is better
 * than a confirmation hidden behind it.
 *
 * Message goes to the contact form rather than a `mailto:`. A mail link is a
 * dead end on a phone with no mail client configured, and the form is the one
 * of the two that always works — and the email address is still a real mailto
 * wherever it is shown in full.
 *
 * ## A link to the page you are already on
 *
 * Message and Appointment both point at pages this bar sits on, and there the
 * link did nothing at all: the URL was already the target, the viewport did not
 * move, and pressing it looked broken. The bar is on every page, so this is not
 * a corner case — it is the contact page's own Message button, on the one page
 * a visitor most wants it to work.
 *
 * `CtaCell` turns those two into buttons that scroll to what they name —
 * `#contact-form` there, and the top of `main` for the appointment page, which
 * has no single anchor worth jumping to. `aria-current="page"` marks them
 * either way, so the cells that behave differently are the ones announced as
 * the current page.
 *
 * Every cell carries an `aria-label`. On their own "Message" and "Appointment"
 * are reasonable names, but a screen-reader user listing the links on a page
 * meets "Call Car Kingdom on (639) 384-9999", then "Message", then
 * "Appointment" — three items whose weight is carried entirely by the icon for
 * everyone else. Naming all three the same way is the point.
 */
export default function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm lg:hidden">
      <nav
        aria-label="Quick contact"
        className="h-mobile-cta grid grid-cols-3 divide-x divide-slate-200"
      >
        <a
          href={TEL_HREF}
          aria-label={`Call ${SITE.name} on ${SITE.phoneDisplay}`}
          className={CELL}
        >
          <Phone className="size-5 text-accent-600" aria-hidden="true" />
          Call
        </a>

        <CtaCell
          to="/contact"
          anchor="contact-form"
          icon={MessageSquare}
          label="Message"
          ariaLabel="Send us a message"
        />

        <CtaCell
          to="/appointments"
          icon={CalendarCheck}
          label="Appointment"
          ariaLabel="Book a service appointment"
        />
      </nav>
    </div>
  )
}
