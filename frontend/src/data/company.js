/**
 * What the dealership promises, as content rather than as copy pasted into a
 * component.
 *
 * These are claims about how the business operates, so they live here in one
 * place where the owner can check and correct them — the About page in Phase 7
 * reads the same list.
 *
 * `icon` is a name resolved to a component by the section that renders it, not
 * JSX, so this file stays plain data.
 */

export const VALUE_PROPS = [
  {
    icon: 'inspection',
    title: 'Inspected before it is listed',
    description:
      'A licensed technician goes through the brakes, tires, fluids, and frame before a vehicle reaches the lot. You get the written report whether or not you ask for it.',
  },
  {
    icon: 'pricing',
    title: 'The price on the tag is the price',
    description:
      'No admin fee, no reconditioning fee, no number that changes once you are sitting at the desk. GST and PST are the only things we add.',
  },
  {
    icon: 'financing',
    title: 'Financing for every credit history',
    description:
      'Good credit, thin credit, or rebuilding after a consumer proposal — we work with lenders who lend to Saskatchewan buyers.',
  },
  {
    icon: 'service',
    title: 'We service what we sell',
    description:
      'Our own shop and our own technicians, on Dudley Street. The person who inspected your car is the person who will fix it.',
  },
]

/** Route-level copy for the About page and the homepage's closing banner. */
export const COMPANY_INTRO = {
  founded: 2016,
  employees: 14,
  summary:
    'Car Kingdom is a family-run dealership and service centre on Dudley Street in Saskatoon. We sell used cars, trucks, and SUVs, service them in our own shop, and keep a parts counter for the makes we do not carry.',
}
