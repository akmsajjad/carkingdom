// Explicit .js extension: `scripts/generate-placeholders.mjs` imports this file
// directly under plain Node to build the part images, and Node's ESM resolver —
// unlike Vite's — does not infer extensions.
import { partImage } from '../utils/images.js'

/**
 * The parts and accessories catalogue.
 *
 * This is the mock "database". Like `vehicles.js` it is intentionally shaped
 * like the JSON a Django REST endpoint would return, so `src/services/parts.js`
 * can swap its body from a local filter to an HTTP call without the UI
 * noticing.
 *
 * `category` values must match the footer's Parts column exactly — it links to
 * `/parts?category=Battery`, `Brakes`, `Engine`, `Electrical` and `Suspension`,
 * and each of those has to land on a non-empty result. `PART_CATEGORIES` below
 * is the single list both sides read, so the two cannot drift apart.
 *
 * The brands are invented. That is deliberate: the prices, stock levels and
 * ratings here are placeholders, and attaching a fabricated price to a real
 * manufacturer's part number would be a claim about that company rather than an
 * obvious piece of demo data. Swapping in the real brand list is a data edit —
 * replace `PART_BRANDS` and the `brand` on each part, and nothing in `src/`
 * changes. The same is true of every price and stock figure below.
 */

export const PART_BRANDS = ['Cobalt Works', 'Meridian', 'Northline', 'Prairie Forge']

export const PART_CATEGORIES = [
  'Battery',
  'Brakes',
  'Engine',
  'Electrical',
  'Suspension',
  'Filters',
  'Lighting',
  'Wipers',
  'Fluids & Chemicals',
]

/** Sort keys exposed to the UI, mapped to comparators in the service layer. */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Top rated' },
  { value: 'name-asc', label: 'Name: A to Z' },
]

/** Builds the derived fields, so each part below states only what is
 *  distinctive about it. `sku` is derived from the id when not given, which
 *  keeps the two from disagreeing. */
function definePart(spec) {
  const slug = `${spec.brand}-${spec.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return {
    ...spec,
    slug,
    sku: spec.sku ?? `CK-${spec.id.replace(/^ck-p-/, '')}`,
    image: partImage(slug),
    // The price a customer actually pays. `salePrice` wins when the part is
    // discounted, which is why the UI never reads `price` directly — the same
    // rule the vehicle cards follow.
    effectivePrice: spec.salePrice ?? spec.price,
    inStock: spec.stock > 0,
    // Universal parts fit anything; everything else lists the applications we
    // stock for. A part with no applications and no `universal` flag would be
    // unfittable, so `definePart` refuses to create one.
    universal: spec.universal === true,
  }
}

/**
 * Makes and models used in the fitment lists below — the same ones in the
 * inventory, so "does this fit my car" can be tried against a vehicle we
 * actually sell.
 */
export const PARTS = [
  // ----------------------------------------------------------------- Battery
  definePart({
    id: 'ck-p-2001',
    name: 'AGM Battery — Group 35, 640 CCA',
    brand: 'Northline',
    category: 'Battery',
    price: 229.95,
    salePrice: 199.95,
    stock: 8,
    rating: 4.7,
    reviewCount: 64,
    dateAdded: '2026-09-02',
    featured: true,
    warranty: '48-month free replacement',
    description:
      'Absorbent glass mat construction for vehicles with start-stop systems and a lot of electronics. Sealed, so it will not leak if it tips.',
    features: [
      '640 cold cranking amps',
      'Sealed AGM — no water to top up',
      'Built for start-stop and heavy electrical loads',
    ],
    specs: [
      { label: 'Group size', value: '35' },
      { label: 'Cold cranking amps', value: '640' },
      { label: 'Reserve capacity', value: '100 min' },
      { label: 'Terminal type', value: 'Top post' },
      { label: 'Weight', value: '18.6 kg' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
      { make: 'Mazda', model: 'CX-5', yearFrom: 2013, yearTo: 2017 },
    ],
  }),

  definePart({
    id: 'ck-p-2002',
    name: 'Standard Battery — Group 24F, 700 CCA',
    brand: 'Northline',
    category: 'Battery',
    price: 159.95,
    stock: 14,
    rating: 4.5,
    reviewCount: 118,
    dateAdded: '2026-07-18',
    warranty: '36-month free replacement',
    description:
      'The everyday flooded battery. Plenty of cranking power for a car without start-stop, at about two thirds the price of an AGM.',
    features: ['700 cold cranking amps', 'Maintenance-free', 'Group 24F — fits most Asian imports'],
    specs: [
      { label: 'Group size', value: '24F' },
      { label: 'Cold cranking amps', value: '700' },
      { label: 'Reserve capacity', value: '120 min' },
      { label: 'Terminal type', value: 'Top post' },
      { label: 'Weight', value: '17.2 kg' },
    ],
    applications: [
      { make: 'Toyota', model: 'Camry', yearFrom: 2012, yearTo: 2017 },
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
      { make: 'Nissan', model: 'Rogue', yearFrom: 2014, yearTo: 2018 },
      { make: 'Subaru', model: 'Forester', yearFrom: 2014, yearTo: 2018 },
    ],
  }),

  definePart({
    id: 'ck-p-2003',
    name: 'Deep Cycle Battery — Group 27, 850 CCA',
    brand: 'Prairie Forge',
    category: 'Battery',
    price: 289.95,
    stock: 4,
    rating: 4.6,
    reviewCount: 31,
    dateAdded: '2026-06-05',
    warranty: '24-month free replacement',
    description:
      'For trucks that run a winch, a plow, or a lot of accessories with the engine off. Tolerates being drawn down far more often than a starting battery.',
    features: ['850 cold cranking amps', 'Deep cycle plates', 'Heavy-duty vibration resistance'],
    specs: [
      { label: 'Group size', value: '27' },
      { label: 'Cold cranking amps', value: '850' },
      { label: 'Amp hours', value: '92 Ah' },
      { label: 'Terminal type', value: 'Dual post' },
      { label: 'Weight', value: '26.4 kg' },
    ],
    applications: [
      { make: 'Ford', model: 'F-150', yearFrom: 2011, yearTo: 2020 },
      { make: 'Chevrolet', model: 'Silverado 1500', yearFrom: 2014, yearTo: 2019 },
      { make: 'GMC', model: 'Sierra 1500', yearFrom: 2014, yearTo: 2019 },
    ],
  }),

  // ------------------------------------------------------------------ Brakes
  definePart({
    id: 'ck-p-2010',
    name: 'Ceramic Brake Pads — Front',
    brand: 'Meridian',
    category: 'Brakes',
    price: 89.95,
    stock: 22,
    rating: 4.8,
    reviewCount: 204,
    dateAdded: '2026-08-28',
    featured: true,
    warranty: '24-month / 40,000 km',
    description:
      'Low-dust ceramic compound that stops quietly and keeps alloy wheels clean. Includes the shims and hardware, not just the pads.',
    features: [
      'Ceramic compound — quiet, low dust',
      'Shims and abutment hardware included',
      'Slotted and chamfered for even wear',
    ],
    specs: [
      { label: 'Position', value: 'Front' },
      { label: 'Compound', value: 'Ceramic' },
      { label: 'Includes', value: 'Pads, shims, hardware' },
      { label: 'Pad thickness', value: '17 mm' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Toyota', model: 'Camry', yearFrom: 2012, yearTo: 2017 },
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
    ],
  }),

  definePart({
    id: 'ck-p-2011',
    name: 'Ceramic Brake Pads — Rear',
    brand: 'Meridian',
    category: 'Brakes',
    price: 79.95,
    stock: 18,
    rating: 4.7,
    reviewCount: 156,
    dateAdded: '2026-08-28',
    warranty: '24-month / 40,000 km',
    description:
      'The rear half of the same set. Worth doing at the same time as the fronts on a car that has done a full set of pads.',
    features: ['Ceramic compound', 'Shims and hardware included', 'Matched to the front compound'],
    specs: [
      { label: 'Position', value: 'Rear' },
      { label: 'Compound', value: 'Ceramic' },
      { label: 'Includes', value: 'Pads, shims, hardware' },
      { label: 'Pad thickness', value: '15 mm' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Toyota', model: 'Camry', yearFrom: 2012, yearTo: 2017 },
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
    ],
  }),

  definePart({
    id: 'ck-p-2012',
    name: 'Coated Brake Rotor — Front Pair',
    brand: 'Cobalt Works',
    category: 'Brakes',
    price: 164.95,
    salePrice: 144.95,
    stock: 9,
    rating: 4.6,
    reviewCount: 87,
    dateAdded: '2026-08-11',
    warranty: '24-month',
    description:
      'A matched pair, balanced and coated so the hats do not rust the first time it rains. Sold as a pair because a rotor should never be replaced on one side only.',
    features: ['Sold as a matched pair', 'Anti-corrosion coated hat and edges', 'Balanced to reduce vibration'],
    specs: [
      { label: 'Position', value: 'Front' },
      { label: 'Diameter', value: '296 mm' },
      { label: 'Thickness', value: '28 mm' },
      { label: 'Vented', value: 'Yes' },
      { label: 'Quantity', value: 'Pair' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Mazda', model: 'CX-5', yearFrom: 2013, yearTo: 2017 },
    ],
  }),

  definePart({
    id: 'ck-p-2013',
    name: 'Brake Caliper — Rear Left, Remanufactured',
    brand: 'Prairie Forge',
    category: 'Brakes',
    price: 189.95,
    stock: 3,
    rating: 4.4,
    reviewCount: 42,
    dateAdded: '2026-05-22',
    warranty: '24-month',
    description:
      'A remanufactured caliper — stripped, rebored and fitted with new seals. The core charge is refunded when the old one comes back.',
    features: ['Remanufactured to OEM specification', 'New seals and piston', 'Core charge refunded on return'],
    specs: [
      { label: 'Position', value: 'Rear left' },
      { label: 'Type', value: 'Remanufactured' },
      { label: 'Piston', value: 'Single' },
      { label: 'Bracket', value: 'Included' },
    ],
    applications: [
      { make: 'Ford', model: 'Escape', yearFrom: 2013, yearTo: 2019 },
      { make: 'Mazda', model: 'Mazda3', yearFrom: 2012, yearTo: 2018 },
    ],
  }),

  // ------------------------------------------------------------------ Engine
  definePart({
    id: 'ck-p-2020',
    name: 'Engine Air Filter',
    brand: 'Meridian',
    category: 'Engine',
    price: 34.95,
    stock: 31,
    rating: 4.8,
    reviewCount: 267,
    dateAdded: '2026-09-08',
    description:
      'The filter that actually affects fuel economy. Worth changing every 20,000 km, and a two-minute job on most of what is on the lot.',
    features: ['High-flow pleated media', 'Factory-fit seal', 'Change every 20,000 km'],
    specs: [
      { label: 'Type', value: 'Panel' },
      { label: 'Length', value: '285 mm' },
      { label: 'Width', value: '191 mm' },
      { label: 'Height', value: '48 mm' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2019 },
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
      { make: 'Hyundai', model: 'Elantra', yearFrom: 2014, yearTo: 2020 },
    ],
  }),

  definePart({
    id: 'ck-p-2021',
    name: 'Serpentine Belt',
    brand: 'Northline',
    category: 'Engine',
    price: 54.95,
    stock: 16,
    rating: 4.7,
    reviewCount: 93,
    dateAdded: '2026-07-30',
    warranty: '12-month',
    description:
      'Drives the alternator, water pump and air conditioning off one belt. If it squeals cold or has visible cracks between the ribs, it is due.',
    features: ['EPDM rubber — resists cracking', 'Exact-fit rib count', 'Sold singly'],
    specs: [
      { label: 'Rib count', value: '6' },
      { label: 'Effective length', value: '1,240 mm' },
      { label: 'Material', value: 'EPDM' },
    ],
    applications: [
      { make: 'Toyota', model: 'Camry', yearFrom: 2012, yearTo: 2017 },
      { make: 'Nissan', model: 'Sentra', yearFrom: 2013, yearTo: 2019 },
    ],
  }),

  definePart({
    id: 'ck-p-2022',
    name: 'Timing Belt Kit',
    brand: 'Cobalt Works',
    category: 'Engine',
    price: 249.95,
    stock: 5,
    rating: 4.9,
    reviewCount: 58,
    dateAdded: '2026-06-19',
    warranty: '24-month',
    description:
      'Belt, tensioner and idler together. On an interference engine a failed belt bends valves, so this is one job where the kit matters more than the belt.',
    features: ['Belt, tensioner and idler included', 'OEM-specification tooth profile', 'Water pump not included'],
    specs: [
      { label: 'Includes', value: 'Belt, tensioner, idler' },
      { label: 'Teeth', value: '197' },
      { label: 'Interval', value: 'Every 160,000 km' },
    ],
    applications: [
      { make: 'Subaru', model: 'Outback', yearFrom: 2010, yearTo: 2014 },
      { make: 'Subaru', model: 'Forester', yearFrom: 2011, yearTo: 2014 },
    ],
  }),

  definePart({
    id: 'ck-p-2023',
    name: 'Engine Mount — Front',
    brand: 'Prairie Forge',
    category: 'Engine',
    price: 119.95,
    stock: 7,
    rating: 4.5,
    reviewCount: 44,
    dateAdded: '2026-04-28',
    warranty: '24-month',
    description:
      'Rubber-and-steel mount. The usual symptom is a clunk through the floor when you pull away, or a vibration at idle that goes away with revs.',
    features: ['Rubber bonded to steel', 'Hydraulic-damped', 'Direct fit — no modification'],
    specs: [
      { label: 'Position', value: 'Front' },
      { label: 'Type', value: 'Hydraulic' },
      { label: 'Mounting', value: 'Bolt-on' },
    ],
    applications: [
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
    ],
  }),

  // -------------------------------------------------------------- Electrical
  definePart({
    id: 'ck-p-2030',
    name: 'Alternator — 130 A',
    brand: 'Northline',
    category: 'Electrical',
    price: 379.95,
    stock: 6,
    rating: 4.7,
    reviewCount: 71,
    dateAdded: '2026-08-05',
    featured: true,
    warranty: '24-month unlimited km',
    description:
      'New, not remanufactured. 130 amps covers a car with heated seats and a decent stereo without dimming the lights at idle.',
    features: ['New unit — no core charge', '130 amp output', 'Tested before dispatch'],
    specs: [
      { label: 'Output', value: '130 A' },
      { label: 'Voltage', value: '12 V' },
      { label: 'Pulley', value: '6-rib' },
      { label: 'Condition', value: 'New' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
    ],
  }),

  definePart({
    id: 'ck-p-2031',
    name: 'Starter Motor',
    brand: 'Cobalt Works',
    category: 'Electrical',
    price: 279.95,
    salePrice: 249.95,
    stock: 4,
    rating: 4.5,
    reviewCount: 52,
    dateAdded: '2026-07-11',
    warranty: '24-month',
    description:
      'A single click and no crank usually means the starter, not the battery. This is a new unit, so there is no core to send back.',
    features: ['New unit — no core charge', 'Solenoid included', 'Pre-greased and sealed'],
    specs: [
      { label: 'Power', value: '1.6 kW' },
      { label: 'Rotation', value: 'Clockwise' },
      { label: 'Teeth', value: '10' },
      { label: 'Condition', value: 'New' },
    ],
    applications: [
      { make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2019 },
      { make: 'Nissan', model: 'Sentra', yearFrom: 2013, yearTo: 2019 },
    ],
  }),

  definePart({
    id: 'ck-p-2032',
    name: 'Ignition Coil Pack',
    brand: 'Meridian',
    category: 'Electrical',
    price: 94.95,
    stock: 12,
    rating: 4.6,
    reviewCount: 139,
    dateAdded: '2026-08-21',
    warranty: '24-month',
    description:
      'A misfire on one cylinder that moves when you swap coils is a coil. Selling them singly means you replace the one that failed, not all four.',
    features: ['Sold singly', 'Epoxy-filled against vibration', 'Direct plug-in — no splicing'],
    specs: [
      { label: 'Type', value: 'Coil-on-plug' },
      { label: 'Primary resistance', value: '0.7 Ω' },
      { label: 'Quantity', value: 'Single' },
    ],
    applications: [
      { make: 'Hyundai', model: 'Elantra', yearFrom: 2014, yearTo: 2020 },
      { make: 'Kia', model: 'Forte', yearFrom: 2014, yearTo: 2018 },
      { make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2019 },
    ],
  }),

  definePart({
    id: 'ck-p-2033',
    name: 'Iridium Spark Plug',
    brand: 'Prairie Forge',
    category: 'Electrical',
    price: 18.95,
    stock: 64,
    rating: 4.9,
    reviewCount: 312,
    dateAdded: '2026-09-11',
    description:
      'Iridium tip, so it lasts about 100,000 km rather than 30,000. Priced each — most four-cylinder engines take four.',
    features: ['Iridium centre electrode', 'Pre-gapped from the factory', 'Sold each'],
    specs: [
      { label: 'Thread', value: 'M14 x 1.25' },
      { label: 'Reach', value: '26.5 mm' },
      { label: 'Gap', value: '1.1 mm (pre-set)' },
      { label: 'Quantity', value: 'Each' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
      { make: 'Mazda', model: 'Mazda3', yearFrom: 2012, yearTo: 2018 },
      { make: 'Hyundai', model: 'Tucson', yearFrom: 2016, yearTo: 2021 },
    ],
  }),

  // -------------------------------------------------------------- Suspension
  definePart({
    id: 'ck-p-2040',
    name: 'Front Strut Assembly — Pair',
    brand: 'Meridian',
    category: 'Suspension',
    price: 429.95,
    stock: 4,
    rating: 4.7,
    reviewCount: 66,
    dateAdded: '2026-07-25',
    featured: true,
    warranty: '36-month',
    description:
      'Complete assemblies — spring, strut and mount already together, so there is no spring compressor involved and the job is a couple of hours rather than most of a day.',
    features: ['Fully assembled — no spring compressor needed', 'New spring and mount included', 'Sold as a pair'],
    specs: [
      { label: 'Position', value: 'Front' },
      { label: 'Type', value: 'Complete assembly' },
      { label: 'Adjustable', value: 'No' },
      { label: 'Quantity', value: 'Pair' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
      { make: 'Subaru', model: 'Forester', yearFrom: 2014, yearTo: 2018 },
    ],
  }),

  definePart({
    id: 'ck-p-2041',
    name: 'Rear Shock Absorber — Pair',
    brand: 'Cobalt Works',
    category: 'Suspension',
    price: 219.95,
    salePrice: 189.95,
    stock: 8,
    rating: 4.6,
    reviewCount: 74,
    dateAdded: '2026-06-30',
    warranty: '36-month',
    description:
      'Gas-charged rear shocks. If the back end floats over a bump or the tires are cupping, these are usually why.',
    features: ['Gas charged', 'Twin-tube construction', 'Sold as a pair'],
    specs: [
      { label: 'Position', value: 'Rear' },
      { label: 'Type', value: 'Gas charged' },
      { label: 'Extended length', value: '612 mm' },
      { label: 'Quantity', value: 'Pair' },
    ],
    applications: [
      { make: 'Toyota', model: 'Sienna', yearFrom: 2011, yearTo: 2020 },
      { make: 'Kia', model: 'Sorento', yearFrom: 2016, yearTo: 2020 },
    ],
  }),

  definePart({
    id: 'ck-p-2042',
    name: 'Sway Bar Link Kit',
    brand: 'Northline',
    category: 'Suspension',
    price: 44.95,
    stock: 21,
    rating: 4.5,
    reviewCount: 108,
    dateAdded: '2026-08-14',
    warranty: '12-month',
    description:
      'The rattle over small bumps that sounds like it is coming from everywhere and nothing. Cheap part, quick job, and it stops.',
    features: ['Both sides included', 'Greased-for-life ball joints', 'New nuts and hardware'],
    specs: [
      { label: 'Position', value: 'Front' },
      { label: 'Length', value: '285 mm' },
      { label: 'Quantity', value: 'Pair' },
    ],
    applications: [
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
      { make: 'Mazda', model: 'Mazda3', yearFrom: 2012, yearTo: 2018 },
      { make: 'Nissan', model: 'Rogue', yearFrom: 2014, yearTo: 2018 },
    ],
  }),

  definePart({
    id: 'ck-p-2043',
    name: 'Control Arm — Lower Front',
    brand: 'Prairie Forge',
    category: 'Suspension',
    price: 168.95,
    stock: 6,
    rating: 4.4,
    reviewCount: 39,
    dateAdded: '2026-05-16',
    warranty: '24-month',
    description:
      'Comes with the ball joint and bushings already pressed in, which is most of the labour on this job.',
    features: ['Ball joint installed', 'Bushings installed', 'Sold singly'],
    specs: [
      { label: 'Position', value: 'Lower front' },
      { label: 'Ball joint', value: 'Included' },
      { label: 'Bushings', value: 'Included' },
      { label: 'Quantity', value: 'Each' },
    ],
    applications: [
      { make: 'Ford', model: 'Escape', yearFrom: 2013, yearTo: 2019 },
      { make: 'Mazda', model: 'CX-5', yearFrom: 2013, yearTo: 2017 },
    ],
  }),

  // ----------------------------------------------------------------- Filters
  definePart({
    id: 'ck-p-2050',
    name: 'Cabin Air Filter — Carbon',
    brand: 'Meridian',
    category: 'Filters',
    price: 39.95,
    stock: 27,
    rating: 4.8,
    reviewCount: 186,
    dateAdded: '2026-09-05',
    description:
      'Activated carbon, so it takes the smell of the car in front out of the air as well as the dust. Behind the glovebox on most vehicles.',
    features: ['Activated carbon layer', 'Removes odours and pollen', 'Change every 20,000 km'],
    specs: [
      { label: 'Type', value: 'Carbon panel' },
      { label: 'Length', value: '215 mm' },
      { label: 'Width', value: '200 mm' },
      { label: 'Height', value: '30 mm' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
      { make: 'Hyundai', model: 'Tucson', yearFrom: 2016, yearTo: 2021 },
      { make: 'Kia', model: 'Sportage', yearFrom: 2017, yearTo: 2021 },
    ],
  }),

  definePart({
    id: 'ck-p-2051',
    name: 'Oil Filter',
    brand: 'Northline',
    category: 'Filters',
    price: 16.95,
    stock: 48,
    rating: 4.9,
    reviewCount: 402,
    dateAdded: '2026-09-12',
    description:
      'Anti-drainback valve, so the top of the engine is not dry for the first second after a cold start.',
    features: ['Anti-drainback valve', 'Burst pressure 18 bar', 'Sold each'],
    specs: [
      { label: 'Thread', value: 'M20 x 1.5' },
      { label: 'Height', value: '86 mm' },
      { label: 'Outside diameter', value: '76 mm' },
      { label: 'Quantity', value: 'Each' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Toyota', model: 'Camry', yearFrom: 2012, yearTo: 2017 },
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
      { make: 'Mazda', model: 'Mazda3', yearFrom: 2012, yearTo: 2018 },
    ],
  }),

  definePart({
    id: 'ck-p-2052',
    name: 'Fuel Filter',
    brand: 'Cobalt Works',
    category: 'Filters',
    price: 42.95,
    stock: 11,
    rating: 4.4,
    reviewCount: 63,
    dateAdded: '2026-06-12',
    warranty: '12-month',
    description:
      'A restricted fuel filter shows up as a hesitation under load that clears when you lift off. Often missed, because it is not on the service schedule any more.',
    features: ['High-pressure rated', 'New seals included', 'Inline fitment'],
    specs: [
      { label: 'Type', value: 'Inline' },
      { label: 'Inlet', value: '10 mm' },
      { label: 'Outlet', value: '10 mm' },
    ],
    applications: [
      { make: 'Ford', model: 'Ranger', yearFrom: 2011, yearTo: 2019 },
      { make: 'Nissan', model: 'Rogue', yearFrom: 2014, yearTo: 2018 },
    ],
  }),

  // ---------------------------------------------------------------- Lighting
  definePart({
    id: 'ck-p-2060',
    name: 'LED Headlight Bulb Kit — H11',
    brand: 'Meridian',
    category: 'Lighting',
    price: 129.95,
    salePrice: 109.95,
    stock: 13,
    rating: 4.6,
    reviewCount: 221,
    dateAdded: '2026-08-19',
    warranty: '24-month',
    description:
      'A matched pair of LED bulbs with the driver modules and Canbus resistors included, so they do not throw a bulb warning. Sold as a pair.',
    features: ['Matched pair with drivers', 'Canbus-ready — no dash warning', '6,000 K colour'],
    specs: [
      { label: 'Bulb type', value: 'H11' },
      { label: 'Colour temperature', value: '6,000 K' },
      { label: 'Lumens', value: '4,000 lm per pair' },
      { label: 'Quantity', value: 'Pair' },
    ],
    applications: [
      { make: 'Toyota', model: 'RAV4', yearFrom: 2013, yearTo: 2018 },
      { make: 'Honda', model: 'CR-V', yearFrom: 2012, yearTo: 2016 },
      { make: 'Subaru', model: 'Outback', yearFrom: 2015, yearTo: 2019 },
    ],
  }),

  definePart({
    id: 'ck-p-2061',
    name: 'Halogen Headlight Bulb — 9005, Pair',
    brand: 'Northline',
    category: 'Lighting',
    price: 34.95,
    stock: 26,
    rating: 4.5,
    reviewCount: 174,
    dateAdded: '2026-07-08',
    description:
      'Standard halogen, sold as a pair. When one goes the other is usually weeks behind it, so replacing both saves doing the job twice.',
    features: ['Sold as a pair', 'Long-life filament', 'No modification needed'],
    specs: [
      { label: 'Bulb type', value: '9005' },
      { label: 'Colour temperature', value: '3,200 K' },
      { label: 'Voltage', value: '12 V' },
      { label: 'Quantity', value: 'Pair' },
    ],
    applications: [
      { make: 'Chevrolet', model: 'Equinox', yearFrom: 2010, yearTo: 2017 },
      { make: 'GMC', model: 'Sierra 1500', yearFrom: 2014, yearTo: 2019 },
      { make: 'Volkswagen', model: 'Tiguan', yearFrom: 2012, yearTo: 2018 },
    ],
  }),

  definePart({
    id: 'ck-p-2062',
    name: 'Tail Light Assembly — Rear Right',
    brand: 'Cobalt Works',
    category: 'Lighting',
    price: 214.95,
    stock: 2,
    rating: 4.3,
    reviewCount: 28,
    dateAdded: '2026-04-19',
    warranty: '12-month',
    description:
      'Complete assembly with the housing, lens and bulb sockets. For the car that failed a safety inspection on a cracked lens.',
    features: ['Complete assembly', 'Bulb sockets included', 'DOT and SAE marked'],
    specs: [
      { label: 'Position', value: 'Rear right' },
      { label: 'Type', value: 'Complete assembly' },
      { label: 'Bulbs included', value: 'No' },
    ],
    applications: [
      { make: 'Honda', model: 'Civic', yearFrom: 2012, yearTo: 2015 },
      { make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2019 },
    ],
  }),

  // ------------------------------------------------------------------ Wipers
  definePart({
    id: 'ck-p-2070',
    name: 'Beam Wiper Blade — 24 in',
    brand: 'Meridian',
    category: 'Wipers',
    price: 27.95,
    stock: 34,
    rating: 4.7,
    reviewCount: 298,
    dateAdded: '2026-09-09',
    description:
      'A beam blade rather than a conventional frame, so it keeps pressure on the glass at speed and does not lift. Priced each.',
    features: ['Beam construction — no frame to ice up', 'Pre-installed connector', 'Sold each'],
    specs: [
      { label: 'Length', value: '600 mm (24 in)' },
      { label: 'Type', value: 'Beam' },
      { label: 'Connector', value: 'Pinch tab' },
      { label: 'Quantity', value: 'Each' },
    ],
    universal: true,
  }),

  definePart({
    id: 'ck-p-2071',
    name: 'Winter Wiper Blade — 22 in',
    brand: 'Northline',
    category: 'Wipers',
    price: 32.95,
    stock: 19,
    rating: 4.8,
    reviewCount: 141,
    dateAdded: '2026-09-01',
    description:
      'Fully enclosed, so snow and ice cannot pack into the frame and stop it wiping. Worth having on from October in Saskatoon.',
    features: ['Enclosed frame — resists ice build-up', 'Rubber boot over the linkage', 'Sold each'],
    specs: [
      { label: 'Length', value: '550 mm (22 in)' },
      { label: 'Type', value: 'Winter beam' },
      { label: 'Connector', value: 'Pinch tab' },
      { label: 'Quantity', value: 'Each' },
    ],
    universal: true,
  }),

  // ------------------------------------------------------- Fluids & Chemicals
  definePart({
    id: 'ck-p-2080',
    name: 'Full Synthetic Motor Oil — 5W-30, 5 L',
    brand: 'Prairie Forge',
    category: 'Fluids & Chemicals',
    price: 64.95,
    salePrice: 54.95,
    stock: 37,
    rating: 4.9,
    reviewCount: 356,
    dateAdded: '2026-09-10',
    featured: true,
    description:
      'One jug is most of an oil change on a four-cylinder. Dexos1 Gen 3 approved, which is what the newer GM engines ask for.',
    features: ['Dexos1 Gen 3 approved', 'API SP / ILSAC GF-6A', '5 litre jug'],
    specs: [
      { label: 'Viscosity', value: '5W-30' },
      { label: 'Volume', value: '5 L' },
      { label: 'Specification', value: 'API SP, ILSAC GF-6A' },
      { label: 'Type', value: 'Full synthetic' },
    ],
    universal: true,
  }),

  definePart({
    id: 'ck-p-2081',
    name: 'Brake Fluid DOT 4 — 1 L',
    brand: 'Northline',
    category: 'Fluids & Chemicals',
    price: 14.95,
    stock: 42,
    rating: 4.7,
    reviewCount: 129,
    dateAdded: '2026-08-02',
    description:
      'Brake fluid absorbs water over time, which is what makes an old pedal feel soft. Worth flushing every two years.',
    features: ['DOT 4 specification', 'Dry boiling point 260 °C', 'Sealed foil cap'],
    specs: [
      { label: 'Specification', value: 'DOT 4' },
      { label: 'Volume', value: '1 L' },
      { label: 'Dry boiling point', value: '260 °C' },
      { label: 'Wet boiling point', value: '160 °C' },
    ],
    universal: true,
  }),

  definePart({
    id: 'ck-p-2082',
    name: 'Extended Life Coolant — 4 L',
    brand: 'Meridian',
    category: 'Fluids & Chemicals',
    price: 38.95,
    stock: 23,
    rating: 4.6,
    reviewCount: 97,
    dateAdded: '2026-07-03',
    description:
      'Pre-mixed, so it goes straight in without diluting. OAT chemistry, good for 240,000 km and safe with aluminium radiators.',
    features: ['Pre-mixed — no dilution needed', 'OAT chemistry', '240,000 km service life'],
    specs: [
      { label: 'Volume', value: '4 L' },
      { label: 'Chemistry', value: 'OAT' },
      { label: 'Colour', value: 'Orange' },
      { label: 'Service life', value: '240,000 km' },
    ],
    universal: true,
  }),

  definePart({
    id: 'ck-p-2083',
    name: 'Windshield Washer Fluid — -45 °C, 4 L',
    brand: 'Cobalt Works',
    category: 'Fluids & Chemicals',
    price: 12.95,
    stock: 56,
    rating: 4.8,
    reviewCount: 203,
    dateAdded: '2026-09-14',
    description:
      'Rated to -45 °C, which is what a Saskatchewan January actually asks for. Summer mix freezes in the lines and splits the reservoir.',
    features: ['Good to -45 °C', 'Safe on paint and rubber', '4 litre jug'],
    specs: [
      { label: 'Volume', value: '4 L' },
      { label: 'Freeze protection', value: '-45 °C' },
      { label: 'Contains methanol', value: 'Yes' },
    ],
    universal: true,
  }),
]

/** Derived so the footer's category links and the filter sidebar read the same
 *  list, in the same order. */
export const PRICE_BOUNDS = {
  min: Math.min(...PARTS.map((part) => part.effectivePrice)),
  max: Math.max(...PARTS.map((part) => part.effectivePrice)),
}

/** Every make and model any part is listed to fit, for the fitment picker. */
export const FITMENT_MAKES = [
  ...new Set(
    PARTS.flatMap((part) =>
      (part.applications ?? []).map((application) => application.make),
    ),
  ),
].sort()

export function modelsForMake(make) {
  if (!make) return []
  return [
    ...new Set(
      PARTS.flatMap((part) =>
        (part.applications ?? [])
          .filter((application) => application.make === make)
          .map((application) => application.model),
      ),
    ),
  ].sort()
}

/** The years any part covers for a given make and model, as a bounded range —
 *  the picker offers a span, not a list of part-specific year windows. */
export function yearsForVehicle(make, model) {
  if (!make || !model) return []
  const windows = PARTS.flatMap((part) =>
    (part.applications ?? []).filter(
      (application) =>
        application.make === make && application.model === model,
    ),
  )
  if (windows.length === 0) return []

  const from = Math.min(...windows.map((window) => window.yearFrom))
  const to = Math.max(...windows.map((window) => window.yearTo))
  const years = []
  for (let year = to; year >= from; year -= 1) years.push(year)
  return years
}
