import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const VARIANTS = {
  primary:
    'bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950 shadow-sm',
  accent:
    'bg-accent-500 text-brand-950 hover:bg-accent-400 active:bg-accent-600 shadow-sm font-semibold',
  outline:
    'border border-slate-300 bg-white text-brand-900 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-brand-900 hover:bg-slate-100 active:bg-slate-200',
  white: 'bg-white text-brand-900 hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
}

/**
 * The single button in the application. Renders as a react-router <Link> when
 * given `to`, an <a> when given `href`, and a <button> otherwise — so a CTA
 * keeps identical styling whether it navigates, links out, or submits.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  ...props
}) {
  const isDisabled = disabled || loading

  const classes = cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
    VARIANTS[variant],
    SIZES[size],
    isDisabled && 'pointer-events-none opacity-60',
    className,
  )

  const content = (
    <>
      {loading ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight className="size-4 shrink-0" aria-hidden="true" />
      )}
    </>
  )

  // A disabled link should not navigate, so fall back to a real button.
  if (to && !isDisabled) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href && !isDisabled) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  )
}
