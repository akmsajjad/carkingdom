/**
 * Service department offerings.
 *
 * `icon` is a name, not a component: keeping JSX out of data files is what lets
 * this list be replaced by a Django response without touching the UI. The
 * service-detail pages in Phase 4 extend these entries — the fields here are
 * the ones the homepage highlight needs, and `description` and `features` are
 * already the longer form those pages will render.
 */

export const SERVICES = [
  {
    slug: 'oil-change',
    name: 'Oil & Filter Change',
    tagline: 'Conventional, synthetic blend, or full synthetic',
    description:
      'A proper oil change is twenty minutes of work and a fifteen-point look at everything else. We check the fluids, the belts, and the tire pressures while it drains, and we tell you what we find without inventing anything.',
    icon: 'oil',
    startingPrice: 69.95,
    duration: '30–45 min',
    features: [
      'Oil and filter replaced',
      'Fifteen-point visual inspection',
      'Fluid top-up included',
    ],
  },
  {
    slug: 'brake-service',
    name: 'Brake Repair & Replacement',
    tagline: 'Pads, rotors, calipers, and full brake lines',
    description:
      'Squealing, grinding, or a pedal that has gone soft — brakes are the one system where we will always show you the worn part before we replace it. Priced per axle, with the measurement written on the invoice.',
    icon: 'brake',
    startingPrice: 189,
    duration: '2–3 hours',
    features: [
      'Free brake inspection',
      'Pads and rotors replaced per axle',
      'Old parts shown on request',
    ],
  },
  {
    slug: 'tires',
    name: 'Tires, Mounting & Balancing',
    tagline: 'Supply, install, balance, and align',
    description:
      'We stock all-season and winter tires for most makes, and we will match a price you have found elsewhere. Mounting and balancing are included, and we store seasonal sets for Saskatoon customers over the winter.',
    icon: 'tire',
    startingPrice: 89,
    duration: '1 hour',
    features: [
      'Mounting and balancing included',
      'Seasonal tire storage available',
      'Price matching on comparable tires',
    ],
  },
  {
    slug: 'diagnostics',
    name: 'Diagnostics & Check Engine Light',
    tagline: 'Finding the fault, not guessing at it',
    description:
      'A check engine light is a symptom, not an answer. We read the codes, then test the circuit or component the code points to, so you pay for the repair you actually need instead of a list of maybes.',
    icon: 'diagnostics',
    startingPrice: 119,
    duration: '1–2 hours',
    features: [
      'Full OBD-II scan',
      'Component-level testing',
      'Written estimate before any work',
    ],
  },
  {
    slug: 'safety-inspection',
    name: 'Safety Inspections',
    tagline: 'Saskatchewan safety, and out-of-province',
    description:
      'Provincial safety inspections for private sales, out-of-province imports, and rebuilt vehicles. Licensed inspectors, same-week appointments, and a clear list of what has to be fixed before it will pass.',
    icon: 'inspection',
    startingPrice: 149,
    duration: '1–1.5 hours',
    features: [
      'Licensed provincial inspector',
      'Out-of-province and rebuilt vehicles',
      'Same-week appointments',
    ],
  },
  {
    slug: 'air-conditioning',
    name: 'A/C Service & Recharge',
    tagline: 'Recharge, leak test, and compressor repair',
    description:
      'Saskatchewan summers are short and hot, and an A/C that blows warm in July is not something to live with. We leak-test before we recharge, because a system that is low on refrigerant has a reason.',
    icon: 'ac',
    startingPrice: 159,
    duration: '1–2 hours',
    features: [
      'Leak test before recharge',
      'R134a and R1234yf',
      'Cabin filter replacement available',
    ],
  },
]

/** The subset the homepage highlights, in the order it shows them. */
export const FEATURED_SERVICE_SLUGS = [
  'oil-change',
  'brake-service',
  'tires',
  'diagnostics',
]

export function getServiceBySlug(slug) {
  return SERVICES.find((service) => service.slug === slug) ?? null
}
