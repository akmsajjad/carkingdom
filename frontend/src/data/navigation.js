/**
 * Navigation structure, in one place. The navbar, the mobile drawer, and the
 * footer all read from here, so adding a page means editing one array.
 */

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Used Cars', to: '/used-cars' },
  { label: 'Services', to: '/services' },
  { label: 'Parts', to: '/parts' },
  { label: 'Careers', to: '/careers' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

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
      { label: 'Oil Change', to: '/services/oil-change' },
      { label: 'Brakes', to: '/services/brake-suspension-services' },
      { label: 'Tires', to: '/services/tire-wheel-services' },
      { label: 'Engine', to: '/services/engine-transmission' },
      { label: 'Detailing', to: '/services/detailing' },
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
