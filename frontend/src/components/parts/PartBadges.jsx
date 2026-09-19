import Badge from '../common/Badge'

/**
 * The chips that sit over a part photo.
 *
 * A part can be several of these at once — on sale *and* low stock *and*
 * universal — so this returns a group rather than picking one, which is what
 * the vehicle badges do for condition and status. Order is deliberate: the
 * discount is what a customer scanning a grid is looking for, so it leads, and
 * "universal fit" comes last because it is a property of the part rather than a
 * reason to buy it today.
 *
 * "On sale" takes the brand red and "featured" takes graphite. Both can appear
 * on one part, and the two used to be told apart by the accent being gold —
 * now that the accent is the same red as `danger`, leaving them as they were
 * would have printed two identical chips side by side.
 */
export default function PartBadges({ part, className }) {
  const badges = []

  if (part.salePrice) {
    badges.push({ key: 'sale', variant: 'accent', label: 'On sale' })
  }

  if (part.featured) {
    badges.push({ key: 'featured', variant: 'brand', label: 'Featured' })
  }

  if (!part.inStock) {
    badges.push({ key: 'stock', variant: 'neutral', label: 'Out of stock' })
  } else if (part.stock <= 4) {
    // Only once stock is genuinely low. Flagging everything under a dozen would
    // make the badge meaningless on a catalogue where most lines are stocked in
    // single digits.
    badges.push({ key: 'low', variant: 'overlay', label: `Only ${part.stock} left` })
  }

  if (part.universal) {
    badges.push({ key: 'universal', variant: 'brand', label: 'Universal fit' })
  }

  if (badges.length === 0) return null

  return (
    <div className={className}>
      <ul className="flex flex-wrap items-center gap-1.5">
        {badges.map((badge) => (
          <li key={badge.key}>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
