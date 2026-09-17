import { cn } from '../../utils/cn'

/**
 * Consistent heading block used at the top of every major section, so the
 * vertical rhythm and type scale stay identical site-wide.
 *
 * `tone="dark"` is for the sections that sit on the navy band — the accent and
 * body colours have to change with the background, and passing those as
 * `className` overrides would fight the base utilities.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  as: Tag = 'h2',
  className,
}) {
  const centered = align === 'center'
  const inverted = tone === 'dark'

  return (
    <div className={cn(centered && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow && (
        <p
          className={cn(
            'text-sm font-semibold tracking-wider uppercase',
            inverted ? 'text-accent-400' : 'text-accent-600',
          )}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        className={cn(
          'text-3xl font-bold tracking-tight sm:text-4xl',
          inverted && 'text-white',
          eyebrow && 'mt-2',
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed',
            inverted ? 'text-brand-100' : 'text-slate-600',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
