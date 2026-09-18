import TeamCard from './TeamCard'
import { TEAM } from '../../data/team'
import { cn } from '../../utils/cn'

/**
 * §38's team grid.
 *
 * Reads `TEAM` directly rather than going through a service, the same way
 * `WhyChooseUs` reads `VALUE_PROPS`. These are facts about the business, not a
 * collection a backend would paginate or filter — and §38 names no endpoint for
 * them, so inventing one would be machinery with nothing on the other end.
 *
 * Four across on a wide screen. Eight cards at four across is two even rows; at
 * three it is a row of three, a row of three, and a row of two, which reads as
 * an accident.
 */
const COLUMNS = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'

export default function TeamGrid({ members = TEAM, className }) {
  return (
    <ul className={cn(COLUMNS, className)}>
      {members.map((member) => (
        <TeamCard key={member.slug} member={member} />
      ))}
    </ul>
  )
}
