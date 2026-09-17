import {
  CircleDot,
  ClipboardCheck,
  Cog,
  Disc3,
  Droplets,
  Gauge,
  Snowflake,
  Sparkles,
  Wrench,
} from 'lucide-react'

/**
 * Renders the icon named on a service record.
 *
 * Data files hold names rather than components so they can be swapped for a
 * server response; this module is the single place that translation happens.
 * The `Wrench` fallback means a service added to the data with a new icon name
 * still renders something sensible instead of a hole in the layout.
 *
 * This is a component rather than a `serviceIcon(name)` lookup function because
 * calling it and storing the result in a capitalised local — the obvious way to
 * write it — reads to both the linter and a human as a component being defined
 * during render. Doing the lookup inside here keeps the call sites plain JSX.
 */
const SERVICE_ICONS = {
  oil: Droplets,
  brake: Disc3,
  tire: CircleDot,
  diagnostics: Gauge,
  inspection: ClipboardCheck,
  ac: Snowflake,
  engine: Cog,
  sparkle: Sparkles,
}

export default function ServiceIcon({ name, className }) {
  const Icon = SERVICE_ICONS[name] ?? Wrench
  return <Icon className={className} aria-hidden="true" />
}
