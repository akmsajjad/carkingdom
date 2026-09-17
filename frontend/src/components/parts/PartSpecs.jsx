import { BadgeCheck, Package, ShieldCheck, Tag } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * The at-a-glance row for a part, shared by the grid card and the list row.
 *
 * Pulls the three facts a counter customer checks before anything else — brand,
 * warranty and whether it is on the shelf — from fields the part already has,
 * rather than from a hand-written summary. A part with no warranty simply has
 * one fewer item, so nothing here can say something the data does not.
 *
 * Icons carry a visually hidden label, for the same reason `VehicleSpecs` does:
 * an icon-only row reads as loose values with nothing saying what they describe.
 */
export default function PartSpecs({ part, className }) {
  const items = [
    { key: 'brand', icon: BadgeCheck, label: 'Brand', value: part.brand },
    { key: 'sku', icon: Tag, label: 'Part number', value: part.sku },
    part.warranty && {
      key: 'warranty',
      icon: ShieldCheck,
      label: 'Warranty',
      value: part.warranty,
    },
    {
      key: 'stock',
      icon: Package,
      label: 'Availability',
      value: part.inStock
        ? part.stock <= 4
          ? `Only ${part.stock} in stock`
          : 'In stock'
        : 'Out of stock',
    },
  ].filter(Boolean)

  return (
    <ul className={cn('grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2', className)}>
      {items.map(({ key, icon: Icon, label, value }) => (
        <li key={key} className="flex items-center gap-2 text-sm text-slate-600">
          <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="sr-only">{label}:</span>
          <span className="min-w-0 truncate">{value}</span>
        </li>
      ))}
    </ul>
  )
}
