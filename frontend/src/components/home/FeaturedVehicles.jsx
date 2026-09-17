import { ArrowRight } from 'lucide-react'
import Button from '../common/Button'
import SectionHeading from '../common/SectionHeading'
import VehicleGrid from '../vehicles/VehicleGrid'

/**
 * The featured vehicles strip.
 *
 * Reuses `VehicleGrid` rather than its own markup, so the homepage cards are
 * the marketplace cards — including their loading, error and empty states. The
 * count is passed in from the homepage, which has already fetched the list for
 * the hero.
 */
export default function FeaturedVehicles({
  vehicles = [],
  loading = false,
  error = null,
  onRetry,
  total,
}) {
  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow="This week's lot"
        title="Featured vehicles"
        description="A rotating pick of what is on the lot right now. Every one has been inspected and comes with its history report."
        className="max-w-2xl"
      />

      <div className="mt-10">
        <VehicleGrid
          vehicles={vehicles}
          loading={loading}
          error={error}
          onRetry={onRetry}
          skeletonCount={3}
          emptyTitle="No featured vehicles right now"
          emptyDescription="New stock is added every week. Browse the full inventory to see everything currently available."
        />
      </div>

      <div className="mt-10 flex justify-center">
        <Button to="/used-cars" variant="outline" size="lg" iconRight={ArrowRight}>
          {total ? `View all ${total} vehicles` : 'View all inventory'}
        </Button>
      </div>
    </section>
  )
}
