import { ArrowLeftRight, Heart } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useCompare } from '../../context/CompareContext'
import { useFavorites } from '../../context/FavoritesContext'

/**
 * The favourite and compare toggles, shared by the grid card and the list row.
 *
 * Both are `aria-pressed` toggle buttons rather than links: they change state in
 * place and never navigate, so a button is the honest element. Each label names
 * the vehicle, because a grid can put twenty of these on one screen and
 * "Add to favorites" alone would not say which car it belongs to.
 *
 * The compare button stays enabled when the comparison is already full — the
 * context refuses the addition and explains why in a toast, which is more
 * useful than a control that has gone quietly dead.
 */

const SIZES = {
  sm: 'size-9',
  md: 'size-10',
}

export default function VehicleActions({ vehicle, variant = 'inline', className }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isComparing, toggleCompare } = useCompare()

  const saved = isFavorite(vehicle.id)
  const comparing = isComparing(vehicle.id)

  // Over the photograph the buttons need their own surface to stay legible;
  // in the card body they can sit flat.
  const base = cn(
    'inline-flex items-center justify-center rounded-full transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
    SIZES[variant === 'overlay' ? 'sm' : 'md'],
    variant === 'overlay'
      ? 'bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white'
      : 'border border-slate-200 bg-white hover:border-slate-300',
  )

  const tone = (active, activeClasses) =>
    active ? activeClasses : 'text-slate-500 hover:text-brand-900'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={
          saved
            ? `Remove ${vehicle.title} from favorites`
            : `Save ${vehicle.title} to favorites`
        }
        title={saved ? 'Remove from favorites' : 'Save to favorites'}
        onClick={() => toggleFavorite(vehicle.id, vehicle.title)}
        className={cn(base, tone(saved, 'text-red-600'))}
      >
        <Heart
          className={cn('size-4', saved && 'fill-current')}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        aria-pressed={comparing}
        aria-label={
          comparing
            ? `Remove ${vehicle.title} from comparison`
            : `Add ${vehicle.title} to comparison`
        }
        title={comparing ? 'Remove from comparison' : 'Add to comparison'}
        onClick={() => toggleCompare(vehicle.id, vehicle.title)}
        className={cn(base, tone(comparing, 'text-brand-700'))}
      >
        <ArrowLeftRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
