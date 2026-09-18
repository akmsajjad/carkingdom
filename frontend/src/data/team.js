/**
 * The people on the About page.
 *
 * ⚠️ PLACEHOLDER CONTENT — these are invented people, not real staff. Replace
 * every entry with the actual team and their own words before this site goes
 * live, the same way `testimonials.js` has to be replaced. A photograph and a
 * name attached to a job title is a claim about a real person; inventing one is
 * only acceptable while the page is a demonstration.
 *
 * `slug` names the image under `public/images/team/`, so adding someone means
 * adding the entry and running `npm run images`. Nothing in `src/` changes.
 *
 * `bio` is written in the third person and avoids pronouns. A placeholder bio
 * cannot know how someone refers to themselves, and guessing wrong about a real
 * person is worse than a sentence that reads slightly stiff.
 *
 * §38 asks each card for exactly four things — image, name, position, bio — so
 * that is all this carries. A department field would repeat what the position
 * already says.
 */

export const TEAM = [
  {
    slug: 'amrit-sandhu',
    name: 'Amrit Sandhu',
    position: 'Dealer Principal',
    bio: 'Opened Car Kingdom in 2016 with four vehicles on a rented lot on Dudley Street. Still signs off on every trade-in, and still answers the phone when the front desk is busy.',
  },
  {
    slug: 'leah-fontaine',
    name: 'Leah Fontaine',
    position: 'General Manager',
    bio: 'Runs the day to day across sales, service and parts. Twenty years in Saskatchewan dealerships, most of it spent fixing the process rather than the customer.',
  },
  {
    slug: 'marco-bertelli',
    name: 'Marco Bertelli',
    position: 'Sales Manager',
    bio: 'Chooses what goes on the lot and prices it. Better known for talking people out of the wrong vehicle than into one.',
  },
  {
    slug: 'priya-raman',
    name: 'Priya Raman',
    position: 'Finance Manager',
    bio: 'Works with lenders across Saskatchewan on the approvals the big banks turn down. Will say plainly when a loan is a bad idea, which costs the dealership a deal and is why people come back.',
  },
  {
    slug: 'dean-mckay',
    name: 'Dean McKay',
    position: 'Service Manager',
    bio: 'A Red Seal technician before moving to the desk. Every used vehicle on the lot has been through the inspection sheet Dean wrote.',
  },
  {
    slug: 'hana-okafor',
    name: 'Hana Okafor',
    position: 'Service Advisor',
    bio: 'The person who calls with the estimate and explains what can wait until next time. Keeps the loaner schedule and the shop calendar in the same head.',
  },
  {
    slug: 'trevor-lindgren',
    name: 'Trevor Lindgren',
    position: 'Master Technician',
    bio: 'Twenty-six years under the hood, the last nine of them here. Takes on the diagnostics other shops send out, and writes the notes the advisors read back to you.',
  },
  {
    slug: 'sasha-volkov',
    name: 'Sasha Volkov',
    position: 'Parts Manager',
    bio: 'Sources genuine and aftermarket parts for the makes the lot does not carry. If it is not on the shelf, the answer is how long it takes to arrive, not whether it exists.',
  },
]
