import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import MobileCta from '../components/layout/MobileCta'
import { LoadingBlock } from '../components/common/Spinner'
import { cn } from '../utils/cn'
import useRouteFocus from '../hooks/useRouteFocus'
import { useMobileCta } from '../context/MobileCtaContext'

/**
 * The application shell.
 *
 * Suspense sits *inside* the layout, around the outlet, rather than around the
 * whole route tree. A lazy page chunk then swaps in beneath a navbar and
 * footer that stay put, instead of the entire page blanking on first visit to
 * each route.
 *
 * The bottom padding is reserved only while the mobile bar is actually
 * showing. The bar is `fixed`, so it is out of flow and would otherwise sit on
 * top of the footer's last row with no way to scroll clear of it; a page that
 * supplies its own bar supersedes this one, and the padding goes with it.
 */
export default function RootLayout() {
  const { superseded } = useMobileCta()

  // Called here rather than in the router because this is the component that
  // owns the `<main>` it moves focus to.
  useRouteFocus()

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-white',
        !superseded && 'pb-mobile-cta lg:pb-0',
      )}
    >
      {/* Accent, not brand-900. The skip link appears over the top-left of the
          page, which is the header bar — and the bar is brand-900 now, so a
          brand-900 link would have been a graphite pill on graphite at the one
          moment it is meant to be the most visible thing on screen. */}
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <Navbar />

      {/* `tabIndex={-1}` makes this a valid focus target for `useRouteFocus`
          without adding it to the tab order — Tab still starts at the navbar.
          The ring is suppressed because it is only ever focused
          programmatically, right after the content inside it has been
          replaced: a rectangle drawn around the whole page at that moment
          reads as a rendering fault, and it tells the user nothing that the
          new content has not already told them. No interactive control's focus
          indicator is affected by this — those all keep the global ring from
          `index.css`. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        <Suspense fallback={<LoadingBlock className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />

      {!superseded && <MobileCta />}
    </div>
  )
}
