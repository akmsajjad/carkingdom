import { Share2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useToast } from '../../context/ToastContext'

/**
 * Shares the current page, or copies the link when sharing is unavailable.
 *
 * On a phone this opens the platform share sheet, which is where a "send this
 * car to my partner" action actually belongs. Desktop browsers mostly have no
 * `navigator.share`, so the fallback is the clipboard — and the toast is not
 * decoration there: without it, clicking the button produces no visible change
 * at all and the customer cannot tell whether it worked.
 */
export default function ShareButton({ title, className, label }) {
  const toast = useToast()

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch (error) {
        // Dismissing the share sheet rejects with AbortError. The customer
        // chose to cancel; reporting that as a failure would be wrong.
        if (error?.name !== 'AbortError') {
          toast.error('Could not share this page')
        }
      }
      return
    }

    try {
      // `navigator.clipboard` is undefined outside a secure context, which
      // includes any plain-http deployment of this demo.
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to your clipboard')
    } catch {
      toast.error('Could not copy the link — copy it from the address bar')
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${title}`}
      title="Share"
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-brand-900',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
        className,
      )}
    >
      <Share2 className="size-4" aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
}
