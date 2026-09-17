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

  hours: [
    { days: 'Monday – Friday', time: '9:00 AM – 6:00 PM' },
    { days: 'Saturday', time: '10:00 AM – 5:00 PM' },
    { days: 'Sunday', time: 'Closed' },
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
