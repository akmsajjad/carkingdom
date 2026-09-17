import SectionHeading from '../common/SectionHeading'
import VehicleGrid from './VehicleGrid'
import { cn } from '../../utils/cn'

/**
 * "Similar vehicles", at the foot of a vehicle page.
 *
 * The section removes itself when there is nothing to show rather than
 * rendering a heading over an empty state. "No similar vehicles" is not useful
 * news, and it draws attention to a dead end at the exact moment the customer
 * has finished reading and is deciding what to do next.
 */
export default function SimilarVehicles({ vehicles = [], loading = false, className }) {
  if (!loading && vehicles.length === 0) return null

  return (
    <section className={cn(className)}>
      <SectionHeading
        eyebrow="Still looking?"
        title="Similar vehicles on the lot"
        description="Same body style, closest in price to the one you were just looking at."
      />

      <div className="mt-8">
        <VehicleGrid vehicles={vehicles} loading={loading} skeletonCount={3} />
      </div>
    </section>
  )
}
