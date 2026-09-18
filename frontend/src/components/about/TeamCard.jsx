import OptimizedImage from '../common/OptimizedImage'
import { teamImage } from '../../utils/images'

/**
 * One person on the About page.
 *
 * §38 asks the card for four things — a demo image, a name, a position and a
 * bio — and this renders exactly those, in that order. The image is a
 * placeholder portrait from `public/images/team/`, generated from the same
 * `slug` that identifies the member, so replacing one with a photograph is
 * dropping a file in and changing nothing here.
 *
 * The whole card is not a link. There is nowhere for a team member to go: no
 * profile page, no email address published on their behalf. A card that lifts
 * on hover and does nothing when clicked is a worse lie than a card that stays
 * still.
 */
export default function TeamCard({ member }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <OptimizedImage
        src={teamImage(member.slug)}
        alt={`Portrait of ${member.name}`}
        category="team"
        className="aspect-4/3"
      />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-brand-900">
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-accent-700">
          {member.position}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {member.bio}
        </p>
      </div>
    </li>
  )
}
