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

/**
 * "Our Company" on the About page.
 *
 * Separate from `COMPANY_INTRO.summary`, which is one sentence sized for the
 * homepage banner. This is the page's own account and is allowed to take three
 * paragraphs to give it.
 */
export const COMPANY_STORY = [
  'Car Kingdom started in 2016 with four vehicles on a rented corner of a lot on Dudley Street and one rule that has not changed: the price on the tag is the price. No admin fee, no reconditioning fee, no figure that moves once you are sitting at the desk.',
  'The shop came next, because selling vehicles you cannot fix is a short business. Today the same technicians who inspect every trade-in also do the brakes, the tires and the diagnostics — so the person who told you the car was sound is the person you bring it back to.',
  'Fourteen people work here now. It is still small enough that the dealer principal signs off on every trade-in, and still local enough that most of what we sell stays in Saskatoon and the towns around it.',
]

/**
 * §38's Mission and Vision.
 *
 * A `statement` and an `explanation` rather than one paragraph, because the
 * statement is the part worth pulling out in larger type and the explanation is
 * what makes it more than a slogan.
 */
export const MISSION = {
  statement:
    'To sell vehicles we would put our own families in, and to keep them on the road afterwards.',
  explanation:
    'That is the whole test. It is why every trade-in goes through an inspection before it is priced, why the shop quotes the work that is actually needed, and why we will tell you a vehicle is not worth what you are about to pay for it.',
}

export const VISION = {
  statement:
    'To be the dealership Saskatoon recommends to the people it likes.',
  explanation:
    'Not the largest, and not the cheapest on the sign. The one somebody sends a friend to, because the price held, the work was honest, and the phone was answered by a person who knew the answer.',
}

/**
 * §38's six values.
 *
 * Distinct from `VALUE_PROPS` above, which are four specific promises about how
 * the lot operates. These are the words behind them — and the reason both exist
 * is that the homepage has room for the promises while the About page is where
 * somebody checks what the business claims to believe.
 *
 * `icon` is a name resolved to a component by the section that renders it, not
 * JSX, so this file stays plain data.
 */
export const COMPANY_VALUES = [
  {
    icon: 'trust',
    title: 'Trust',
    description:
      'The inspection report comes with the vehicle whether or not you ask for it. Nothing here is discovered after the paperwork.',
  },
  {
    icon: 'transparency',
    title: 'Transparency',
    description:
      'The out-the-door number is the number on the tag plus tax. If a fee is not on the tag, we do not charge it.',
  },
  {
    icon: 'quality',
    title: 'Quality',
    description:
      'Vehicles we would drive, parts that fit, and work done by technicians who are certified to do it.',
  },
  {
    icon: 'integrity',
    title: 'Integrity',
    description:
      'We will talk you out of a vehicle that is wrong for you, and we will say when a repair can wait.',
  },
  {
    icon: 'customerFirst',
    title: 'Customer First',
    description:
      'The person who answers the phone owns the question until it is answered. Nobody gets transferred into a void.',
  },
  {
    icon: 'professionalism',
    title: 'Professionalism',
    description:
      'Straight answers, kept appointments, and a call back when we said we would call back.',
  },
]
