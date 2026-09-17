/**
 * Navigation structure, in one place. The navbar, the mobile drawer, and the
 * footer all read from here, so adding a page means editing one array.
 */
import { FEATURED_SERVICE_SLUGS, SERVICES } from './services'

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Used Cars', to: '/used-cars' },
  { label: 'Services', to: '/services' },
  { label: 'Parts', to: '/parts' },
  { label: 'Careers', to: '/careers' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

/**
 * The footer's service column is built from the catalogue rather than typed
 * out. The hand-written version listed four slugs — `brake-suspension-services`,
 * `tire-wheel-services`, `engine-transmission`, `detailing` — of which only one
 * was ever real, and they sat there pointing at nothing until the service pages
 * started returning 404s for unknown slugs. Deriving the list means a service
 * that is renamed or removed cannot leave a dead link behind.
 */
const SERVICE_LINKS = FEATURED_SERVICE_SLUGS.map((slug) =>
  SERVICES.find((service) => service.slug === slug),
)
  .filter(Boolean)
  .map((service) => ({
    label: service.shortName,
    to: `/services/${service.slug}`,
  }))

export const FOOTER_SECTIONS = [
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Our Team', to: '/about#team' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Vehicles',
    links: [
      { label: 'Used Cars', to: '/used-cars' },
      { label: 'New Cars', to: '/used-cars?condition=New' },
      { label: 'Featured Vehicles', to: '/used-cars?featured=true' },
      { label: 'Favorites', to: '/favorites' },
      { label: 'Compare', to: '/compare' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'All Services', to: '/services' },
      ...SERVICE_LINKS,
      { label: 'Book an Appointment', to: '/appointments' },
    ],
  },
  {
    title: 'Parts',
    links: [
      { label: 'All Parts', to: '/parts' },
      { label: 'Battery', to: '/parts?category=Battery' },
      { label: 'Brakes', to: '/parts?category=Brakes' },
      { label: 'Engine', to: '/parts?category=Engine' },
      { label: 'Electrical', to: '/parts?category=Electrical' },
      { label: 'Suspension', to: '/parts?category=Suspension' },
    ],
  },
]
