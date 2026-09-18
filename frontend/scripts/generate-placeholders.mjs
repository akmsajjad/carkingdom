/**
 * Generates the SVG placeholder images under `public/images/`.
 *
 * The site needs a distinct-looking image for every vehicle, service, part,
 * team member and job. Hand-authoring those is unmaintainable and committing a
 * hundred near-identical files is worse, so they are produced from the small
 * definitions below — and the vehicle galleries are read straight from
 * `src/data/vehicles.js`, so adding a vehicle and running `npm run images`
 * is all it takes.
 *
 * The generated files ARE committed — `public/` is served as-is, so there is no
 * build step at runtime. Re-run after editing data or a definition:
 *
 *     npm run images
 *
 * When real photography arrives, drop the files into the same paths and delete
 * the matching entry here; nothing in `src/` needs to change.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VEHICLES } from '../src/data/vehicles.js'
import { SERVICES } from '../src/data/services.js'
import { PARTS } from '../src/data/parts.js'
import { TEAM } from '../src/data/team.js'

const OUTPUT_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'images',
)

const WIDTH = 800
const HEIGHT = 600

/** A side-view car, used for the vehicles category and every vehicle gallery. */
const carGlyph = (stroke) => `
  <g transform="translate(0, -10)">
    <path d="M150 372 L150 330 Q150 308 172 306 L246 300 L300 242 Q312 228 330 228 L470 228 Q488 228 500 242 L554 300 L628 306 Q650 308 650 330 L650 372 Z"
          fill="${stroke}" fill-opacity="0.14" stroke="${stroke}" stroke-width="14" stroke-linejoin="round"/>
    <circle cx="248" cy="376" r="46" fill="none" stroke="${stroke}" stroke-width="14"/>
    <circle cx="552" cy="376" r="46" fill="none" stroke="${stroke}" stroke-width="14"/>
  </g>`

/** Steering wheel, used for the "Interior" frame of a vehicle gallery. */
const interiorGlyph = (stroke) => `
  <g transform="translate(0, -10)" fill="none" stroke="${stroke}" stroke-width="14"
     stroke-linecap="round" stroke-linejoin="round">
    <circle cx="400" cy="330" r="130"/>
    <circle cx="400" cy="330" r="42"/>
    <path d="M270 330 L358 330"/><path d="M442 330 L530 330"/>
    <path d="M400 372 L400 460"/>
  </g>`

const GLYPHS = {
  vehicles: carGlyph('#2c5f9e'),

  services: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M470 190 L520 240 L452 308 L402 258 Z"/>
      <path d="M424 286 L214 496 Q196 514 178 496 Q160 478 178 460 L388 250"/>
      <path d="M232 442 L286 496"/>
    </g>`,

  parts: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linejoin="round">
      <circle cx="400" cy="330" r="104"/>
      <circle cx="400" cy="330" r="38"/>
      <g stroke-linecap="round">
        <path d="M400 226 L400 176"/><path d="M400 484 L400 434"/>
        <path d="M504 330 L554 330"/><path d="M246 330 L296 330"/>
        <path d="M474 256 L509 221"/><path d="M291 439 L326 404"/>
        <path d="M474 404 L509 439"/><path d="M291 221 L326 256"/>
      </g>
    </g>`,

  team: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <circle cx="400" cy="264" r="76"/>
      <path d="M256 512 Q256 396 400 396 Q544 396 544 512"/>
    </g>`,

  careers: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linejoin="round">
      <rect x="196" y="286" width="408" height="220" rx="22"/>
      <path d="M330 286 L330 250 Q330 232 348 232 L452 232 Q470 232 470 250 L470 286"/>
      <path d="M196 372 L604 372"/>
      <path d="M368 372 L368 400 Q368 412 380 412 L420 412 Q432 412 432 400 L432 372"/>
    </g>`,

  general: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M212 400 L188 244 L296 322 L400 220 L504 322 L612 244 L588 400 Z"/>
      <path d="M212 452 L588 452"/>
    </g>`,
}

/** Maps the `exteriorColor` strings in the inventory to something paintable,
 *  so a red Civic does not render identically to a white one. */
const PAINT = {
  'Magnetic Gray Metallic': '#6b6f72',
  'Platinum White Pearl': '#dfe3e6',
  'Agate Black': '#2a2d31',
  'Summit White': '#e4e7ea',
  'Fluid Metal': '#8f959b',
  'Gravity Blue': '#2f5480',
  'Soul Red Crystal': '#a3172a',
  'Autumn Green Metallic': '#3f5245',
  'Gun Metallic': '#5c6165',
  'Deep Black Pearl': '#26282c',
  'Predawn Gray Mica': '#7b8085',
  'Lunar Silver Metallic': '#a9afb4',
  'Iconic Silver': '#b3b8bd',
  'Amazon Grey': '#4a5450',
  'Snow White Pearl': '#e8ebee',
  'Sterling Gray Metallic': '#7d8388',
  'Machine Grey Metallic': '#6e7377',
  'Onyx Black': '#282b2f',
  'Crystal White Pearl': '#e6e9ec',
  'Scarlet Ember': '#a8283a',
  'Celestial Silver Metallic': '#a8aeb3',
  'Rallye Red': '#c8102e',
  'Lightning Blue': '#1f5fa8',
}

/** What each frame of a vehicle gallery is meant to show. */
const GALLERY_FRAMES = [
  'Front view',
  'Side profile',
  'Interior',
  'Rear view',
  'Wheels & trim',
  'Dashboard',
  'Cargo area',
  'Engine bay',
]

/**
 * Escapes text for XML.
 *
 * This is load-bearing, not hygiene. An SVG served as `image/svg+xml` is parsed
 * as XML, where a bare `&` is a well-formedness error that kills the whole
 * document — so `Oil & Filter Change` did not produce a slightly wrong label, it
 * produced a file the browser refused to decode at all. Thirty-two of them:
 * seven of the eight service images, and the "Wheels & trim" frame of every
 * vehicle gallery.
 *
 * Nothing looked broken, because `OptimizedImage` catches the error and swaps in
 * the category default. Every page rendered, just quietly with the wrong
 * picture — which is why this survived two phases of testing.
 */
function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function svg({ category, label, sublabel, stroke, glyph }) {
  const body = glyph ?? GLYPHS[category] ?? GLYPHS.general
  const title = escapeXml(label)
  const subtitle = escapeXml(sublabel)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eff5fb"/>
      <stop offset="1" stop-color="#d7e5f5"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="16" y="16" width="${WIDTH - 32}" height="${HEIGHT - 32}" rx="20"
        fill="none" stroke="${stroke ?? '#2c5f9e'}" stroke-opacity="0.18" stroke-width="2"/>
  ${body}
  <text x="${WIDTH / 2}" y="500" text-anchor="middle"
        font-family="Inter, Segoe UI, system-ui, sans-serif" font-size="26"
        font-weight="600" fill="#33475f">${title}</text>
  <text x="${WIDTH / 2}" y="536" text-anchor="middle"
        font-family="Inter, Segoe UI, system-ui, sans-serif" font-size="19"
        fill="#6b7d92">${subtitle}</text>
</svg>
`
}

/**
 * Files to write. `default.svg` in every category is mandatory — it is what
 * `OptimizedImage` falls back to when an image is missing or fails to load.
 */
const STATIC_FILES = [
  // Required fallbacks, one per category in src/utils/images.js
  { path: 'general/default.svg', category: 'general', label: 'Car Kingdom', sublabel: 'Saskatoon, Saskatchewan' },
  { path: 'vehicles/default.svg', category: 'vehicles', label: 'Vehicle photo coming soon', sublabel: '' },
  { path: 'services/default.svg', category: 'services', label: 'Service', sublabel: 'Car Kingdom' },
  { path: 'parts/default.svg', category: 'parts', label: 'Part', sublabel: 'Car Kingdom' },
  { path: 'team/default.svg', category: 'team', label: 'Team member', sublabel: 'Car Kingdom' },
  { path: 'careers/default.svg', category: 'careers', label: 'Car Kingdom careers', sublabel: 'Join the team' },

  // Shared general imagery
  { path: 'general/hero.svg', category: 'vehicles', label: 'Car Kingdom Saskatoon', sublabel: 'Quality vehicles, honest service' },
  { path: 'general/showroom.svg', category: 'general', label: 'Our showroom', sublabel: '2435 Dudley St, Saskatoon' },
  { path: 'general/service-bay.svg', category: 'services', label: 'Our service bay', sublabel: 'Certified technicians' },
  { path: 'general/parts-counter.svg', category: 'parts', label: 'Our parts counter', sublabel: 'Genuine and aftermarket' },
  { path: 'general/about.svg', category: 'team', label: 'About Car Kingdom', sublabel: 'Locally owned in Saskatoon' },

  // Careers. The job postings themselves carry no photograph — §35 and §36 ask
  // the cards and the posting for text, and a stock picture of a handshake
  // above every opening would be noise. The category exists for this one image.
  { path: 'careers/join-our-team.svg', category: 'team', label: 'Join the team', sublabel: 'Fourteen people on Dudley Street' },
]

/**
 * One glyph per service, keyed by the `icon` name in `src/data/services.js`.
 *
 * The generic spanner in `GLYPHS.services` is the fallback. Without these the
 * catalogue is six identical pictures of a wrench, which reads as a broken page
 * rather than as placeholder art.
 */
const SERVICE_GLYPHS = {
  oil: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M400 176 Q492 292 492 358 A92 92 0 1 1 308 358 Q308 292 400 176 Z"/>
      <path d="M356 372 Q356 420 400 420"/>
    </g>`,

  brake: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linejoin="round">
      <circle cx="386" cy="330" r="126"/>
      <circle cx="386" cy="330" r="44"/>
      <path d="M520 236 L600 236 L600 424 L520 424 Z" stroke-linecap="round"/>
      <g stroke-linecap="round">
        <path d="M386 204 L386 286"/><path d="M386 374 L386 456"/>
        <path d="M260 330 L342 330"/><path d="M430 330 L512 330"/>
      </g>
    </g>`,

  tire: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <circle cx="400" cy="330" r="150"/>
      <circle cx="400" cy="330" r="66"/>
      <g stroke-width="12">
        <path d="M400 180 L400 264"/><path d="M400 396 L400 480"/>
        <path d="M250 330 L334 330"/><path d="M466 330 L550 330"/>
        <path d="M294 224 L353 283"/><path d="M447 377 L506 436"/>
        <path d="M506 224 L447 283"/><path d="M353 377 L294 436"/>
      </g>
    </g>`,

  diagnostics: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M228 438 A172 172 0 1 1 572 438"/>
      <path d="M400 438 L492 306"/>
      <circle cx="400" cy="438" r="20"/>
      <g stroke-width="12">
        <path d="M244 372 L272 366"/><path d="M400 268 L400 296"/>
        <path d="M556 372 L528 366"/>
      </g>
    </g>`,

  inspection: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M286 232 L256 232 Q236 232 236 252 L236 500 Q236 520 256 520 L544 520 Q564 520 564 500 L564 252 Q564 232 544 232 L514 232"/>
      <rect x="322" y="190" width="156" height="66" rx="18"/>
      <path d="M296 356 L348 408 L500 268"/>
    </g>`,

  ac: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <g stroke-width="13">
        <path d="M400 190 L400 470"/>
        <path d="M279 260 L521 400"/><path d="M521 260 L279 400"/>
        <path d="M400 246 L362 208"/><path d="M400 246 L438 208"/>
        <path d="M400 414 L362 452"/><path d="M400 414 L438 452"/>
      </g>
    </g>`,

  engine: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M262 268 L262 240 L478 240 L478 268 L538 268 L538 420 L478 420 L478 448 L262 448 L262 420 L216 420 L216 268 Z"/>
      <g stroke-width="12">
        <path d="M306 194 L306 240"/><path d="M366 194 L366 240"/><path d="M426 194 L426 240"/>
      </g>
    </g>`,

  sparkle: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M356 200 Q356 300 256 300 Q356 300 356 400 Q356 300 456 300 Q356 300 356 200 Z"/>
      <path d="M528 336 Q528 396 468 396 Q528 396 528 456 Q528 396 588 396 Q528 396 528 336 Z"/>
      <path d="M244 420 Q244 470 194 470 Q244 470 244 520 Q244 470 294 470 Q244 470 244 420 Z"/>
    </g>`,
}

/**
 * One glyph per part category, keyed by the `category` in `src/data/parts.js`.
 *
 * Keyed by category rather than by part, unlike the service glyphs: there are
 * thirty-odd parts and hand-authoring thirty-odd distinct drawings would be a
 * lot of placeholder art that real photography deletes. Parts within a category
 * share a drawing, and the label under it names the actual product — "Meridian
 * Ceramic Brake Pads — Front" over a rotor reads as a catalogue, not as a bug.
 *
 * `Brakes` and `Engine` reuse the service glyphs, which are already the right
 * pictures.
 */
const PART_GLYPHS = {
  Brakes: SERVICE_GLYPHS.brake,
  Engine: SERVICE_GLYPHS.engine,

  Battery: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <rect x="248" y="252" width="304" height="216" rx="22"/>
      <path d="M318 252 L318 212 L374 212 L374 252"/>
      <path d="M426 252 L426 212 L482 212 L482 252"/>
      <g stroke-width="13">
        <path d="M296 330 L352 330"/>
        <path d="M448 330 L504 330"/><path d="M476 302 L476 358"/>
      </g>
    </g>`,

  Electrical: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <circle cx="400" cy="330" r="152"/>
      <path d="M436 196 L322 356 L392 356 L364 470 L482 306 L410 306 Z"/>
    </g>`,

  Suspension: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M292 198 L508 198"/>
      <path d="M292 486 L508 486"/>
      <path d="M316 198 L484 246 L316 294 L484 342 L316 390 L484 438 L316 486"/>
    </g>`,

  Filters: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <rect x="298" y="228" width="204" height="238" rx="28"/>
      <g stroke-width="12">
        <path d="M348 262 L348 432"/>
        <path d="M400 262 L400 432"/>
        <path d="M452 262 L452 432"/>
      </g>
      <path d="M362 228 L362 196 L438 196 L438 228"/>
    </g>`,

  Lighting: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M400 180 Q494 180 494 274 L494 356 Q494 420 400 420 Q306 420 306 356 L306 274 Q306 180 400 180 Z"/>
      <path d="M348 420 L348 486 L452 486 L452 420"/>
      <g stroke-width="12">
        <path d="M356 452 L444 452"/>
        <path d="M400 240 L400 330"/>
        <path d="M362 300 L438 300"/>
      </g>
    </g>`,

  Wipers: `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M186 468 A268 268 0 0 1 614 468" stroke-dasharray="26 22"/>
      <path d="M262 392 L538 392" stroke-width="24"/>
      <path d="M400 392 L400 462"/>
      <circle cx="400" cy="480" r="22"/>
    </g>`,

  'Fluids & Chemicals': `
    <g transform="translate(0, -10)" fill="none" stroke="#2c5f9e" stroke-width="14"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M348 236 L348 196 L452 196 L452 236"/>
      <path d="M322 236 L478 236 L492 494 Q494 516 472 516 L328 516 Q306 516 308 494 Z"/>
      <path d="M318 352 L482 352" stroke-width="12"/>
      <path d="M400 400 L400 462" stroke-width="12"/>
    </g>`,
}

/** One SVG per part in the catalogue. */
function partFiles() {
  return PARTS.map((part) => ({
    path: `parts/${part.slug}.svg`,
    category: 'parts',
    label: part.name,
    // Brand and category rather than the price: a price baked into a generated
    // image goes stale the moment the data changes, and nothing regenerates it.
    sublabel: `${part.brand} · ${part.category}`,
    glyph: PART_GLYPHS[part.category],
  }))
}

/** One SVG per service in the catalogue, so the cards are distinguishable. */
function serviceFiles() {
  return SERVICES.map((service) => ({
    path: `services/${service.slug}.svg`,
    category: 'services',
    label: service.name,
    sublabel: `${service.duration} · from $${service.startingPrice}`,
    glyph: SERVICE_GLYPHS[service.icon],
  }))
}

/**
 * A head-and-shoulders portrait, used for every team member.
 *
 * A parameterised function rather than an entry in `GLYPHS` because the team
 * grid shows eight of these at once: eight identical drawings read as a broken
 * page, so each one is tinted from the palette below.
 */
const portraitGlyph = (stroke) => `
  <g transform="translate(0, -10)" fill="none" stroke="${stroke}" stroke-width="14"
     stroke-linecap="round" stroke-linejoin="round">
    <circle cx="400" cy="264" r="76"/>
    <path d="M256 512 Q256 396 400 396 Q544 396 544 512"/>
  </g>`

/** Tints for the team portraits, cycled by slug so a member keeps the same one. */
const PORTRAIT_STROKES = [
  '#2c5f9e',
  '#3f7a5c',
  '#8a5a2b',
  '#6b4a86',
  '#a3172a',
  '#2f6f80',
  '#7a6a2c',
  '#4a5570',
]

/** One SVG per team member, so the About page has a face for every card. */
function teamFiles() {
  return TEAM.map((member, index) => {
    // By position in the list, not by first letter: two members sharing an
    // initial would otherwise be drawn in the same colour next to each other.
    const stroke = PORTRAIT_STROKES[index % PORTRAIT_STROKES.length]

    return {
      path: `team/${member.slug}.svg`,
      category: 'team',
      label: member.name,
      // The position rather than the bio: a bio is a paragraph and will not fit
      // under an 800x600 drawing, and the name alone leaves the card looking
      // like something failed to load.
      sublabel: member.position,
      stroke,
      glyph: portraitGlyph(stroke),
    }
  })
}

/** One SVG per frame of every vehicle's gallery. */
function vehicleFiles() {
  return VEHICLES.flatMap((vehicle) =>
    vehicle.images.map((imagePath, index) => ({
      path: imagePath.replace(/^\/images\//, ''),
      category: 'vehicles',
      label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      sublabel: `${vehicle.trim} · ${GALLERY_FRAMES[index] ?? `Photo ${index + 1}`}`,
      stroke: PAINT[vehicle.exteriorColor] ?? '#2c5f9e',
      glyph:
        GALLERY_FRAMES[index] === 'Interior'
          ? interiorGlyph(PAINT[vehicle.exteriorColor] ?? '#2c5f9e')
          : carGlyph(PAINT[vehicle.exteriorColor] ?? '#2c5f9e'),
    })),
  )
}

async function main() {
  const vehicles = vehicleFiles()
  const services = serviceFiles()
  const parts = partFiles()
  const team = teamFiles()
  const files = [...STATIC_FILES, ...services, ...parts, ...team, ...vehicles]

  for (const file of files) {
    const target = join(OUTPUT_ROOT, file.path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, svg(file), 'utf8')
  }

  console.log(`${files.length} images written to public/images/`)
  console.log(
    `  ${STATIC_FILES.length} static, ${services.length} services, ${parts.length} parts, ` +
      `${team.length} team portraits, ${vehicles.length} vehicle gallery frames`,
  )
  console.log(
    `  from ${VEHICLES.length} vehicles, ${SERVICES.length} services, ${PARTS.length} parts ` +
      `and ${TEAM.length} team members in src/data/`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
