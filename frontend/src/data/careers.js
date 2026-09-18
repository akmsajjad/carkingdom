/**
 * Careers content: what the shop is like to work in, why people stay, and
 * every current opening.
 *
 * §55 keeps business content out of components, and a job posting is the most
 * content-heavy thing on the site — six roles, each with eight sections of
 * copy. Keeping it here means the postings can be edited (or served from a
 * Django endpoint later) without touching a single component.
 *
 * `icon` on a value prop is a name, not JSX, so this file stays plain data and
 * can be `JSON.parse`d from an API response unchanged. `WhyWorkWithUs` resolves
 * the name to a component.
 *
 * Job fields map one-to-one onto §36's detail sections:
 *   overview, duties, responsibilities, skills, qualifications, experience,
 *   benefits — plus the card fields (`title`, `department`, `employmentType`,
 *   `location`, `postedDate`) and the two the posting page promises above the
 *   fold: `wage` and `hours`.
 */

/** The Careers page's opening section. The open-roles count is not here — it
 *  is `JOBS.length`, and baking a number into copy is how it goes stale. */
export const CAREER_OVERVIEW = {
  heading: 'A fourteen-person shop where the work is visible',
  paragraphs: [
    'Car Kingdom is not a chain. The person who inspects a vehicle is the person who fixes it, the person who sells it is sitting ten feet from the person who bought the parts for it, and the owner is on the floor most days. Nobody here is a number on a spreadsheet one time zone away.',
    'That cuts both ways. You will be trusted with real decisions from your first month, and you will be asked why you made them. If you want a job where you clock in, keep your head down and clock out, this is the wrong shop. If you want to be the person who actually knows the cars you work on, it is the right one.',
    'Every role below is a real opening — we are not collecting résumés. Apply for the one that fits, or send us your résumé anyway and tell us which one should have been on the list.',
  ],
  facts: [
    { value: '14', label: 'People on the team' },
    { value: '2016', label: 'On Dudley Street since' },
    { value: '6', label: 'Technicians and apprentices' },
    { value: '2', label: 'Apprentices taken through to journeyperson' },
  ],
}

/** The Careers page's "why work here" cards. */
export const WHY_WORK_WITH_US = [
  {
    icon: 'schedule',
    title: 'The bay doors close at 5:30',
    description:
      'Flat-rate shops pay you to rush and then wonder why the comebacks pile up. We work a normal day, we book realistic hours, and the job does not follow you home.',
  },
  {
    icon: 'training',
    title: 'We pay for the training',
    description:
      'Certification renewals, supplier courses and manufacturer training are on us — the fee and the day off to take it. Nobody has ever been refused a course here.',
  },
  {
    icon: 'growth',
    title: 'Apprentices become journeypersons here',
    description:
      'Two of our technicians started on this floor sweeping the bay. If you want the ticket, we will get you the hours, the mentorship and the exam fee.',
  },
  {
    icon: 'benefits',
    title: 'Benefits that start in three months',
    description:
      'Extended health and dental for you and your household, plus employee pricing on parts, service and vehicles. Part-time roles get the pricing from day one.',
  },
]

/**
 * The open roles.
 *
 * `postedDate` is an ISO date rather than a display string so the card can
 * render "9 days ago" today and "3 weeks ago" next month without anyone
 * editing this file.
 */
export const JOBS = [
  {
    slug: 'service-technician',
    title: 'Automotive Service Technician',
    department: 'Service',
    employmentType: 'Full-time',
    location: 'Saskatoon, SK — on site',
    postedDate: '2026-09-08',
    openings: 2,
    wage: '$32 – $42 per hour, depending on certification',
    hours: 'Monday to Friday, 8:00 AM – 5:00 PM, with an occasional Saturday rotation',
    shortDescription:
      'Diagnose and repair cars, trucks and SUVs in our own shop. Journeypersons and apprentices at any level are both welcome to apply.',
    overview:
      'Our shop runs on two hoists and a steady book of work that is mostly repeat customers and vehicles we sold ourselves. That means you see the same trucks come back and you find out whether your repair held. We are looking for a technician who wants to be the one who diagnoses the fault rather than the one who replaces parts until the light goes out.',
    duties: [
      'Diagnose mechanical, electrical and drivetrain faults using scan tools, wiring diagrams and a road test.',
      'Carry out maintenance and repair work: brakes, suspension, steering, cooling, exhaust and engine jobs.',
      'Complete provincial safety inspections and write up the findings honestly.',
      'Mount, balance and repair tires, including TPMS sensors and alloy wheel work.',
      'Record every job on the work order — the fault found, the parts used and the time it took.',
    ],
    responsibilities: [
      'You own the vehicle from the write-up to the road test. Nobody checks your work after you, so the standard has to be yours.',
      'Anything you find that the customer did not approve gets a phone call before a wrench moves — never an invoice afterwards.',
      'Keep your bay, your tools and the shop equipment clean, calibrated and ready for whoever needs them next.',
      'Work alongside the apprentice. Answer the question they were about to ask, then let them do the job once they can.',
    ],
    skills: [
      'Strong diagnostic reasoning — you find the fault rather than guessing at it.',
      'Confident with scan tools, multimeters and wiring diagrams.',
      'Able to explain a repair to a service advisor in plain language, without jargon.',
      'Organised enough to keep three jobs moving without losing track of one.',
    ],
    qualifications: [
      'Journeyperson certification as an Automotive Service Technician, or an apprentice registered at any level.',
      'Valid driver’s licence and a clean driving record.',
      'Your own hand tools. Specialty and diagnostic tools belong to the shop.',
      'Able to lift 50 lb and stand for a full shift.',
    ],
    experience: [
      'Two or more years in a shop environment — dealership or independent, either counts.',
      'Experience with both gasoline and diesel light trucks is an asset.',
      'Apprentices with strong school marks and no shop time yet are considered. Say so in your cover letter.',
    ],
    benefits: [
      'Tool allowance of $1,500 in your first year and $750 every year after.',
      'Boot and uniform allowance, replaced when they wear out rather than on a schedule.',
      'Paid training and certification renewals, including the day off to take the course.',
      'Extended health and dental after three months.',
    ],
  },

  {
    slug: 'service-advisor',
    title: 'Service Advisor',
    department: 'Service',
    employmentType: 'Full-time',
    location: 'Saskatoon, SK — on site',
    postedDate: '2026-09-12',
    openings: 1,
    wage: '$52,000 – $62,000 per year, plus a monthly performance bonus',
    hours: 'Monday to Friday with a rotating Saturday, roughly 42 hours a week',
    shortDescription:
      'You are the person between the customer and the shop — booking the work, quoting it, explaining it and standing behind it.',
    overview:
      'Most people who walk through our door are having a bad week. Their car is making a noise, they do not know what it costs to fix, and they have been burned before by a shop that found three more things wrong. Your job is to be the person who tells them the truth quickly and then makes the shop keep its word.',
    duties: [
      'Book appointments, check customers in, and write up the concern in the customer’s own words.',
      'Quote work from the technician’s findings and get a documented approval before anything starts.',
      'Keep customers updated through the day — including when the news is that the job is bigger than we thought.',
      'Order parts for scheduled jobs and chase the ones that come back backordered.',
      'Close the ticket, take payment, and book the follow-up visit.',
    ],
    responsibilities: [
      'You are the customer’s advocate in the shop and the shop’s advocate with the customer. Neither one gets thrown under the bus.',
      'No work happens without a documented approval. If it is not on the ticket with a yes beside it, it does not happen.',
      'The quote we give is the price we charge. If the job changes, the customer hears it from you before it changes.',
      'Comebacks get handled the same week, whatever else is on the board.',
    ],
    skills: [
      'A clear, calm phone manner — most of this job is talking to people who are already stressed.',
      'Enough mechanical understanding to turn “there’s a grinding noise when I turn left” into a work order a technician can act on.',
      'Comfortable with shop software, and able to keep a schedule honest when a job runs long.',
      'Able to hold a boundary with a customer without becoming the bad guy.',
    ],
    qualifications: [
      'Two years in a customer-facing role. Service advisor, parts counter or dealership reception experience is an asset.',
      'Valid driver’s licence.',
      'Able to work a rotating Saturday.',
    ],
    experience: [
      'Experience quoting and closing repair orders, or a strong case for why you can learn it quickly.',
      'Familiarity with tire and maintenance pricing is an asset.',
    ],
    benefits: [
      'Monthly performance bonus paid on hours sold and customer feedback — not on upselling work that is not needed.',
      'Extended health and dental after three months.',
      'Paid training on the shop’s scheduling and invoicing systems.',
      'Employee pricing on parts and service.',
    ],
  },

  {
    slug: 'sales-consultant',
    title: 'Sales Consultant',
    department: 'Sales',
    employmentType: 'Full-time',
    location: 'Saskatoon, SK — on site',
    postedDate: '2026-08-30',
    openings: 2,
    wage: '$45,000 base plus commission. First-year consultants typically earn $60,000 – $75,000.',
    hours: 'Monday to Friday 9:00 AM – 6:00 PM, Saturdays 10:00 AM – 5:00 PM, with a weekday off in lieu',
    shortDescription:
      'Sell used cars, trucks and SUVs the way you would want to be sold one — with the history on the table and the price on the tag.',
    overview:
      'We are a used-vehicle lot without a finance office full of add-ons and without a manager who comes out to “see what he can do” on the price. That makes the job simpler and harder at the same time: the product has to stand on its own, and so do you. If you have ever wanted to sell cars without feeling like you need a shower afterwards, this is the lot.',
    duties: [
      'Greet people on the lot and by appointment, and find out what they actually need the vehicle to do.',
      'Walk customers through the vehicle — including the parts of its history that are not flattering.',
      'Write up the deal, take it to the desk, and present the numbers.',
      'Hand the customer to finance and stay with them until the keys are in their hand.',
      'Follow up with everyone who did not buy — once — without becoming a nuisance.',
    ],
    responsibilities: [
      'The price on the tag is the price. You do not have a different number for a customer you think will pay it.',
      'Disclose anything you would want to know if you were the one buying: prior damage, accident history, outstanding recalls.',
      'Your follow-ups stop when the customer asks them to. That is not a lost sale, it is a reputation kept.',
      'Keep the lot presentable — vehicles clean, charged and priced on the windshield, not in your head.',
    ],
    skills: [
      'Able to have a real conversation with someone who has done three weeks of research and someone who has done none, in the same afternoon.',
      'Comfortable talking about money without flinching.',
      'Organised enough to follow a pipeline of twenty people without dropping one.',
      'Able to take a no without taking it personally.',
    ],
    qualifications: [
      'Valid driver’s licence and a clean driving record.',
      'Able to work Saturdays as part of the rotation.',
      'Sales experience preferred but not required — several of our consultants came from other industries entirely.',
    ],
    experience: [
      'Retail, hospitality or commissioned sales is a good background for this role.',
      'Knowledge of the used-vehicle market in Saskatchewan is an asset.',
    ],
    benefits: [
      'Commission with no clawback, paid twice a month rather than held until month end.',
      'Demonstrator vehicle available to top performers.',
      'Extended health and dental after three months.',
      'Employee pricing on vehicles, parts and service.',
    ],
  },

  {
    slug: 'parts-counter-associate',
    title: 'Parts Counter Associate',
    department: 'Parts',
    employmentType: 'Full-time',
    location: 'Saskatoon, SK — on site',
    postedDate: '2026-09-15',
    openings: 1,
    wage: '$22 – $27 per hour, depending on experience',
    hours: 'Monday to Friday 8:00 AM – 5:00 PM, with a Saturday rotation of 10:00 AM – 3:00 PM',
    shortDescription:
      'Run the counter for walk-in customers, our own technicians and phone orders — and get the part right the first time.',
    overview:
      'Our parts counter serves three masters: the public, our own shop, and the phone. The catalogue will tell you a part fits; the customer will come back on Tuesday and tell you it did not. This role suits someone who would rather spend ninety seconds checking a measurement than a week processing a return.',
    duties: [
      'Serve the counter — walk-in customers, the shop’s technicians and phone orders.',
      'Look up parts by VIN, by year/make/model, and by measuring the old part against a catalogue.',
      'Order from suppliers, receive the shipment, and check what arrived against the invoice.',
      'Price parts for the counter and for repair orders, and keep the shelf pricing current.',
      'Take inventory counts and flag the lines that keep going missing.',
    ],
    responsibilities: [
      'If you sell a part that does not fit, you own the return. You do not send the customer away with “that is what the computer said”.',
      'Nothing leaves the counter on a guess. If you are not certain it fits, you check.',
      'The shelf and the system agree. When they do not, the shelf is right and the system gets fixed.',
      'Warranty and core returns get processed the week they come in, not at month end.',
    ],
    skills: [
      'Comfortable with catalogues, interchange numbers and the fact that the same truck was sold with three different brake packages.',
      'Able to work a counter with a technician on the phone and a customer at the desk at the same time.',
      'Basic computer skills. The parts system is taught on the job.',
      'Careful enough to notice when a box is the wrong shape for the part number on it.',
    ],
    qualifications: [
      'Valid driver’s licence.',
      'Able to lift 50 lb and spend most of the day on your feet.',
      'Automotive parts experience preferred; a mechanical background and a willingness to learn is accepted.',
    ],
    experience: [
      'Previous counter, warehouse or parts department experience is an asset.',
      'Knowledge of the makes we service helps, but the catalogues cover it.',
    ],
    benefits: [
      'No evening shifts — the counter closes at 5:00 PM.',
      'Employee pricing on parts and service.',
      'Extended health and dental after three months.',
      'Paid supplier training, including the courses the jobber runs out of town.',
    ],
  },

  {
    slug: 'finance-manager',
    title: 'Finance & Insurance Manager',
    department: 'Finance',
    employmentType: 'Full-time',
    location: 'Saskatoon, SK — on site',
    postedDate: '2026-09-03',
    openings: 1,
    wage: '$65,000 – $80,000 per year, plus a performance bonus',
    hours: 'Monday to Friday 9:00 AM – 6:00 PM, Saturdays 10:00 AM – 5:00 PM as part of the rotation',
    shortDescription:
      'Place loans across our lender panel, present the paperwork honestly, and get deals funded — including the ones other lots give up on.',
    overview:
      'A large share of our customers are rebuilding credit, new to the country, or self-employed with paperwork that does not look like a pay stub. Placing those deals takes patience and a genuine lender panel, and it is the part of the business we are proudest of. We are looking for someone who sees a thin file as a puzzle rather than a rejection.',
    duties: [
      'Work with the customer’s own bank and with our lender panel to find a placement that fits their budget.',
      'Prepare and present the finance and insurance paperwork, and explain what each line costs.',
      'Handle lender submissions, stipulations and funding, and chase down what is outstanding.',
      'Present extended warranty, tire and rim, and gap coverage — and take no for an answer.',
      'Keep every deal jacket complete and audit-ready.',
    ],
    responsibilities: [
      'Every product you present is explained in plain language with its actual price on it. Nothing is added to a payment without the customer knowing what it is.',
      'A customer with thin credit gets the same effort as one with perfect credit.',
      'The rate we quote is the rate we can get. If the lender comes back higher, the customer hears it before they sign.',
      'Privacy. Customer financial information does not leave the office, and does not get discussed on the showroom floor.',
    ],
    skills: [
      'Fluent in the difference between what a lender will approve and what a customer can afford, and able to say so plainly.',
      'Able to explain a 72-month term without either flattering or frightening the customer.',
      'Detail-obsessed — a missing signature costs a week of funding delay.',
      'Able to keep a lender relationship warm while pushing them for an answer.',
    ],
    qualifications: [
      'Two or more years in automotive finance, or in lending, credit or banking with a move into automotive.',
      'Familiarity with Saskatchewan’s consumer protection rules and lender stipulation requirements.',
      'Willingness to complete F&I certification if you do not already hold it.',
    ],
    experience: [
      'A track record of funding deals across a range of credit profiles.',
      'Experience with a dealer management system is an asset.',
    ],
    benefits: [
      'Performance bonus tied to funded deals and product penetration — not to how hard you pushed.',
      'Certification and licensing fees paid by the shop.',
      'Extended health and dental after three months.',
      'Employee pricing on vehicles, parts and service.',
    ],
  },

  {
    slug: 'vehicle-detailer',
    title: 'Vehicle Detailer',
    department: 'Operations',
    employmentType: 'Part-time',
    location: 'Saskatoon, SK — on site',
    postedDate: '2026-09-16',
    openings: 2,
    wage: '$19 – $23 per hour',
    hours: 'Three or four days a week, 8:00 AM – 4:00 PM. The days are negotiable.',
    shortDescription:
      'Make every vehicle on this lot look like the photograph — including the trade-ins nobody else wants to touch.',
    overview:
      'A used vehicle is judged in the first four seconds, and most of that judgement is whether it is clean. This is not a job where you are handed a hose and left alone: you will be shown how we correct paint, what order to work in, and why the buckets are separated. Days are flexible, which makes this a good fit around school or family.',
    duties: [
      'Wash, clay, polish and vacuum vehicles before they go on the lot and before they are delivered.',
      'Clean interiors — carpets, upholstery, glass, vents and the places customers find a week later.',
      'Assess trade-ins that need more than a wash and tell us what you found.',
      'Keep the wash bay, the equipment and the chemicals organised and safely stored.',
      'Photograph vehicles once they are clean, following the shot list we use for listings.',
    ],
    responsibilities: [
      'A vehicle does not leave your bay with a swirl mark you can see in daylight. If it does, it comes back.',
      'Anything you find while cleaning — a stain, a smell, a leak — gets reported, never covered up.',
      'Buckets, mitts and pads stay separated by stage. One grit of dirt in the wrong bucket is a repaint.',
      'Lock the bay and put the chemicals away at the end of every shift.',
    ],
    skills: [
      'Able to work to a standard rather than to a clock while still finishing the day’s list.',
      'Comfortable with a polisher and a pressure washer, or willing to be taught properly.',
      'Able to work outdoors in a Saskatoon winter — the wash bay is heated, the lot is not.',
      'Careful with other people’s property. You will be moving vehicles that are already sold.',
    ],
    qualifications: [
      'Valid driver’s licence and a clean driving record — you will be moving vehicles on the lot.',
      'Able to stand, bend and lift for a full shift.',
      'No detailing experience required. We will train the right person.',
    ],
    experience: [
      'Previous detailing, wash-bay or lot-attendant work is an asset.',
      'Paint correction or ceramic coating experience is an asset, and paid accordingly.',
    ],
    benefits: [
      'Flexible days — this suits a student or a parent looking for school-hour work.',
      'All products and equipment provided, including the good pressure washer.',
      'Employee pricing on parts and service from day one, part-time included.',
      'A heated bay in winter.',
    ],
  },
]
