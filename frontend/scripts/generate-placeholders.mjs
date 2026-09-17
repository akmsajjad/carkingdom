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

function svg({ category, label, sublabel, stroke, glyph }) {
  const body = glyph ?? GLYPHS[category] ?? GLYPHS.general

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${label}">
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
        font-weight="600" fill="#33475f">${label}</text>
  <text x="${WIDTH / 2}" y="536" text-anchor="middle"
        font-family="Inter, Segoe UI, system-ui, sans-serif" font-size="19"
        fill="#6b7d92">${sublabel}</text>
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
]

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
  const files = [...STATIC_FILES, ...vehicleFiles()]

  for (const file of files) {
    const target = join(OUTPUT_ROOT, file.path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, svg(file), 'utf8')
  }

  const vehicles = vehicleFiles().length
  console.log(`${files.length} images written to public/images/`)
  console.log(`  ${STATIC_FILES.length} static, ${vehicles} vehicle gallery frames`)
  console.log(`  from ${VEHICLES.length} vehicles in src/data/vehicles.js`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
