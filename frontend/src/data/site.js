/**
 * Business details, in one place.
 *
 * Contact information appears in the navbar, footer, every vehicle page, the
 * contact page, and the mobile action bar. Defining it once means a phone
 * number change is a one-line edit, not a find-and-replace across components.
 */

export const SITE = {
  name: 'Car Kingdom',
  tagline: 'Quality vehicles, honest service, and the parts you need.',
  website: 'https://carkingdom.ca',

  address: {
    street: '2435 Dudley St Unit 90',
    city: 'Saskatoon',
    province: 'SK',
    postalCode: 'S7M 3Z7',
    country: 'Canada',
  },

  // `phone` is the dial-safe form used in tel: links; `phoneDisplay` is what
  // people read.
  phone: '+16393849999',
  phoneDisplay: '+1 639-384-9999',
  email: 'info@carkingdom.ca',

  googleMapsUrl: 'https://maps.app.goo.gl/uxjEnynQ4kREMhwL7',

  // `days` and `time` are what customers read. `weekdays`, `open` and `close`
  // are the same facts in a form code can use, because the appointment and
  // test-drive pickers have to know which days are open and which hours are
  // bookable. Keeping both here means changing the hours on a sign changes the
  // booking form too — the alternative is a hardcoded slot list in a component
  // that quietly keeps offering 5pm on a Saturday after the lot starts closing
  // at 3.
  //
  // `weekdays` is JavaScript's `getDay()` numbering: 0 is Sunday.
  // `open`/`close` are 24-hour `HH:MM`, local time.
  hours: [
    {
      days: 'Monday – Friday',
      time: '9:00 AM – 6:00 PM',
      weekdays: [1, 2, 3, 4, 5],
      open: '09:00',
      close: '18:00',
    },
    {
      days: 'Saturday',
      time: '10:00 AM – 5:00 PM',
      weekdays: [6],
      open: '10:00',
      close: '17:00',
    },
    { days: 'Sunday', time: 'Closed', weekdays: [0], open: null, close: null },
  ],
}

export const FULL_ADDRESS = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.province} ${SITE.address.postalCode}, ${SITE.address.country}`

export const TEL_HREF = `tel:${SITE.phone}`
export const MAILTO_HREF = `mailto:${SITE.email}`

export function mapEmbedUrl() {
  const query = encodeURIComponent(
    `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.province} ${SITE.address.postalCode}`,
  )
  return `https://www.google.com/maps?q=${query}&output=embed`
}

/**
 * Saskatchewan combined GST + PST, used only for the cart's estimated total.
 * The UI labels every figure as an estimate — real tax is calculated at
 * checkout.
 */
export const TAX_RATE = 0.11
