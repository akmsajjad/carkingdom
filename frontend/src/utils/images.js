/**
 * Central image configuration.
 *
 * Every image path in the application is either built here or referenced from
 * mock data via these helpers — nothing is hardcoded in JSX. To swap in the
 * real Car Kingdom photography, drop files into `public/images/` using the same
 * names; no component changes are required.
 *
 * Placeholders are SVG because the demo has no real photography yet. When real
 * photos arrive you can either keep the .svg fallbacks or rename these paths —
 * they are defined once, here.
 */

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
 * @param {string} slug  e.g. 'toyota-camry-2024'
 * @param {number} index 1-based image number
 */
export function vehicleImage(slug, index = 1) {
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
