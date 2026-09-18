import { CalendarCheck, Mail, PhoneCall } from 'lucide-react'
import Button from '../common/Button'
import { CONTACT_METHODS } from '../../data/contact'
import { MAILTO_HREF, SITE, TEL_HREF } from '../../data/site'

const ICONS = {
  phone: PhoneCall,
  mail: Mail,
  calendar: CalendarCheck,
}

/**
 * §39's three calls to action besides the form — call, email, appointment.
 *
 * Presented as three equal cards rather than as a row of buttons, because they
 * are alternatives rather than steps, and a visitor who does not want to fill in
 * a form should be able to see all three without reading the page.
 *
 * Each one's destination is decided here and its label and description come from
 * `data/contact.js`, which keeps the copy out of the component (§55) while
 * letting the hrefs stay next to the phone number and address they depend on.
 */
const ACTIONS = {
  call: { href: TEL_HREF, label: SITE.phoneDisplay, external: false },
  email: { href: MAILTO_HREF, label: SITE.email, external: false },
  appointment: {
    to: '/appointments',
    label: 'Book an appointment',
    external: false,
  },
}

export default function ContactMethods({ className }) {
  return (
    <ul className={className ?? 'grid gap-6 md:grid-cols-3'}>
      {CONTACT_METHODS.map(({ key, icon, title, description }) => {
        const Icon = ICONS[icon] ?? PhoneCall
        const action = ACTIONS[key]

        return (
          <li
            key={key}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50">
              <Icon className="size-5 text-brand-700" aria-hidden="true" />
            </span>

            <h3 className="mt-4 text-base font-semibold text-brand-900">
              {title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              {description}
            </p>

            <Button
              {...(action.to ? { to: action.to } : { href: action.href })}
              variant="outline"
              className="mt-5 w-full"
            >
              {action.label}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
