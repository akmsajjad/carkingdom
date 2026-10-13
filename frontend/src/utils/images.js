/**
 * Central image configuration.
 *
 * Every image path in the application is either built here or referenced from
 * mock data via these helpers — nothing is hardcoded in JSX.
 *
 * Placeholders are SVG because the demo has no real photography yet. Real
 * vehicle photographs are picked up automatically: see the note on
 * `vehicleImage()` below.
 */

import { VEHICLE_PHOTOS } from '../data/vehicle-photos.js'

export const IMAGE_CATEGORIES = [
  'general',
  'vehicles',
  'services',
  'parts',
  'team',
  'careers',
]

/** Shown when an image is missing or fails to load. */
export const FALLBACK_IMAGES = {
  general: '/images/general/default.svg',
  vehicles: '/images/vehicles/default.svg',
  services: '/images/services/default.svg',
  parts: '/images/parts/default.svg',
  team: '/images/team/default.svg',
  careers: '/images/careers/default.svg',
}

export function getFallback(category = 'general') {
  return FALLBACK_IMAGES[category] ?? FALLBACK_IMAGES.general
}

/**
 * Builds a path to a vehicle image.
 *
 * Returns real photography when `scripts/sync-vehicle-photos.mjs` has found any
 * for this vehicle and frame, and the generated SVG placeholder otherwise. The
 * choice is per frame, not per vehicle, so a gallery half-filled with photos
 * still renders — the photographed slots show the car and the rest show the
 * placeholder, rather than the whole gallery dropping to placeholders because
 * one frame is missing.
 *
 * @param {string} slug  e.g. '2024-toyota-camry-se'
 * @param {number} index 1-based image number
 */
export function vehicleImage(slug, index = 1) {
  return VEHICLE_PHOTOS[slug]?.[index] ?? vehiclePlaceholder(slug, index)
}

/**
 * The generated placeholder, ignoring photography.
 *
 * `generate-placeholders.mjs` writes and overwrites these files, so it must ask
 * for them by name even once `vehicleImage()` has started returning a .webp —
 * otherwise the pipeline would try to write SVG into a photo's path.
 */
export function vehiclePlaceholder(slug, index = 1) {
  return `/images/vehicles/${slug}-${index}.svg`
}

export function serviceImage(slug) {
  return `/images/services/${slug}.svg`
}

export function partImage(slug) {
  return `/images/parts/${slug}.svg`
}

export function teamImage(slug) {
  return `/images/team/${slug}.svg`
}

export function careerImage(slug) {
  return `/images/careers/${slug}.svg`
}

/**
 * Shared site imagery — the showroom, the service bay, the parts counter, the
 * About page photograph.
 *
 * These files have been generated since Phase 1 but nothing referenced them
 * until the About page needed one, so `general` was the only category with no
 * helper and the alternative was a path written straight into JSX. §3 puts every
 * image path in this module, and a category that is exempt from that is the one
 * that ends up hardcoded.
 */
export function generalImage(slug) {
  return `/images/general/${slug}.svg`
}

/**
 * The homepage hero background.
 *
 * A full-bleed banner rather than a picture of a record, so there is no slug to
 * build a path from and it sits outside the category helpers above — the same
 * reasoning as `BRAND_IMAGES` below. One fixed file, named here so `Hero.jsx`
 * carries no path of its own.
 *
 * Unlike everything else in this module it is a raster photograph, not a
 * generated SVG. It is also by far the heaviest asset the site ships — 1448x1086
 * PNG at 2.19 MiB, which is half of the entire build — and it is the first thing
 * the homepage paints, so it is the LCP element on the busiest page. It has been
 * left as supplied rather than re-encoded, but the number is worth recording:
 * the same image through Chrome's WebP encoder is 188 KB at quality 0.82, a
 * twelfth of the size. The file lives at `public/images/hero/carhero.png`;
 * re-encoding it needs no code change here, only the path swapping.
 */
export const HERO_IMAGE = '/images/hero/carhero.png'

/**
 * Brand artwork.
 *
 * The logo is not a content image and is kept out of the category helpers
 * above, because those exist to build paths from data — a vehicle slug, a part
 * slug — and the logo has no slug. It is one fixed file, named here so the
 * components that draw it do not carry paths.
 *
 * One file, not two: the master artwork is drawn in near-white — its wordmark
 * and hexagon are around #fcfcfc — so it needs a dark ground, and every surface
 * that shows it now has one. The header and footer are dark for exactly this
 * reason, and the mobile navigation drawer is dark to match the header, so a
 * light-ground variant would have no caller left.
 *
 * Generated from `scripts/assets/car-kingdom-logo.png` by `npm run logo`.
 */
export const BRAND_IMAGES = {
  badgeOnDark: '/images/general/logo-full-on-dark.png',
}
