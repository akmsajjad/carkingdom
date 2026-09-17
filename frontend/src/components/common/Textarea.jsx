import { cn } from '../../utils/cn'
import { controlClasses } from './formStyles'

export default function Textarea({ rows = 4, invalid, className, ...props }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses, 'resize-y py-2.5', className)}
      {...props}
    />
  )
}
