/**
 * Service department offerings.
 *
 * `icon` is a name, not a component: keeping JSX out of data files is what lets
 * this list be replaced by a Django response without touching the UI. The
 * service-detail pages render every field here — `description`, `features` and
 * `symptoms` are the longer form; the homepage highlight uses only the short
 * ones.
 *
 * `image` is deliberately absent. Paths come from `serviceImage(slug)` in
 * `utils/images.js`, so replacing the placeholder art is a file drop and not a
 * data edit — the same rule the vehicle galleries follow.
 *
 * `duration` is what the customer reads; `durationHours` is the same job
 * rounded up to whole hours for scheduling, and is what stops the booking form
 * offering a four-hour detail at four in the afternoon. Two fields because they
 * answer two different questions — one is a range, the other has to be a number.
 *
 * The prices, the durations and the symptom lists are placeholders. They are
 * plausible for a Saskatoon shop in 2026 and they are internally consistent —
 * `durationHours` really does bound the booking slots — but nobody at Car
 * Kingdom supplied them and they should be replaced with the real figures
 * before this is shown to a customer.
 */

export const SERVICES = [
  {
    slug: 'oil-change',
    shortName: 'Oil Change',
    name: 'Oil & Filter Change',
    tagline: 'Conventional, synthetic blend, or full synthetic',
    description:
      'A proper oil change is twenty minutes of work and a fifteen-point look at everything else. We check the fluids, the belts, and the tire pressures while it drains, and we tell you what we find without inventing anything.',
    icon: 'oil',
    startingPrice: 69.95,
    duration: '30–45 min',
    durationHours: 1,
    features: [
      'Oil and filter replaced',
      'Fifteen-point visual inspection',
      'Fluid top-up included',
    ],
    symptoms: [
      'The service light is on, or the sticker date has passed',
      'The oil on the dipstick is dark or gritty',
      'The engine is noisier than it used to be',
    ],
  },
  {
    slug: 'brake-service',
    shortName: 'Brakes',
    name: 'Brake Repair & Replacement',
    tagline: 'Pads, rotors, calipers, and full brake lines',
    description:
      'Squealing, grinding, or a pedal that has gone soft — brakes are the one system where we will always show you the worn part before we replace it. Priced per axle, with the measurement written on the invoice.',
    icon: 'brake',
    startingPrice: 189,
    duration: '2–3 hours',
    durationHours: 3,
    features: [
      'Free brake inspection',
      'Pads and rotors replaced per axle',
      'Old parts shown on request',
    ],
    symptoms: [
      'Squealing or grinding when you brake',
      'The pedal feels soft, or sinks toward the floor',
      'The steering wheel shakes under braking',
    ],
  },
  {
    slug: 'tires',
    shortName: 'Tires & Balancing',
    name: 'Tires, Mounting & Balancing',
    tagline: 'Supply, install, balance, and align',
    description:
      'We stock all-season and winter tires for most makes, and we will match a price you have found elsewhere. Mounting and balancing are included, and we store seasonal sets for Saskatoon customers over the winter.',
    icon: 'tire',
    startingPrice: 89,
    duration: '1 hour',
    durationHours: 1,
    features: [
      'Mounting and balancing included',
      'Seasonal tire storage available',
      'Price matching on comparable tires',
    ],
    symptoms: [
      'Tread is at or below 3mm, or the wear bars are showing',
      'The car pulls to one side on a straight road',
      'A vibration through the wheel at highway speed',
    ],
  },
  {
    slug: 'diagnostics',
    shortName: 'Diagnostics',
    name: 'Diagnostics & Check Engine Light',
    tagline: 'Finding the fault, not guessing at it',
    description:
      'A check engine light is a symptom, not an answer. We read the codes, then test the circuit or component the code points to, so you pay for the repair you actually need instead of a list of maybes.',
    icon: 'diagnostics',
    startingPrice: 119,
    duration: '1–2 hours',
    durationHours: 2,
    features: [
      'Full OBD-II scan',
      'Component-level testing',
      'Written estimate before any work',
    ],
    symptoms: [
      'The check engine light is on, steady or flashing',
      'Rough idle, misfires, or a sudden drop in fuel economy',
      'The car failed its last emissions or safety check',
    ],
  },
  {
    slug: 'safety-inspection',
    shortName: 'Safety Inspections',
    name: 'Safety Inspections',
    tagline: 'Saskatchewan safety, and out-of-province',
    description:
      'Provincial safety inspections for private sales, out-of-province imports, and rebuilt vehicles. Licensed inspectors, same-week appointments, and a clear list of what has to be fixed before it will pass.',
    icon: 'inspection',
    startingPrice: 149,
    duration: '1–1.5 hours',
    durationHours: 2,
    features: [
      'Licensed provincial inspector',
      'Out-of-province and rebuilt vehicles',
      'Same-week appointments',
    ],
    symptoms: [
      'You are buying or selling a vehicle privately',
      'The car was registered outside Saskatchewan',
      'You have been told the vehicle needs a rebuilt inspection',
    ],
  },
  {
    slug: 'air-conditioning',
    shortName: 'A/C Service',
    name: 'A/C Service & Recharge',
    tagline: 'Recharge, leak test, and compressor repair',
    description:
      'Saskatchewan summers are short and hot, and an A/C that blows warm in July is not something to live with. We leak-test before we recharge, because a system that is low on refrigerant has a reason.',
    icon: 'ac',
    startingPrice: 159,
    duration: '1–2 hours',
    durationHours: 2,
    features: [
      'Leak test before recharge',
      'R134a and R1234yf',
      'Cabin filter replacement available',
    ],
    symptoms: [
      'Cold air only at speed, warm air in traffic',
      'A musty smell when the fan starts',
      'The system has not been serviced in several years',
    ],
  },
  {
    slug: 'engine-transmission',
    shortName: 'Engine & Transmission',
    name: 'Engine & Transmission Repair',
    tagline: 'Timing, clutches, cooling, and driveline work',
    description:
      'From a timing belt and water pump to a clutch or a transmission service, this is the work that keeps a high-mileage vehicle worth owning. We quote the job before we start it and we call you the moment it turns into a different job.',
    icon: 'engine',
    startingPrice: 129,
    duration: 'Varies by job',
    durationHours: 2,
    features: [
      'Timing belts, water pumps, and cooling systems',
      'Clutch and driveline repair',
      'Written estimate before any work',
    ],
    symptoms: [
      'A coolant leak, or the temperature gauge climbing',
      'The clutch slips, or the gears crunch',
      'A whine or rumble that changes with road speed',
    ],
  },
  {
    slug: 'detailing',
    shortName: 'Detailing',
    name: 'Detailing & Interior Cleaning',
    tagline: 'Inside, outside, and under the hood',
    description:
      'A full detail before a private sale, or a deep clean after a Saskatchewan winter. Hand wash, clay bar, machine polish, and an interior shampoo, with the salt rinsed out of the carpets and the door jambs.',
    icon: 'sparkle',
    startingPrice: 179,
    duration: '3–4 hours',
    durationHours: 4,
    features: [
      'Hand wash, clay bar, and machine polish',
      'Interior shampoo and salt removal',
      'Engine bay cleaning available',
    ],
    symptoms: [
      'Winter road salt has stained the carpets and mats',
      'The paint feels rough, or looks dull in sunlight',
      'You are selling the vehicle and want it to show well',
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
