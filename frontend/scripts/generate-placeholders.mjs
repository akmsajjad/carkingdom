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
 * When real photography arrives, drop the files into `public/images/vehicles/`
 * under the names `vehicleImage()` asks for and run `npm run images`. The
 * matching SVG keeps being written as the fallback — `OptimizedImage` swaps to
 * it if a photo is missing or fails to load — and `vehicle.images` starts
 * pointing at the photographs without any component or data change. See
 * `scripts/sync-vehicle-photos.mjs`.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VEHICLES } from '../src/data/vehicles.js'
import { SERVICES } from '../src/data/services.js'
import { PARTS } from '../src/data/parts.js'
import { TEAM } from '../src/data/team.js'
import { vehiclePlaceholder } from '../src/utils/images.js'

const OUTPUT_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'images',
)

const WIDTH = 800
const HEIGHT = 600

/**
 * A side-view car, used only for `vehicles/default.svg`.
 *
 * Every actual vehicle gallery frame is drawn by `vehicleSvg()`. This one stays
 * because the fallback image is not tied to a record — it is what shows when an
 * image 404s or a vehicle has none — so a generic outline with no body type and
 * no paint is the honest drawing for it.
 */
const carGlyph = (stroke) => `
  <g transform="translate(0, -10)">
    <path d="M150 372 L150 330 Q150 308 172 306 L246 300 L300 242 Q312 228 330 228 L470 228 Q488 228 500 242 L554 300 L628 306 Q650 308 650 330 L650 372 Z"
          fill="${stroke}" fill-opacity="0.14" stroke="${stroke}" stroke-width="14" stroke-linejoin="round"/>
    <circle cx="248" cy="376" r="46" fill="none" stroke="${stroke}" stroke-width="14"/>
    <circle cx="552" cy="376" r="46" fill="none" stroke="${stroke}" stroke-width="14"/>
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

/**
 * What each frame of a vehicle gallery is meant to show.
 *
 * The side profile leads on purpose. Frame 1 is what `VehicleCard` shows as the
 * thumbnail, and the side elevation is the only view that tells a sedan from an
 * SUV from a pickup at card size — head-on, a RAV4 and a Camry are nearly the
 * same rectangle. Leading with the view that identifies the vehicle is the
 * point of the exercise. Nothing user-facing depends on this order: the gallery
 * captions its images "photo N of M", so reordering is invisible.
 */
const GALLERY_FRAMES = [
  'Side profile',
  'Front view',
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

/**
 * Three templates, chosen by which field the file carries.
 *
 * A file with neither `scene` nor `vehicle` gets the label template: a tinted
 * glyph on a light card with the record's name and subtitle printed on it. That
 * is right for a part or a team portrait, where the label *is* the content.
 *
 * A file with `scene` gets the workshop template — the nine service images.
 * A file with `vehicle` gets the vehicle template.
 *
 * Those two share nothing with the label template or with each other: no
 * caption, no border, and their own backdrops. Branching here rather than at the
 * call site keeps `main()` writing a single uniform list, and means adding a
 * fourth kind of image later is one line here plus one new function.
 */
function svg({ category, label, sublabel, stroke, glyph, scene, vehicle }) {
  if (scene) return sceneSvg(scene)
  if (vehicle) return vehicleSvg(vehicle)

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
  // `services/default.svg` is also mandatory, but it is drawn as a scene like
  // the rest of its category, so it is built in `serviceFiles()` — this list is
  // evaluated at module scope and cannot read a table declared below it.
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

/* ==========================================================================
   Service scenes
   ==========================================================================
   The service images are drawn to a different brief from everything else in
   this file, which is why they get their own template rather than a glyph.

   Every other placeholder is a line drawing on a pale ground with the name and
   the price set underneath it, because those images are read at full width on a
   detail page or a card in a catalogue. The service images are read at 284x213
   in a card that already prints the service name, the duration and the price
   directly below them — so the caption is duplicated at 9px, and the flat glyph
   above it reads as a missing image rather than as artwork.

   So these are scenes instead: a workshop backdrop shared by all of them, a
   shaded subject, and no text. The backdrop is a single function so the
   treatment is identical across the set — same wall, same floor line, same
   light pool, same key light, same vignette — and only the subject changes.
   That is the "consistent image treatment" the cards need, and it is the one
   thing a per-service drawing would drift away from.

   Lighting is deliberately one-directional: key light upper right, contact
   shadow under everything, vignette last. Without the contact shadows the
   subjects float; without the vignette the pale backdrop runs flat into the
   card's white edge.

   The palette is the site's — graphite, steel, white, and the brand red as the
   single accent (the caliper, the filter band, the gauge knobs, the rim cap).
   Nothing warm is introduced: the amber in `index.css` belongs to the star
   ratings, and a second warm colour here would spend it.

   These delete themselves when real photography arrives — drop the .jpg in and
   repoint `serviceImage()`; see the note at the top of this file.
   ========================================================================== */

/** Shared scene palette and lighting. Ids are per-file, so reusing them is safe. */
const SCENE_DEFS = `
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e8eef5"/>
      <stop offset="0.62" stop-color="#d6e0ea"/>
      <stop offset="1" stop-color="#c5d1df"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b7c3d1"/>
      <stop offset="1" stop-color="#8b98aa"/>
    </linearGradient>
    <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.62"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="key" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.47" r="0.74">
      <stop offset="0.52" stop-color="#10131a" stop-opacity="0"/>
      <stop offset="1" stop-color="#10131a" stop-opacity="0.26"/>
    </radialGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0.34" y2="1">
      <stop offset="0" stop-color="#f6f8fb"/>
      <stop offset="0.34" stop-color="#ccd6e1"/>
      <stop offset="0.68" stop-color="#98a6b8"/>
      <stop offset="1" stop-color="#6a7889"/>
    </linearGradient>
    <linearGradient id="steelDark" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#5f6c7f"/>
      <stop offset="0.5" stop-color="#3d4757"/>
      <stop offset="1" stop-color="#222833"/>
    </linearGradient>
    <linearGradient id="graphite" x1="0" y1="0" x2="0.38" y2="1">
      <stop offset="0" stop-color="#3b4353"/>
      <stop offset="1" stop-color="#161a22"/>
    </linearGradient>
    <linearGradient id="rubber" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#525b6a"/>
      <stop offset="0.55" stop-color="#2b313c"/>
      <stop offset="1" stop-color="#12151b"/>
    </linearGradient>
    <linearGradient id="red" x1="0" y1="0" x2="0.34" y2="1">
      <stop offset="0" stop-color="#f2637a"/>
      <stop offset="0.45" stop-color="#d81f3c"/>
      <stop offset="1" stop-color="#980b21"/>
    </linearGradient>
    <linearGradient id="oil" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#6d5f42"/>
      <stop offset="0.45" stop-color="#3d3324"/>
      <stop offset="1" stop-color="#191410"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#a8d6ec"/>
      <stop offset="1" stop-color="#3d7ba4"/>
    </linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e4eaf1"/>
    </linearGradient>
    <linearGradient id="foam" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.6" stop-color="#e6edf4"/>
      <stop offset="1" stop-color="#c2cedb"/>
    </linearGradient>
    <linearGradient id="hoseBlue" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#5b9dc6"/>
      <stop offset="1" stop-color="#215a80"/>
    </linearGradient>`

/** Soft contact shadow. Without it every subject floats above the floor. */
const contactShadow = (cx, cy, rx, ry, opacity = 0.2) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2b3240" opacity="${opacity}"/>`

/** A four-point star, for the detailing scene's shine. */
const star = (cx, cy, s, opacity = 0.92) => {
  const k = (s * 0.17).toFixed(1)
  return `<path transform="translate(${cx},${cy})" fill="#ffffff" opacity="${opacity}" d="M0 ${-s} Q${k} ${-k} ${s} 0 Q${k} ${k} 0 ${s} Q${-k} ${k} ${-s} 0 Q${-k} ${-k} 0 ${-s} Z"/>`
}

/** A ring of drilled holes, used by the brake rotor. */
const boltRing = (cx, cy, radius, holeRadius, count, startAngle, fill) =>
  Array.from({ length: count }, (_, index) => {
    const angle = ((startAngle + (360 / count) * index) * Math.PI) / 180
    const x = (cx + radius * Math.cos(angle)).toFixed(1)
    const y = (cy + radius * Math.sin(angle)).toFixed(1)
    return `<circle cx="${x}" cy="${y}" r="${holeRadius}" fill="${fill}"/>`
  }).join('')

/** A spoke, drawn from the hub outward and rotated into place. */
const spokes = (cx, cy, count, length, width) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (360 / count) * index
    return `<rect x="${-width / 2}" y="${-length}" width="${width}" height="${length}" rx="${width / 2}" transform="translate(${cx},${cy}) rotate(${angle})" fill="url(#steel)"/>`
  }).join('')

const SERVICE_SCENES = {
  /** Oil & filter change — a spin-on filter, a funnel, and the drain pan. */
  oil: `
    ${contactShadow(400, 486, 250, 22)}
    <g>
      ${contactShadow(248, 470, 78, 15, 0.18)}
      <ellipse cx="248" cy="418" rx="52" ry="24" fill="url(#steelDark)"/>
      <rect x="196" y="300" width="104" height="122" fill="url(#steelDark)"/>
      <rect x="196" y="306" width="104" height="10" fill="url(#red)"/>
      <rect x="188" y="282" width="120" height="24" rx="7" fill="url(#steel)"/>
      <g fill="#0f1219" opacity="0.45">
        <rect x="198" y="284" width="6" height="20" rx="3"/>
        <rect x="214" y="284" width="6" height="20" rx="3"/>
        <rect x="230" y="284" width="6" height="20" rx="3"/>
        <rect x="246" y="284" width="6" height="20" rx="3"/>
        <rect x="262" y="284" width="6" height="20" rx="3"/>
        <rect x="278" y="284" width="6" height="20" rx="3"/>
        <rect x="294" y="284" width="6" height="20" rx="3"/>
      </g>
      <rect x="196" y="330" width="104" height="8" fill="#0f1219" opacity="0.25"/>
    </g>
    <g>
      <path d="M338 182 L502 182 L434 296 L406 296 Z" fill="url(#steel)"/>
      <ellipse cx="420" cy="182" rx="82" ry="16" fill="url(#steelDark)"/>
      <ellipse cx="420" cy="182" rx="66" ry="11" fill="#0f1219" opacity="0.7"/>
      <rect x="406" y="292" width="28" height="46" rx="8" fill="url(#steelDark)"/>
    </g>
    <path d="M410 338 q-6 44 4 88 h14 q10 -44 4 -88 Z" fill="url(#oil)"/>
    <path d="M416 340 q-4 42 2 80" fill="none" stroke="#f6f8fb" stroke-width="3" opacity="0.5"/>
    <g>
      <ellipse cx="400" cy="424" rx="146" ry="12" fill="#0d1015"/>
      <path d="M262 424 L538 424 L568 478 Q572 490 558 490 L242 490 Q228 490 232 478 Z" fill="url(#graphite)"/>
      <rect x="254" y="416" width="292" height="14" rx="7" fill="url(#steel)"/>
      <ellipse cx="400" cy="424" rx="130" ry="9" fill="#0d1015"/>
      <ellipse cx="400" cy="424" rx="104" ry="6" fill="#2a2419"/>
    </g>
    <g transform="translate(672,418) rotate(-26)">
      ${contactShadow(0, 36, 76, 10, 0.16)}
      <rect x="-56" y="-11" width="120" height="22" rx="11" fill="url(#steel)"/>
      <circle cx="-62" cy="0" r="21" fill="none" stroke="url(#steel)" stroke-width="17"/>
      <path d="M86 -30 a32 32 0 1 0 0 60" fill="none" stroke="url(#steel)" stroke-width="20"/>
    </g>`,

  /** Brake repair — a vented rotor, a red caliper, and a pad. */
  brake: `
    ${contactShadow(352, 474, 210, 24)}
    <circle cx="352" cy="318" r="150" fill="url(#steel)"/>
    <circle cx="352" cy="318" r="150" fill="none" stroke="#5f6c7f" stroke-width="5" opacity="0.45"/>
    <circle cx="352" cy="318" r="120" fill="none" stroke="#7a8899" stroke-width="3" opacity="0.6"/>
    <circle cx="352" cy="318" r="90" fill="none" stroke="#8f9daf" stroke-width="26" opacity="0.55"/>
    ${boltRing(352, 318, 134, 13, 8, 0, '#93a1b2')}
    ${boltRing(352, 318, 134, 13, 8, 22.5, '#eef2f7')}
    <circle cx="352" cy="318" r="58" fill="url(#steelDark)"/>
    ${boltRing(352, 318, 40, 9, 5, 90, '#0d1015')}
    <circle cx="352" cy="318" r="27" fill="#0d1015"/>
    <circle cx="352" cy="318" r="27" fill="none" stroke="#6a7889" stroke-width="4"/>
    <g>
      <rect x="450" y="212" width="64" height="212" rx="28" fill="url(#red)"/>
      <rect x="468" y="250" width="28" height="136" rx="14" fill="#7d0a1c"/>
      <circle cx="482" cy="234" r="10" fill="url(#steel)"/>
      <circle cx="482" cy="402" r="10" fill="url(#steel)"/>
      <rect x="450" y="212" width="64" height="212" rx="28" fill="none" stroke="#7d0a1c" stroke-width="3" opacity="0.5"/>
    </g>
    <g transform="translate(198,430) rotate(-13)">
      ${contactShadow(0, 30, 62, 10, 0.18)}
      <rect x="-56" y="-16" width="112" height="30" rx="7" fill="url(#steel)"/>
      <rect x="-48" y="-11" width="96" height="20" rx="5" fill="#39414f"/>
    </g>`,

  /** Tires — a treaded tire on a five-spoke alloy. */
  tire: `
    ${contactShadow(400, 490, 195, 24)}
    <circle cx="400" cy="310" r="168" fill="url(#rubber)"/>
    <circle cx="400" cy="310" r="172" fill="none" stroke="#0d1015" stroke-width="10" opacity="0.5"/>
    <circle cx="400" cy="310" r="152" fill="none" stroke="#0c0e14" stroke-width="30" stroke-dasharray="28 20" opacity="0.85"/>
    <circle cx="400" cy="310" r="122" fill="none" stroke="#6d7889" stroke-width="3" opacity="0.45"/>
    <circle cx="400" cy="310" r="104" fill="url(#steel)"/>
    <circle cx="400" cy="310" r="96" fill="url(#steelDark)"/>
    ${spokes(400, 310, 5, 100, 34)}
    <circle cx="400" cy="310" r="34" fill="url(#steel)"/>
    ${boltRing(400, 310, 54, 8, 5, 90, '#1d222b')}
    <circle cx="400" cy="310" r="16" fill="url(#red)"/>
    <circle cx="400" cy="310" r="16" fill="none" stroke="#7d0a1c" stroke-width="3"/>`,

  /** Diagnostics — a scan tool on a live-data screen, cable to the port. */
  diagnostics: `
    ${contactShadow(346, 452, 210, 24)}
    <ellipse cx="346" cy="286" rx="176" ry="126" fill="#7fc0e2" opacity="0.16"/>
    <rect x="196" y="180" width="300" height="256" rx="26" fill="url(#graphite)"/>
    <rect x="196" y="180" width="300" height="256" rx="26" fill="none" stroke="#5f6c7f" stroke-width="3" opacity="0.55"/>
    <rect x="220" y="206" width="252" height="146" rx="14" fill="url(#screen)"/>
    <rect x="220" y="206" width="252" height="146" rx="14" fill="none" stroke="#0f2433" stroke-width="4" opacity="0.5"/>
    <path d="M240 300 L278 300 L294 258 L312 336 L330 282 L350 300 L390 300 L408 262 L426 322 L444 292 L462 300"
          fill="none" stroke="#f2fbff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <g>
      <rect x="240" y="322" width="64" height="11" rx="5" fill="#f2fbff" opacity="0.85"/>
      <rect x="312" y="322" width="98" height="11" rx="5" fill="url(#red)"/>
      <rect x="418" y="322" width="36" height="11" rx="5" fill="#f2fbff" opacity="0.5"/>
    </g>
    <g fill="url(#steelDark)">
      <rect x="220" y="374" width="58" height="32" rx="9"/>
      <rect x="288" y="374" width="58" height="32" rx="9"/>
      <rect x="356" y="374" width="58" height="32" rx="9"/>
      <rect x="424" y="374" width="48" height="32" rx="9"/>
    </g>
    <circle cx="446" cy="390" r="9" fill="url(#red)"/>
    <path d="M496 328 q76 12 82 78 q4 46 -44 54" fill="none" stroke="#1d222b" stroke-width="13" stroke-linecap="round"/>
    <g transform="translate(534,462) rotate(-7)">
      ${contactShadow(0, 34, 48, 10, 0.2)}
      <rect x="-38" y="-28" width="76" height="56" rx="12" fill="url(#steelDark)"/>
      <g fill="#0d1015">
        <rect x="-24" y="-14" width="9" height="28" rx="3"/>
        <rect x="-8" y="-14" width="9" height="28" rx="3"/>
        <rect x="8" y="-14" width="9" height="28" rx="3"/>
        <rect x="24" y="-14" width="9" height="28" rx="3"/>
      </g>
    </g>`,

  /** Safety inspection — the checklist, ticked. */
  inspection: `
    ${contactShadow(400, 498, 190, 20)}
    <rect x="246" y="150" width="308" height="336" rx="22" fill="url(#paper)"/>
    <rect x="246" y="150" width="308" height="336" rx="22" fill="none" stroke="#b3bfcd" stroke-width="3"/>
    <rect x="352" y="128" width="96" height="46" rx="14" fill="url(#steel)"/>
    <rect x="370" y="120" width="60" height="24" rx="9" fill="url(#steelDark)"/>
    <g>
      <rect x="286" y="222" width="30" height="30" rx="8" fill="none" stroke="#98a6b8" stroke-width="3"/>
      <path d="M292 238 l9 10 l18 -22" fill="none" stroke="url(#red)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="336" y="230" width="170" height="11" rx="5" fill="#c3ccd8"/>

      <rect x="286" y="276" width="30" height="30" rx="8" fill="none" stroke="#98a6b8" stroke-width="3"/>
      <path d="M292 292 l9 10 l18 -22" fill="none" stroke="url(#red)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="336" y="284" width="140" height="11" rx="5" fill="#c3ccd8"/>

      <rect x="286" y="330" width="30" height="30" rx="8" fill="none" stroke="#98a6b8" stroke-width="3"/>
      <path d="M292 346 l9 10 l18 -22" fill="none" stroke="url(#red)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="336" y="338" width="182" height="11" rx="5" fill="#c3ccd8"/>

      <rect x="286" y="384" width="30" height="30" rx="8" fill="none" stroke="#98a6b8" stroke-width="3"/>
      <path d="M292 400 l9 10 l18 -22" fill="none" stroke="url(#red)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="336" y="392" width="124" height="11" rx="5" fill="#c3ccd8"/>

      <rect x="286" y="438" width="30" height="30" rx="8" fill="none" stroke="#98a6b8" stroke-width="3"/>
      <rect x="336" y="446" width="156" height="11" rx="5" fill="#c3ccd8"/>
    </g>
    <g transform="translate(636,440) rotate(-20)">
      ${contactShadow(0, 62, 44, 9, 0.18)}
      <rect x="-30" y="-58" width="60" height="116" rx="16" fill="url(#graphite)"/>
      <rect x="-30" y="-16" width="60" height="12" fill="url(#red)"/>
      <rect x="-42" y="-76" width="84" height="30" rx="11" fill="url(#steel)"/>
      <ellipse cx="0" cy="-78" rx="30" ry="10" fill="#f2f6fa"/>
    </g>`,

  /** Air conditioning — a manifold gauge set with its two hoses. */
  ac: `
    ${contactShadow(400, 508, 220, 20)}
    <g>
      <circle cx="286" cy="270" r="98" fill="url(#steel)"/>
      <circle cx="286" cy="270" r="84" fill="#fbfcfe"/>
      <circle cx="286" cy="270" r="70" fill="none" stroke="#4e5a6b" stroke-width="4" stroke-dasharray="3 12"/>
      <circle cx="286" cy="270" r="76" fill="none" stroke="url(#red)" stroke-width="9" stroke-dasharray="52 426" transform="rotate(-74 286 270)"/>
      <line x1="286" y1="270" x2="316" y2="228" stroke="#171b23" stroke-width="7" stroke-linecap="round"/>
      <circle cx="286" cy="270" r="11" fill="url(#steelDark)"/>
    </g>
    <g>
      <circle cx="514" cy="270" r="98" fill="url(#steel)"/>
      <circle cx="514" cy="270" r="84" fill="#fbfcfe"/>
      <circle cx="514" cy="270" r="70" fill="none" stroke="#4e5a6b" stroke-width="4" stroke-dasharray="3 12"/>
      <circle cx="514" cy="270" r="76" fill="none" stroke="url(#hoseBlue)" stroke-width="9" stroke-dasharray="52 426" transform="rotate(-74 514 270)"/>
      <line x1="514" y1="270" x2="548" y2="236" stroke="#171b23" stroke-width="7" stroke-linecap="round"/>
      <circle cx="514" cy="270" r="11" fill="url(#steelDark)"/>
    </g>
    <rect x="356" y="326" width="88" height="108" rx="18" fill="url(#graphite)"/>
    <rect x="356" y="326" width="88" height="108" rx="18" fill="none" stroke="#5f6c7f" stroke-width="3" opacity="0.5"/>
    <circle cx="380" cy="358" r="17" fill="url(#red)"/>
    <circle cx="420" cy="358" r="17" fill="url(#red)"/>
    <rect x="374" y="396" width="52" height="10" rx="5" fill="#5f6c7f"/>
    <path d="M356 412 q-104 26 -128 96" fill="none" stroke="url(#red)" stroke-width="19" stroke-linecap="round"/>
    <path d="M444 412 q104 26 128 96" fill="none" stroke="url(#hoseBlue)" stroke-width="19" stroke-linecap="round"/>
    <rect x="206" y="500" width="44" height="30" rx="8" fill="url(#steelDark)"/>
    <rect x="550" y="500" width="44" height="30" rx="8" fill="url(#steelDark)"/>`,

  /** Engine & transmission — an inline block with its cam cover and timing gear. */
  engine: `
    ${contactShadow(400, 484, 250, 22)}
    <path d="M214 300 h372 v140 q0 20 -20 20 h-332 q-20 0 -20 -20 Z" fill="url(#steelDark)"/>
    <path d="M214 300 h372 v140 q0 20 -20 20 h-332 q-20 0 -20 -20 Z" fill="none" stroke="#1d222b" stroke-width="4" opacity="0.5"/>
    <rect x="222" y="332" width="356" height="14" fill="#0f1219" opacity="0.28"/>
    <rect x="222" y="392" width="356" height="14" fill="#0f1219" opacity="0.22"/>
    <g>
      <ellipse cx="280" cy="300" rx="42" ry="15" fill="#0d1015"/>
      <ellipse cx="280" cy="300" rx="42" ry="15" fill="none" stroke="url(#steel)" stroke-width="6"/>
      <ellipse cx="376" cy="300" rx="42" ry="15" fill="#0d1015"/>
      <ellipse cx="376" cy="300" rx="42" ry="15" fill="none" stroke="url(#steel)" stroke-width="6"/>
      <ellipse cx="472" cy="300" rx="42" ry="15" fill="#0d1015"/>
      <ellipse cx="472" cy="300" rx="42" ry="15" fill="none" stroke="url(#steel)" stroke-width="6"/>
      <ellipse cx="568" cy="300" rx="42" ry="15" fill="#0d1015"/>
      <ellipse cx="568" cy="300" rx="42" ry="15" fill="none" stroke="url(#steel)" stroke-width="6"/>
    </g>
    <rect x="236" y="228" width="328" height="54" rx="16" fill="url(#steel)"/>
    <rect x="236" y="228" width="328" height="54" rx="16" fill="none" stroke="#6a7889" stroke-width="3"/>
    <g fill="#6a7889">
      <circle cx="268" cy="242" r="7"/><circle cx="336" cy="242" r="7"/><circle cx="404" cy="242" r="7"/><circle cx="472" cy="242" r="7"/>
      <circle cx="268" cy="268" r="7"/><circle cx="336" cy="268" r="7"/><circle cx="404" cy="268" r="7"/><circle cx="472" cy="268" r="7"/>
    </g>
    <circle cx="528" cy="255" r="21" fill="url(#graphite)"/>
    <circle cx="528" cy="255" r="10" fill="url(#red)"/>
    <g transform="translate(636,374)">
      <circle cx="0" cy="0" r="66" fill="none" stroke="url(#steel)" stroke-width="18" stroke-dasharray="14 15"/>
      <circle cx="0" cy="0" r="56" fill="url(#steel)"/>
      <circle cx="0" cy="0" r="24" fill="#0d1015"/>
      <circle cx="0" cy="0" r="24" fill="none" stroke="url(#steelDark)" stroke-width="8"/>
      ${boltRing(0, 0, 40, 7, 6, 0, '#5f6c7f')}
    </g>
    <path d="M636 292 q0 -46 -60 -54" fill="none" stroke="#1d222b" stroke-width="15" stroke-linecap="round"/>`,

  /** Detailing — a dual-action polisher and the shine it leaves. */
  sparkle: `
    ${contactShadow(400, 494, 215, 24, 0.22)}
    <ellipse cx="400" cy="466" rx="246" ry="52" fill="url(#pool)"/>
    <path d="M244 424 v16 a156 44 0 0 0 312 0 v-16 Z" fill="#9dabbb"/>
    <ellipse cx="400" cy="424" rx="156" ry="44" fill="url(#foam)"/>
    <ellipse cx="400" cy="424" rx="156" ry="44" fill="none" stroke="#93a1b2" stroke-width="3"/>
    <ellipse cx="400" cy="412" rx="140" ry="30" fill="url(#steel)"/>
    <ellipse cx="400" cy="412" rx="140" ry="30" fill="none" stroke="#8d9aab" stroke-width="3"/>
    <g transform="translate(400,286) rotate(-12)">
      <rect x="-44" y="34" width="88" height="84" rx="18" fill="url(#steelDark)"/>
      <rect x="-24" y="-184" width="48" height="96" rx="24" fill="url(#steelDark)"/>
      <ellipse cx="0" cy="-182" rx="34" ry="16" fill="url(#red)"/>
      <rect x="-62" y="-100" width="124" height="150" rx="32" fill="url(#graphite)"/>
      <rect x="-62" y="-100" width="124" height="150" rx="32" fill="none" stroke="#5f6c7f" stroke-width="3" opacity="0.5"/>
      <rect x="-62" y="-30" width="124" height="26" fill="url(#red)"/>
      <g fill="#5f6c7f" opacity="0.8">
        <rect x="-44" y="-76" width="88" height="7" rx="3.5"/>
        <rect x="-44" y="-58" width="88" height="7" rx="3.5"/>
      </g>
    </g>
    ${star(238, 194, 34)}
    ${star(566, 238, 24, 0.85)}
    ${star(608, 392, 18, 0.75)}
    ${star(186, 356, 17, 0.7)}
    ${star(320, 122, 15, 0.6)}`,

  /** The services fallback — a ring spanner and a socket. */
  default: `
    ${contactShadow(384, 500, 230, 22)}
    <g transform="translate(384,326) rotate(-31)">
      <rect x="-138" y="-17" width="276" height="34" rx="17" fill="url(#steel)"/>
      <circle cx="-142" cy="0" r="47" fill="none" stroke="url(#steel)" stroke-width="29"/>
      <circle cx="142" cy="0" r="47" fill="none" stroke="url(#steel)" stroke-width="29"/>
      <rect x="-138" y="-17" width="276" height="9" rx="5" fill="#f6f8fb" opacity="0.5"/>
    </g>
    <g transform="translate(622,452)">
      ${contactShadow(0, 48, 52, 10, 0.2)}
      <path d="M-34 -44 h68 v72 a34 34 0 0 1 -68 0 Z" fill="url(#steelDark)"/>
      <rect x="-34" y="-12" width="68" height="11" fill="url(#red)"/>
      <ellipse cx="0" cy="-44" rx="34" ry="12" fill="#0d1015"/>
      <ellipse cx="0" cy="-44" rx="22" ry="7" fill="#2a2f3a"/>
    </g>`,
}

/**
 * Scene template. Text-free and border-free, unlike `svg()` below: these are
 * read inside a card that prints the name itself, and the painted backdrop runs
 * to the card's own rounded edge.
 */
function sceneSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="presentation">
  <defs>${SCENE_DEFS}
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wall)"/>
  <rect y="330" width="${WIDTH}" height="${HEIGHT - 330}" fill="url(#floor)"/>
  <rect y="329" width="${WIDTH}" height="2" fill="#7f8c9e" opacity="0.45"/>
  <ellipse cx="400" cy="352" rx="344" ry="62" fill="url(#pool)"/>
  <ellipse cx="574" cy="92" rx="272" ry="212" fill="url(#key)"/>
  ${body}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vig)"/>
</svg>
`
}

/* ==========================================================================
   Vehicle artwork
   ==========================================================================
   Every vehicle placeholder used to be one `carGlyph` silhouette, tinted by
   exterior colour. All 125 frames across 25 vehicles shared a single profile —
   a RAV4, an F-150 and a Camry drew the same shape — and only the paint told
   them apart, which is the "same generic image for every vehicle" problem in
   its purest form. The frame name was the only thing distinguishing a "Front
   view" from a "Side profile".

   Three things are parameterised instead:

   1. `BODY_SHAPES` — proportions per body type, which is what actually makes a
      truck look like a truck. Roof height, bonnet length, wheel size, ground
      clearance and rear overhang all move together; a boxy silhouette with a
      high roof and short bonnet reads as an SUV, and the same drawing with a
      long bonnet and a low roof reads as a sedan.
   2. The paint, as a gradient rather than a flat fill. A flat tint has no
      light in it, which is most of why the old placeholders read as icons.
   3. The frame, as a genuinely different drawing rather than a different
      caption — a side elevation, a head-on front, a head-on rear, a wheel
      close-up and an interior.

   These are still illustrations, not photographs — see the header of
   `scripts/sync-vehicle-photos.mjs` for how real photography replaces them
   without a code change. What they are not is 125 copies of one outline.
   ========================================================================== */

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

const rgbToHex = (rgb) =>
  '#' +
  rgb
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0'))
    .join('')

const lighten = (hex, amount) =>
  rgbToHex(hexToRgb(hex).map((v) => v + (255 - v) * amount))

const darken = (hex, amount) => rgbToHex(hexToRgb(hex).map((v) => v * (1 - amount)))

/** Where every wheel touches the floor. The horizon sits above it. */
const GROUND = 500

/**
 * Proportions per body type.
 *
 * The first block drives `sideProfile`, the second `faceView`. They are kept
 * together so a body type can be reasoned about as one thing rather than two
 * half-descriptions in different places.
 */
const BODY_SHAPES = {
  Sedan: {
    // side
    front: 62, rear: 738, wheelR: 50, archR: 58,
    frontWheelX: 196, rearWheelX: 604,
    bonnetY: 396, cowlX: 244, aPillarX: 330, roofY: 302,
    cPillarX: 520, rearScreenX: 616, deckY: 386, beltY: 372,
    // face — 1.84 m x 1.45 m at 210 px/m
    faceW: 386, faceH: 305, roofFactor: 0.60, cowlFactor: 0.88,
  },
  SUV: {
    front: 58, rear: 742, wheelR: 58, archR: 66,
    frontWheelX: 200, rearWheelX: 600,
    bonnetY: 366, cowlX: 232, aPillarX: 312, roofY: 258,
    cPillarX: 566, rearScreenX: 648, deckY: 356, beltY: 344,
    // face — 1.86 m x 1.69 m
    faceW: 390, faceH: 354, roofFactor: 0.72, cowlFactor: 0.92,
  },
  Truck: {
    front: 54, rear: 746, wheelR: 60, archR: 68,
    frontWheelX: 190, rearWheelX: 612,
    // The bed rail is the "deck": a vertical drop from the roof at `cPillarX`
    // gives the flat back-of-cab and the open bed in one path.
    bonnetY: 352, cowlX: 218, aPillarX: 288, roofY: 244,
    cPillarX: 420, rearScreenX: 420, deckY: 348, beltY: 330,
    // face — 2.03 m x 1.95 m
    faceW: 426, faceH: 410, roofFactor: 0.78, cowlFactor: 0.94,
  },
  Hatchback: {
    front: 78, rear: 722, wheelR: 48, archR: 56,
    frontWheelX: 204, rearWheelX: 596,
    // The screen runs almost to the tail and the "deck" is barely below the
    // belt, so the rear reads as a hatch rather than the notchback a longer
    // deck was giving.
    bonnetY: 394, cowlX: 246, aPillarX: 332, roofY: 306,
    cPillarX: 566, rearScreenX: 700, deckY: 408, beltY: 374,
    // face — 1.80 m x 1.42 m
    faceW: 378, faceH: 298, roofFactor: 0.58, cowlFactor: 0.86,
  },
  Wagon: {
    front: 62, rear: 738, wheelR: 50, archR: 58,
    frontWheelX: 192, rearWheelX: 612,
    bonnetY: 396, cowlX: 242, aPillarX: 326, roofY: 300,
    cPillarX: 636, rearScreenX: 682, deckY: 388, beltY: 372,
    // face — 1.86 m x 1.68 m
    faceW: 390, faceH: 353, roofFactor: 0.68, cowlFactor: 0.90,
  },
  Minivan: {
    front: 60, rear: 740, wheelR: 54, archR: 62,
    frontWheelX: 196, rearWheelX: 606,
    bonnetY: 372, cowlX: 212, aPillarX: 286, roofY: 250,
    cPillarX: 648, rearScreenX: 692, deckY: 368, beltY: 344,
    // face — 1.99 m x 1.75 m
    faceW: 418, faceH: 368, roofFactor: 0.76, cowlFactor: 0.94,
  },
}

/** Showroom lighting and the paint gradients, rebuilt per vehicle colour. */
const showroomDefs = (paint) => `
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f0f4f9"/>
      <stop offset="0.58" stop-color="#dee6ef"/>
      <stop offset="1" stop-color="#cbd6e2"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c7d0dc"/>
      <stop offset="0.5" stop-color="#b0bccb"/>
      <stop offset="1" stop-color="#94a1b3"/>
    </linearGradient>
    <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="key" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.48" r="0.76">
      <stop offset="0.55" stop-color="#10131a" stop-opacity="0"/>
      <stop offset="1" stop-color="#10131a" stop-opacity="0.22"/>
    </radialGradient>
    <linearGradient id="paint" x1="0" y1="0" x2="0.16" y2="1">
      <stop offset="0" stop-color="${lighten(paint, 0.52)}"/>
      <stop offset="0.3" stop-color="${lighten(paint, 0.16)}"/>
      <stop offset="0.62" stop-color="${paint}"/>
      <stop offset="1" stop-color="${darken(paint, 0.44)}"/>
    </linearGradient>
    <linearGradient id="paintLo" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="${darken(paint, 0.12)}"/>
      <stop offset="1" stop-color="${darken(paint, 0.58)}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0.28" y2="1">
      <stop offset="0" stop-color="#b8cadc"/>
      <stop offset="0.4" stop-color="#63768e"/>
      <stop offset="1" stop-color="#2b3543"/>
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0.34" y2="1">
      <stop offset="0" stop-color="#f6f8fb"/>
      <stop offset="0.34" stop-color="#ccd6e1"/>
      <stop offset="0.68" stop-color="#98a6b8"/>
      <stop offset="1" stop-color="#6a7889"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#eef2f7"/>
      <stop offset="0.45" stop-color="#b9c4d2"/>
      <stop offset="1" stop-color="#7b8a9c"/>
    </linearGradient>
    <linearGradient id="cabin" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#4a5361"/>
      <stop offset="1" stop-color="#191d24"/>
    </linearGradient>`

/** The showroom itself: wall, floor, seam, light pool, key light. */
const showroomBackdrop = `
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wall)"/>
  <rect y="420" width="${WIDTH}" height="${HEIGHT - 420}" fill="url(#floor)"/>
  <rect y="419" width="${WIDTH}" height="2" fill="#8b97a8" opacity="0.45"/>
  <ellipse cx="400" cy="452" rx="392" ry="78" fill="url(#pool)"/>
  <ellipse cx="566" cy="86" rx="300" ry="232" fill="url(#key)"/>`

/** Contact shadow. Two ellipses so the edge is soft rather than a hard rim. */
const carShadow = (rx) => `
  <ellipse cx="400" cy="${GROUND - 2}" rx="${rx}" ry="24" fill="#2b3240" opacity="0.2"/>
  <ellipse cx="400" cy="${GROUND - 4}" rx="${rx * 0.78}" ry="15" fill="#2b3240" opacity="0.22"/>`

/** One wheel: tyre, rim, spokes, hub, lug nuts. */
const wheelAt = (cx, cy, r) => `
  <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#0f1218" opacity="0.45"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b1f27"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.68}" fill="url(#rim)"/>
  ${spokes(cx, cy, 5, r * 0.62, r * 0.32)}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.23}" fill="url(#rim)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.23}" fill="none" stroke="#6a7889" stroke-width="2"/>
  ${boltRing(cx, cy, r * 0.38, r * 0.075, 5, 90, '#59636f')}`

/** The greenhouse: glass following the roofline, with a B-pillar. */
const greenhouse = (s) => {
  const top = s.roofY + 14
  const glass = [
    `M ${s.aPillarX + 26} ${s.beltY}`,
    `L ${s.aPillarX + 46} ${top}`,
    `L ${s.cPillarX - 22} ${top}`,
    `L ${s.rearScreenX - 28} ${s.beltY}`,
    'Z',
  ].join(' ')
  const pillarX = (s.aPillarX + 46 + (s.rearScreenX - 28)) / 2

  return `
    <path d="${glass}" fill="url(#glass)"/>
    <path d="${glass}" fill="none" stroke="#151a21" stroke-width="4" opacity="0.55"/>
    <rect x="${pillarX - 7}" y="${top}" width="14" height="${s.beltY - top}" fill="#1c212a" opacity="0.9"/>
    <path d="M ${s.aPillarX + 30} ${s.beltY} L ${s.aPillarX + 48} ${top + 8}"
          stroke="#ffffff" stroke-width="5" opacity="0.28" stroke-linecap="round" fill="none"/>`
}

/** Lights, doors, handles, mirror, sill shadow and shoulder highlight. */
const sideDetails = (s, paint) => {
  const sillY = GROUND - s.wheelR
  const doorX = (s.aPillarX + s.rearScreenX) / 2
  const sillTop = sillY - 16

  return `
    <path d="M ${s.front + 8} ${s.bonnetY + 4} L ${s.cowlX - 6} ${s.bonnetY + 6}"
          stroke="${lighten(paint, 0.3)}" stroke-width="5" opacity="0.5" stroke-linecap="round" fill="none"/>
    <path d="M ${s.front + 40} ${s.beltY + 10} L ${s.cPillarX + 40} ${s.beltY + 6}"
          stroke="#ffffff" stroke-width="4" opacity="0.22" stroke-linecap="round" fill="none"/>
    <path d="M ${s.front + 44} ${sillTop} L ${s.rear - 44} ${sillTop}"
          stroke="#0f1218" stroke-width="10" opacity="0.22" fill="none"/>

    <path d="M ${s.front + 3} ${s.bonnetY + 4} L ${s.front + 44} ${s.bonnetY + 12} L ${s.front + 38} ${s.bonnetY + 30} L ${s.front + 3} ${s.bonnetY + 24} Z"
          fill="#dbe6f2" opacity="0.82" stroke="#8b9caf" stroke-width="2" stroke-linejoin="round"/>
    <path d="M ${s.rear - 3} ${s.deckY + 4} L ${s.rear - 42} ${s.deckY + 12} L ${s.rear - 36} ${s.deckY + 32} L ${s.rear - 3} ${s.deckY + 26} Z"
          fill="#c8102e" stroke="#8f0a1f" stroke-width="2" stroke-linejoin="round"/>

    <path d="M ${doorX - 3} ${s.beltY + 6} L ${doorX - 3} ${sillTop - 4}"
          stroke="#0f1218" stroke-width="3" opacity="0.35" fill="none"/>
    <path d="M ${s.aPillarX - 26} ${s.beltY + 6} L ${s.aPillarX - 26} ${sillTop - 4}"
          stroke="#0f1218" stroke-width="3" opacity="0.3" fill="none"/>
    <rect x="${doorX + 16}" y="${s.beltY + 20}" width="34" height="9" rx="4.5" fill="#cfd8e2" opacity="0.85"/>
    <rect x="${s.aPillarX - 44}" y="${s.beltY + 20}" width="34" height="9" rx="4.5" fill="#cfd8e2" opacity="0.7"/>

    <path d="M ${s.aPillarX + 12} ${s.beltY - 4} l -30 -6 l -4 20 l 30 4 Z" fill="${darken(paint, 0.3)}" stroke="#151a21" stroke-width="2"/>`
}

/**
 * Scales a drawing about the point where the tyres meet the floor.
 *
 * The side profile is drawn at true proportions, which leaves a third of the
 * canvas as empty wall above the roof — the shape is right but it sits small in
 * frame. Scaling about the ground contact keeps the wheels planted and the
 * shadow in place while filling the frame the way a listing photo does.
 * The front and rear elevations need no such help: `faceH` already sizes them.
 */
const grounded = (inner, scale) =>
  `<g transform="translate(400 ${GROUND}) scale(${scale}) translate(-400 ${-GROUND})">${inner}</g>`

/** Side elevation. */
const sideProfile = (paint, s) => {
  const sillY = GROUND - s.wheelR
  const body = [
    `M ${s.front} ${sillY}`,
    `L ${s.front} ${s.bonnetY + 16}`,
    `Q ${s.front} ${s.bonnetY} ${s.front + 24} ${s.bonnetY}`,
    `L ${s.cowlX} ${s.bonnetY}`,
    `L ${s.aPillarX} ${s.roofY}`,
    `L ${s.cPillarX} ${s.roofY}`,
    `L ${s.rearScreenX} ${s.deckY}`,
    `L ${s.rear - 24} ${s.deckY}`,
    `Q ${s.rear} ${s.deckY} ${s.rear} ${s.deckY + 16}`,
    `L ${s.rear} ${sillY}`,
    `L ${s.rearWheelX + s.archR} ${sillY}`,
    `A ${s.archR} ${s.archR} 0 0 0 ${s.rearWheelX - s.archR} ${sillY}`,
    `L ${s.frontWheelX + s.archR} ${sillY}`,
    `A ${s.archR} ${s.archR} 0 0 0 ${s.frontWheelX - s.archR} ${sillY}`,
    `L ${s.front} ${sillY}`,
    'Z',
  ].join(' ')

  return grounded(
    `
    ${carShadow((s.rear - s.front) / 2 - 10)}
    <path d="${body}" fill="url(#paint)"/>
    <path d="${body}" fill="none" stroke="${darken(paint, 0.55)}" stroke-width="3" stroke-linejoin="round"/>
    ${greenhouse(s)}
    ${sideDetails(s, paint)}
    ${wheelAt(s.frontWheelX, sillY, s.wheelR)}
    ${wheelAt(s.rearWheelX, sillY, s.wheelR)}`,
    1.05,
  )
}

/**
 * Head-on front and rear elevations.
 *
 * One function for both: the silhouette is identical, and swapping the
 * treatment of the lamps, the screen and the lower bumper is the whole
 * difference between a car facing you and one driving away.
 *
 * Everything is a fraction of `faceH` — the real roof-to-ground height of the
 * body type at 210 px/m — so a pickup is genuinely taller in frame than a
 * hatchback rather than being the same shape scaled. The old version had a
 * fixed 2:1 width-to-height ratio and the car occupied under a quarter of the
 * canvas, which is why it read as a wide, flat icon.
 */
const faceView = (paint, s, mode) => {
  const front = mode === 'front'
  const halfW = s.faceW / 2
  const roofY = GROUND - s.faceH
  const at = (fraction) => roofY + s.faceH * fraction

  const yCowl = at(0.27)
  const yGrilleTop = at(0.42)
  const yBumperTop = at(0.68)
  const yBumper = at(0.8)

  const wRoof = halfW * s.roofFactor
  const wCowl = halfW * s.cowlFactor

  const body = [
    `M ${400 - halfW} ${yBumper}`,
    `L ${400 - halfW} ${yCowl + 34}`,
    `Q ${400 - halfW} ${yCowl} ${400 - wCowl} ${yCowl}`,
    `L ${400 - wRoof - 28} ${roofY + 36}`,
    `Q ${400 - wRoof} ${roofY} ${400 - wRoof + 32} ${roofY}`,
    `L ${400 + wRoof - 32} ${roofY}`,
    `Q ${400 + wRoof} ${roofY} ${400 + wRoof + 28} ${roofY + 36}`,
    `L ${400 + wCowl} ${yCowl}`,
    `Q ${400 + halfW} ${yCowl} ${400 + halfW} ${yCowl + 34}`,
    `L ${400 + halfW} ${yBumper}`,
    'Z',
  ].join(' ')

  const glass = [
    `M ${400 - wRoof - 6} ${roofY + 14}`,
    `L ${400 + wRoof + 6} ${roofY + 14}`,
    `L ${400 + wCowl - 26} ${yCowl - 6}`,
    `L ${400 - wCowl + 26} ${yCowl - 6}`,
    'Z',
  ].join(' ')

  const lamp = (side) => {
    const outer = 400 + side * (halfW - 20)
    const inner = 400 + side * (halfW - 122)
    return `<rect x="${Math.min(outer, inner)}" y="${yGrilleTop - 20}" width="102" height="34" rx="14"
                  fill="${front ? '#eef4fa' : '#c8102e'}"
                  stroke="${front ? '#93a4b7' : '#8f0a1f'}" stroke-width="2"/>`
  }

  const mirror = (side) => {
    const x = 400 + side * (halfW - 6)
    const tip = 400 + side * (halfW + 30)
    return `<path d="M ${x} ${yCowl - 4} L ${tip} ${yCowl - 16} L ${tip} ${yCowl + 22} L ${x} ${yCowl + 26} Z"
                  fill="${darken(paint, 0.38)}" stroke="#151a21" stroke-width="2" stroke-linejoin="round"/>`
  }

  return `
    ${carShadow(halfW - 4)}
    <!-- Tyres sit behind the body, so only the part below the bumper shows —
         which is exactly what a tyre looks like head-on. -->
    <rect x="${400 - halfW + 12}" y="${yBumper - 46}" width="52" height="${GROUND - yBumper + 46}" rx="16" fill="#15181e"/>
    <rect x="${400 + halfW - 64}" y="${yBumper - 46}" width="52" height="${GROUND - yBumper + 46}" rx="16" fill="#15181e"/>
    <path d="${body}" fill="url(#paint)"/>
    <path d="${body}" fill="none" stroke="${darken(paint, 0.55)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M ${400 - wRoof + 34} ${roofY + 9} L ${400 + wRoof - 34} ${roofY + 9}"
          stroke="${lighten(paint, 0.46)}" stroke-width="6" opacity="0.32" stroke-linecap="round" fill="none"/>
    <path d="${glass}" fill="url(#glass)" stroke="#151a21" stroke-width="4" stroke-linejoin="round"/>
    <path d="M ${400 - wCowl + 32} ${yCowl - 10} L ${400 + wCowl - 32} ${yCowl - 10}"
          stroke="#0f1218" stroke-width="10" opacity="0.35" stroke-linecap="round" fill="none"/>
    <path d="M ${400 - halfW + 22} ${yGrilleTop - 30} L ${400 + halfW - 22} ${yGrilleTop - 30}"
          stroke="${lighten(paint, 0.3)}" stroke-width="5" opacity="0.38" stroke-linecap="round" fill="none"/>

    ${lamp(-1)}
    ${lamp(1)}
    <rect x="${400 - 86}" y="${yGrilleTop}" width="172" height="${yBumperTop - yGrilleTop - 8}" rx="14" fill="#141a21"/>
    <g fill="#39424f">
      <rect x="${400 - 76}" y="${yGrilleTop + 14}" width="152" height="7" rx="3.5"/>
      <rect x="${400 - 76}" y="${yGrilleTop + 32}" width="152" height="7" rx="3.5"/>
      <rect x="${400 - 76}" y="${yGrilleTop + 50}" width="152" height="7" rx="3.5"/>
    </g>
    <rect x="${400 - 34}" y="${yGrilleTop + (yBumperTop - yGrilleTop) / 2 - 16}" width="68" height="26" rx="6"
          fill="${darken(paint, 0.5)}"/>
    <rect x="${400 - halfW + 20}" y="${yBumperTop}" width="${halfW * 2 - 40}" height="${yBumper - yBumperTop}" rx="16"
          fill="${darken(paint, 0.48)}"/>
    <rect x="${400 - 64}" y="${yBumperTop + 22}" width="128" height="28" rx="8" fill="#e8eef5" stroke="#93a4b7" stroke-width="2"/>
    <rect x="${400 - 96}" y="${yBumper - 16}" width="192" height="16" rx="8" fill="#4a5361" opacity="0.75"/>

    ${mirror(-1)}
    ${mirror(1)}`
}

/** Wheel and tyre close-up, with the vehicle's paint on the caliper. */
const wheelView = (paint) => {
  const r = 168
  return `
    ${carShadow(210)}
    <circle cx="400" cy="330" r="${r + 8}" fill="#0f1218" opacity="0.45"/>
    <circle cx="400" cy="330" r="${r}" fill="#1b1f27"/>
    <circle cx="400" cy="330" r="${r - 16}" fill="none" stroke="#0c0e14" stroke-width="30"
            stroke-dasharray="30 22" opacity="0.85"/>
    <circle cx="400" cy="330" r="${r - 42}" fill="none" stroke="#6d7889" stroke-width="3" opacity="0.45"/>
    <circle cx="400" cy="330" r="${r - 58}" fill="url(#rim)"/>
    <circle cx="400" cy="330" r="${r - 68}" fill="#39424f"/>
    ${spokes(400, 330, 5, r - 72, 40)}
    <circle cx="400" cy="330" r="42" fill="url(#rim)"/>
    ${boltRing(400, 330, 62, 9, 5, 90, '#1d222b')}
    <circle cx="400" cy="330" r="18" fill="${paint}"/>
    <circle cx="400" cy="330" r="18" fill="none" stroke="${darken(paint, 0.45)}" stroke-width="3"/>
    <!-- Brake caliper: an arc band straddling the disc at 3 o'clock, not the
         free-floating blob the first pass drew. -->
    <path d="M 531.8 219.4 A 172 172 0 0 1 531.8 440.6 L 490.4 405.8 A 118 118 0 0 0 490.4 254.2 Z"
          fill="${paint}" stroke="${darken(paint, 0.45)}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="512" y="286" width="42" height="88" rx="12" fill="${darken(paint, 0.42)}"/>`
}

/**
 * Interior: windscreen, dash, cluster, console, wheel, seats.
 *
 * Lit from the windscreen end rather than flatly dark — a cabin drawn in five
 * near-identical greys has no readable depth, which is what the first pass of
 * this looked like.
 */
const interiorView = (paint) => `
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#2b3341"/>
  <path d="M 0 0 h 800 v 214 q -400 74 -800 0 Z" fill="url(#glass)"/>
  <path d="M 0 0 h 800 v 214 q -400 74 -800 0 Z" fill="none" stroke="#0d1117" stroke-width="6"/>
  <path d="M 0 176 q 400 74 800 0 v 96 q -400 70 -800 0 Z" fill="#46505f"/>
  <path d="M 40 250 q 360 66 720 0 l -8 78 q -352 62 -704 0 Z" fill="#333c49"/>
  <rect x="286" y="192" width="228" height="112" rx="16" fill="#0e1219" stroke="#5b6779" stroke-width="3"/>
  <circle cx="346" cy="248" r="38" fill="#1b222c" stroke="#8b98a9" stroke-width="4"/>
  <path d="M 346 248 L 366 226" stroke="#eef3f9" stroke-width="5" stroke-linecap="round"/>
  <circle cx="454" cy="248" r="38" fill="#1b222c" stroke="#8b98a9" stroke-width="4"/>
  <path d="M 454 248 L 438 222" stroke="#eef3f9" stroke-width="5" stroke-linecap="round"/>
  <rect x="404" y="222" width="40" height="56" rx="6" fill="#4f9ad4"/>
  <circle cx="400" cy="392" r="132" fill="none" stroke="#0e1219" stroke-width="32"/>
  <circle cx="400" cy="392" r="132" fill="none" stroke="${paint}" stroke-width="12"/>
  <circle cx="400" cy="392" r="46" fill="#232b36" stroke="#8b98a9" stroke-width="4"/>
  <circle cx="400" cy="392" r="14" fill="${lighten(paint, 0.3)}"/>
  <path d="M 268 392 L 356 392" stroke="#232b36" stroke-width="24" stroke-linecap="round"/>
  <path d="M 444 392 L 532 392" stroke="#232b36" stroke-width="24" stroke-linecap="round"/>
  <path d="M 400 438 L 400 514" stroke="#232b36" stroke-width="24" stroke-linecap="round"/>
  <rect x="358" y="288" width="84" height="26" rx="9" fill="${darken(paint, 0.3)}"/>
  <rect x="196" y="316" width="150" height="230" rx="26" fill="#333c49" stroke="#5b6779" stroke-width="3"/>
  <rect x="216" y="336" width="110" height="70" rx="18" fill="#414b5a"/>
  <rect x="454" y="316" width="150" height="230" rx="26" fill="#333c49" stroke="#5b6779" stroke-width="3"/>
  <rect x="474" y="336" width="110" height="70" rx="18" fill="#414b5a"/>
  <rect x="128" y="266" width="128" height="96" rx="30" fill="#2a323d" stroke="#5b6779" stroke-width="3"/>
  <rect x="544" y="266" width="128" height="96" rx="30" fill="#2a323d" stroke="#5b6779" stroke-width="3"/>
  <rect x="332" y="470" width="136" height="86" rx="14" fill="#232b36" stroke="#5b6779" stroke-width="3"/>
  <rect x="352" y="486" width="96" height="20" rx="8" fill="#4f9ad4" opacity="0.8"/>
  <g fill="#8b98a9">
    <circle cx="360" cy="526" r="9"/><circle cx="392" cy="526" r="9"/><circle cx="424" cy="526" r="9"/>
  </g>`

/** Instrument cluster close-up. */
const dashboardView = (paint) => `
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#171c24"/>
  <rect x="96" y="150" width="608" height="300" rx="34" fill="#10151c" stroke="#3d4653" stroke-width="4"/>
  ${[
    { cx: 266, angle: -50 },
    { cx: 400, angle: 0 },
    { cx: 534, angle: 40 },
  ]
    .map(
      (dial, index) => `
    <circle cx="${dial.cx}" cy="300" r="${index === 1 ? 104 : 92}" fill="#161c24" stroke="#4a5361" stroke-width="4"/>
    <circle cx="${dial.cx}" cy="300" r="${index === 1 ? 88 : 76}" fill="none" stroke="#5f6c7f"
            stroke-width="4" stroke-dasharray="3 13"/>
    ${
      index === 2
        ? `<circle cx="${dial.cx}" cy="300" r="${index === 1 ? 92 : 80}" fill="none" stroke="#c8102e"
                   stroke-width="9" stroke-dasharray="58 445" transform="rotate(-58 ${dial.cx} 300)"/>`
        : ''
    }
    <path d="M ${dial.cx} 300 L ${dial.cx + 58 * Math.cos((dial.angle * Math.PI) / 180)} ${300 + 58 * Math.sin((dial.angle * Math.PI) / 180)}"
          stroke="#e6edf5" stroke-width="6" stroke-linecap="round"/>
    <circle cx="${dial.cx}" cy="300" r="11" fill="${paint}"/>
  `,
    )
    .join('')}
  <rect x="352" y="392" width="96" height="42" rx="10" fill="#2f6f9e" opacity="0.55"/>
  <g fill="#39424f">
    <rect x="140" y="486" width="120" height="16" rx="8"/>
    <rect x="284" y="486" width="120" height="16" rx="8"/>
    <rect x="428" y="486" width="120" height="16" rx="8"/>
    <rect x="572" y="486" width="88" height="16" rx="8"/>
  </g>`

/** Open tailgate onto the load bay. */
const cargoView = (paint) => `
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wall)"/>
  <rect y="420" width="${WIDTH}" height="${HEIGHT - 420}" fill="url(#floor)"/>
  <rect y="419" width="${WIDTH}" height="2" fill="#8b97a8" opacity="0.45"/>
  ${carShadow(250)}
  <path d="M 150 236 h 500 q 24 0 24 24 v 190 q 0 24 -24 24 h -500 q -24 0 -24 -24 v -190 q 0 -24 24 -24 Z"
        fill="url(#paint)" stroke="${darken(paint, 0.55)}" stroke-width="3"/>
  <path d="M 182 268 h 436 v 150 h -436 Z" fill="#1a1f27"/>
  <path d="M 182 268 h 436 v 42 h -436 Z" fill="#2c3440"/>
  <path d="M 182 418 v 32 q 218 22 436 0 v -32 Z" fill="#2a313c"/>
  <rect x="126" y="252" width="34" height="200" rx="12" fill="#c8102e"/>
  <rect x="640" y="252" width="34" height="200" rx="12" fill="#c8102e"/>
  <path d="M 400 176 v 60" stroke="#3d4653" stroke-width="8" stroke-linecap="round"/>
  <path d="M 150 470 h 500" stroke="#0f1218" stroke-width="14" opacity="0.3" stroke-linecap="round"/>`

/** Engine bay, in the vehicle's paint on the car it belongs to. */
const engineView = (paint) => `
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#232a33"/>
  <rect x="60" y="150" width="680" height="330" rx="20" fill="#1a1f27" stroke="#3d4653" stroke-width="4"/>
  <path d="M 132 300 h 372 v 116 q 0 18 -18 18 h -336 q -18 0 -18 -18 Z" fill="url(#steel)"/>
  <path d="M 132 300 h 372 v 116 q 0 18 -18 18 h -336 q -18 0 -18 -18 Z" fill="none" stroke="#5f6c7f" stroke-width="3"/>
  <g>
    <ellipse cx="196" cy="300" rx="36" ry="13" fill="#0d1015" stroke="url(#steel)" stroke-width="5"/>
    <ellipse cx="286" cy="300" rx="36" ry="13" fill="#0d1015" stroke="url(#steel)" stroke-width="5"/>
    <ellipse cx="376" cy="300" rx="36" ry="13" fill="#0d1015" stroke="url(#steel)" stroke-width="5"/>
    <ellipse cx="466" cy="300" rx="36" ry="13" fill="#0d1015" stroke="url(#steel)" stroke-width="5"/>
  </g>
  <rect x="152" y="228" width="300" height="48" rx="14" fill="url(#steel)"/>
  ${boltRing(302, 252, 138, 7, 8, 0, '#6a7889')}
  <circle cx="418" cy="252" r="18" fill="${paint}"/>
  <circle cx="418" cy="252" r="8" fill="${darken(paint, 0.45)}"/>
  <path d="M 520 300 q 96 -6 130 48" fill="none" stroke="#151a21" stroke-width="17" stroke-linecap="round"/>
  <circle cx="648" cy="374" r="42" fill="none" stroke="url(#steel)" stroke-width="14" stroke-dasharray="11 12"/>
  <circle cx="648" cy="374" r="34" fill="url(#steel)"/>
  <circle cx="648" cy="374" r="15" fill="#0d1015"/>
  <rect x="524" y="196" width="150" height="60" rx="12" fill="#1c222c" stroke="#4a5361" stroke-width="3"/>
  <path d="M 546 260 v 26 q 0 14 14 14 h 66" fill="none" stroke="#39424f" stroke-width="9" stroke-linecap="round"/>`

/** Frame name to drawing. */
const VEHICLE_FRAMES = {
  'Side profile': sideProfile,
  'Front view': (paint, s) => faceView(paint, s, 'front'),
  'Rear view': (paint, s) => faceView(paint, s, 'rear'),
  Interior: (paint) => interiorView(paint),
  'Wheels & trim': wheelView,
  Dashboard: (paint) => dashboardView(paint),
  'Cargo area': (paint) => cargoView(paint),
  'Engine bay': (paint) => engineView(paint),
}

/**
 * Frames that fill their own background rather than standing in the showroom.
 * An interior or an engine bay is not a car on a showroom floor, so painting
 * the wall and floor behind one is what would make it look wrong.
 */
const ENCLOSED_FRAMES = new Set(['Interior', 'Dashboard', 'Engine bay'])

/**
 * Vehicle template. Same shape as `sceneSvg` — text-free, backdrops to the
 * card's own rounded edge — but with the showroom behind the exterior frames
 * and the paint gradient rebuilt from this vehicle's colour.
 */
function vehicleSvg({ paint, bodyType, frameIndex }) {
  const shape = BODY_SHAPES[bodyType] ?? BODY_SHAPES.Sedan
  const frame = GALLERY_FRAMES[frameIndex] ?? 'Side profile'
  const draw = VEHICLE_FRAMES[frame] ?? sideProfile

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="presentation">
  <defs>${showroomDefs(paint)}
  </defs>
  ${ENCLOSED_FRAMES.has(frame) ? '' : showroomBackdrop}
  ${draw(paint, shape)}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vig)"/>
</svg>
`
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

/**
 * One SVG per service in the catalogue, so the cards are distinguishable.
 *
 * These carry `scene` rather than `glyph`, so they render without the name and
 * price caption the other placeholders set — the card prints those itself, two
 * lines under the picture. `label` is still passed because it is what a reader
 * of this script expects to see beside the path; `svg()` ignores it for a scene.
 * See `SERVICE_SCENES` for why the service images are the exception.
 *
 * The category fallback is built here rather than listed in `STATIC_FILES`
 * because it is drawn from `SERVICE_SCENES`, and `STATIC_FILES` is evaluated at
 * module scope — a `const` declared below it would throw on access. It has to
 * be a scene and not the usual labelled placeholder, because it is what
 * `OptimizedImage` swaps in when a service image is missing: a lone captioned
 * wrench among eight workshop scenes reads as a broken card.
 */
function serviceFiles() {
  return [
    {
      path: 'services/default.svg',
      category: 'services',
      label: 'Service',
      sublabel: 'Car Kingdom',
      scene: SERVICE_SCENES.default,
    },
    ...SERVICES.map((service) => ({
      path: `services/${service.slug}.svg`,
      category: 'services',
      label: service.name,
      sublabel: `${service.duration} · from $${service.startingPrice}`,
      scene: SERVICE_SCENES[service.icon] ?? SERVICE_SCENES.default,
    })),
  ]
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

/**
 * One SVG per frame of every vehicle's gallery.
 *
 * Paths come from `vehiclePlaceholder()`, not from `vehicle.images`: once real
 * photographs exist, `vehicle.images` holds their paths, and writing SVG to
 * those would both clobber nothing and leave the actual placeholders stale.
 * The placeholder is what `OptimizedImage` falls back to, so it has to keep
 * being regenerated correctly whether or not photographs are present.
 *
 * `label` and `sublabel` are still passed for the summary `main()` prints, but
 * the vehicle template ignores them — the record's name is already on the card
 * that shows the image, and the gallery already numbers its frames.
 */
function vehicleFiles() {
  const frames = Array.from({ length: 8 }, (_, index) => index)

  return VEHICLES.flatMap((vehicle) =>
    frames.slice(0, vehicle.imageCount).map((index) => ({
      path: vehiclePlaceholder(vehicle.slug, index + 1).replace(/^\/images\//, ''),
      category: 'vehicles',
      label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      sublabel: `${vehicle.trim} · ${GALLERY_FRAMES[index] ?? `Photo ${index + 1}`}`,
      vehicle: {
        paint: PAINT[vehicle.exteriorColor] ?? '#2c5f9e',
        bodyType: vehicle.bodyType,
        frameIndex: index,
      },
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
