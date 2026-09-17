import { cn } from '../../utils/cn'
import { controlClasses, controlHeight } from './formStyles'

/**
 * Text-like input. `ref` passes straight through — React 19 no longer needs
 * forwardRef for this.
 */
export default function Input({ type = 'text', invalid, className, ...props }) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses, controlHeight, className)}
      {...props}
    />
  )
}
