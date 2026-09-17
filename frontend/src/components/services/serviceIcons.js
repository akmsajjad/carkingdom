import {
  CircleDot,
  ClipboardCheck,
  Disc3,
  Droplets,
  Gauge,
  Snowflake,
  Wrench,
} from 'lucide-react'

/**
 * Resolves the `icon` name stored on a service record to a component.
 *
 * Data files hold names rather than components so they can be swapped for a
 * server response; this map is the single place that translation happens. The
 * `Wrench` fallback means a service added to the data with a new icon name
 * still renders something sensible instead of a hole in the layout.
 */
const SERVICE_ICONS = {
  oil: Droplets,
  brake: Disc3,
  tire: CircleDot,
  diagnostics: Gauge,
  inspection: ClipboardCheck,
  ac: Snowflake,
}

export function serviceIcon(name) {
  return SERVICE_ICONS[name] ?? Wrench
}
