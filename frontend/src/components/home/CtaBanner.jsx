import { Mail, PhoneCall } from 'lucide-react'
import Button from '../common/Button'
import { MAILTO_HREF, SITE, TEL_HREF } from '../../data/site'

/**
 * The closing call to action.
 *
 * Both buttons are real destinations — the phone number dials and the message
 * goes to the contact form — because a banner whose only button does nothing is
 * the most common way a finished-looking page turns out not to be.
 */
export default function CtaBanner() {
  return (
    <section className="bg-accent-500">
      <div className="container-page py-12 sm:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl text-brand-950">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Not sure what you are looking for yet?
            </h2>
            <p className="mt-3 leading-relaxed">
              Tell us your budget and what you need the vehicle to do. We will
              call you when something lands on the lot that fits — no
              obligation, and no pressure to buy the first thing we show you.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Button href={TEL_HREF} variant="primary" icon={PhoneCall}>
              {SITE.phoneDisplay}
            </Button>
            <Button
              href={MAILTO_HREF}
              variant="outline"
              icon={Mail}
              aria-label={`Email us at ${SITE.email}`}
            >
              Send a message
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
