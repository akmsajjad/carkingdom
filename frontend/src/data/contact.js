/**
 * What a contact enquiry can be about.
 *
 * §39 asks the contact form for a Subject field. A select rather than free text
 * because the answer decides where the message goes: a parts question and a
 * financing question are read by different people, and a subject line the
 * customer types themselves is one somebody has to interpret before they can
 * route it.
 *
 * `value` is what the backend receives, so it is stable and machine-readable.
 * The labels are what the customer reads, and can be reworded freely.
 *
 * Deliberately no careers option — the careers page owns applications, with a
 * form that asks for a résumé and a posting. A second path to the same
 * department would split the applications across two inboxes.
 */
export const CONTACT_SUBJECTS = [
  { value: 'general', label: 'A general question' },
  { value: 'vehicle', label: 'About a vehicle on the lot' },
  { value: 'service', label: 'Service or repair' },
  { value: 'parts', label: 'Parts or accessories' },
  { value: 'financing', label: 'Financing and approvals' },
  { value: 'other', label: 'Something else' },
]

/**
 * The three ways §39 wants the contact page to offer, besides the form.
 *
 * Held here rather than written into the page because each one is a label, a
 * description and a destination that have to agree — and because the phone
 * number and address behind two of them already live in `site.js`.
 */
export const CONTACT_METHODS = [
  {
    key: 'call',
    icon: 'phone',
    title: 'Call the dealership',
    description:
      'The fastest way to reach someone. Ask for sales, service or parts and you will get that department, not a menu.',
  },
  {
    key: 'email',
    icon: 'mail',
    title: 'Email us',
    description:
      'Good for anything with a photo or a document attached — a VIN, an insurance quote, or a photo of a warning light.',
  },
  {
    key: 'appointment',
    icon: 'calendar',
    title: 'Book an appointment',
    description:
      'Pick a service and a time that suits you and we will hold the slot. Confirmed by phone or email within one business day.',
  },
]
