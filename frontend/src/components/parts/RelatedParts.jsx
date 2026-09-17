import SectionHeading from '../common/SectionHeading'
import PartGrid from './PartGrid'
import { cn } from '../../utils/cn'

/**
 * "Related parts", at the foot of a product page.
 *
 * Like `SimilarVehicles`, the section removes itself when there is nothing to
 * show rather than rendering a heading over an empty state — "no related parts"
 * is not useful news, and it draws attention to a dead end at the moment the
 * customer has finished reading.
 *
 * The description is written to match how the ranking actually works, so it is
 * not promising a relationship the results do not have: same category first,
 * then the same brand.
 */
export default function RelatedParts({ parts = [], loading = false, className }) {
  if (!loading && parts.length === 0) return null

  return (
    <section className={cn(className)}>
      <SectionHeading
        eyebrow="While you are here"
        title="Related parts"
        description="The same category first, then the same brand — the alternatives a counter clerk would put on the counter next to this one."
      />

      <div className="mt-8">
        <PartGrid parts={parts} loading={loading} skeletonCount={3} />
      </div>
    </section>
  )
}
