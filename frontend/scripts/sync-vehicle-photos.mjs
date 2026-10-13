/**
 * Wires real vehicle photography into the inventory, if any is present.
 *
 * Drop photographs into `public/images/vehicles/` named after the vehicle slug
 * and the frame number that `vehicleImage()` already asks for:
 *
 *     public/images/vehicles/2024-toyota-camry-se-1.webp
 *     public/images/vehicles/2024-toyota-camry-se-2.webp
 *     ...
 *
 * then run `npm run photos` (or `npm run images`, which chains it). This scans
 * that directory and writes `src/data/vehicle-photos.js`, which is what
 * `utils/images.js` reads. No component or data file is edited, and no path is
 * written by hand.
 *
 * Why a generated manifest rather than discovering the files at runtime:
 * `utils/images.js` is imported under plain Node by
 * `generate-placeholders.mjs`, so `import.meta.glob` is not available to it,
 * and a runtime probe would fire a 404 per missing photo on every page load.
 * The manifest is a plain data module, so it resolves identically in Vite and
 * in Node, and the browser only ever requests files that exist.
 *
 * Extension order is a preference, not a filter: the first one present for a
 * given slot wins, so a folder holding a mix of WebP and JPEG still works.
 * Vehicles with no photographs at all — and slots with no photograph even when
 * a sibling slot has one — keep their generated SVG placeholder.
 */

import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VEHICLES } from '../src/data/vehicles.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const VEHICLE_DIR = join(ROOT, 'public', 'images', 'vehicles')
const OUT_FILE = join(ROOT, 'src', 'data', 'vehicle-photos.js')

/** Most-preferred first. WebP and AVIF are the sizes worth shipping. */
const EXTENSIONS = ['webp', 'avif', 'jpg', 'jpeg', 'png']

/** One per entry in `GALLERY_FRAMES`; nothing reads past the gallery length. */
const MAX_FRAMES = 8

function scan() {
  if (!existsSync(VEHICLE_DIR)) return {}

  const present = new Set(readdirSync(VEHICLE_DIR))
  const photos = {}

  for (const vehicle of VEHICLES) {
    const frames = {}

    for (let index = 1; index <= Math.min(vehicle.imageCount, MAX_FRAMES); index += 1) {
      const found = EXTENSIONS.find((ext) =>
        present.has(`${vehicle.slug}-${index}.${ext}`),
      )
      if (found) frames[index] = `/images/vehicles/${vehicle.slug}-${index}.${found}`
    }

    if (Object.keys(frames).length > 0) photos[vehicle.slug] = frames
  }

  return photos
}

function render(photos) {
  const slugs = Object.keys(photos).sort()
  const slots = slugs.reduce(
    (total, slug) => total + Object.keys(photos[slug]).length,
    0,
  )

  const body = slugs
    .map((slug) => {
      const frames = Object.keys(photos[slug])
        .map(Number)
        .sort((a, b) => a - b)
        .map((index) => `    ${index}: '${photos[slug][index]}',`)
        .join('\n')
      return `  '${slug}': {\n${frames}\n  },`
    })
    .join('\n')

  return `/**
 * GENERATED FILE — do not edit.
 *
 * Written by \`scripts/sync-vehicle-photos.mjs\` (\`npm run photos\`), which scans
 * \`public/images/vehicles/\` for photography named after each vehicle slug.
 * Editing this by hand is pointless: the next run overwrites it.
 *
 * ${slugs.length} of ${VEHICLES.length} vehicles have photographs, covering ${slots} of their frames.
 * Every slot not listed here falls back to the generated SVG placeholder in
 * \`public/images/vehicles/\`, via \`vehicleImage()\` in \`utils/images.js\`.
 */

export const VEHICLE_PHOTOS = {
${body}
}
`
}

const photos = scan()
writeFileSync(OUT_FILE, render(photos), 'utf8')

const vehicles = Object.keys(photos).length
const frames = Object.values(photos).reduce(
  (total, f) => total + Object.keys(f).length,
  0,
)

console.log(
  vehicles === 0
    ? `No vehicle photographs found in public/images/vehicles/ — all ${VEHICLES.length} vehicles use their SVG placeholder.`
    : `${frames} vehicle photographs wired across ${vehicles} of ${VEHICLES.length} vehicles.`,
)
console.log('  wrote src/data/vehicle-photos.js')
