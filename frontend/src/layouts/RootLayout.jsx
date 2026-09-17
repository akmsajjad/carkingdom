import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { LoadingBlock } from '../components/common/Spinner'

/**
 * The application shell.
 *
 * Suspense sits *inside* the layout, around the outlet, rather than around the
 * whole route tree. A lazy page chunk then swaps in beneath a navbar and
 * footer that stay put, instead of the entire page blanking on first visit to
 * each route.
 */
export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <Suspense fallback={<LoadingBlock className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
