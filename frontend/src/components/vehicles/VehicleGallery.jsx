import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import Modal from '../common/Modal'
import OptimizedImage from '../common/OptimizedImage'
import VehicleActions from './VehicleActions'
import VehicleBadges from './VehicleBadges'
import { cn } from '../../utils/cn'

const ARROW_CLASSES =
  'absolute top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500'

/**
 * The vehicle photo gallery.
 *
 * Every image is in the DOM as a thumbnail, so the whole set is reachable by
 * keyboard through ordinary Tab and Enter on the thumbnail buttons rather than
 * through a hand-rolled arrow-key handler. Arrow keys are the expected idiom in
 * a gallery, but a half-implemented roving-tabindex pattern is worse than none:
 * it takes the thumbnails out of the tab order and then traps anyone whose
 * browser or screen reader handles the keys differently.
 *
 * The counter ("3 / 5") is not decoration — it is the only thing that tells a
 * screen-reader user where in the set they are, since the alt text changes but
 * the position does not otherwise surface.
 */
export default function VehicleGallery({ vehicle, className }) {
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const images = vehicle.images
  const total = images.length

  // `index` can outlive a shorter image list if the vehicle changes under a
  // reused component instance, so it is clamped rather than trusted.
  const safeIndex = Math.min(index, total - 1)
  const current = images[safeIndex]

  const go = (step) => setIndex((safeIndex + step + total) % total)

  return (
    <div className={className}>
      <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <OptimizedImage
          src={current}
          alt={`${vehicle.title} — photo ${safeIndex + 1} of ${total}`}
          category="vehicles"
          eager
          className={cn(vehicle.status === 'sold' && 'opacity-70 saturate-50')}
        />

        <VehicleBadges vehicle={vehicle} className="absolute top-3 left-3" />

        <VehicleActions
          vehicle={vehicle}
          variant="overlay"
          className="absolute top-3 right-3 z-10"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className={cn(ARROW_CLASSES, 'left-3')}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className={cn(ARROW_CLASSES, 'right-3')}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="View photo full size"
          className="absolute right-3 bottom-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          <Expand className="size-4" aria-hidden="true" />
        </button>

        <p className="absolute bottom-3 left-3 rounded-md bg-brand-950/80 px-2 py-0.5 text-xs font-medium text-white tabular-nums backdrop-blur-sm">
          {safeIndex + 1} / {total}
        </p>
      </div>

      {total > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, position) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-current={position === safeIndex ? 'true' : undefined}
                aria-label={`Show photo ${position + 1} of ${total}`}
                className={cn(
                  'block w-full overflow-hidden rounded-lg border-2 transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
                  position === safeIndex
                    ? 'border-accent-500'
                    : 'border-transparent hover:border-slate-300',
                )}
              >
                <OptimizedImage
                  src={src}
                  alt=""
                  category="vehicles"
                  className="aspect-4/3"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={zoomed}
        onClose={() => setZoomed(false)}
        title={vehicle.title}
        description={`Photo ${safeIndex + 1} of ${total}`}
        size="xl"
      >
        <OptimizedImage
          src={current}
          alt={`${vehicle.title} — photo ${safeIndex + 1} of ${total}`}
          category="vehicles"
          eager
          className="rounded-lg"
        />
      </Modal>
    </div>
  )
}
