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
