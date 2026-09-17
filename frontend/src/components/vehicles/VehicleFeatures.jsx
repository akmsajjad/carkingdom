import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * The equipment list.
 *
 * Plain text with a check glyph rather than icons guessed per feature: a
 * "Heated front seats" row with a snowflake, a "Backup camera" row with a
 * camera, and forty other one-off mappings is a lot of code to maintain and a
 * lot of ways to be wrong about what a feature is. The check says "included",
 * which is the only claim being made.
 */
export default function VehicleFeatures({ features = [], className }) {
  if (features.length === 0) return null

  return (
    <ul
      className={cn(
        'grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
          <Check
            className="mt-0.5 size-4 shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          {feature}
        </li>
      ))}
    </ul>
  )
}
