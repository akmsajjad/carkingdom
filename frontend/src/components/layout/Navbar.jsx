import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ArrowLeftRight,
  CalendarCheck,
  Car,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShoppingCart,
} from 'lucide-react'
import Button from '../common/Button'
import Logo from '../common/Logo'
import IconLink from './IconLink'
import MobileNav from './MobileNav'
import { cn } from '../../utils/cn'
import { NAV_LINKS } from '../../data/navigation'
import { FULL_ADDRESS, MAILTO_HREF, SITE, TEL_HREF } from '../../data/site'
import { useFavorites } from '../../context/FavoritesContext'
import { useCompare } from '../../context/CompareContext'
import { useCart } from '../../context/CartContext'

/**
 * The site header.
 *
 * Two rows: a utility strip with contact details, and the main bar. The whole
 * header is sticky, but the utility strip collapses to zero height once the
 * page is scrolled so the bar that stays on screen is only the 72px one. That
 * keeps the phone number reachable at the top of every page without paying for
 * its height while reading.
 *
 * ## Why the header is dark
 *
 * The logo artwork is drawn in near-white — its wordmark and hexagon are around
 * #fcfcfc — so on the white bar this used to be, the wordmark and the hexagon
 * were invisible and only the red car showed. The mark needs a dark ground, so
 * the bar is graphite and the artwork, the nav links and the icons are all
 * light on it. The footer is dark for the same reason.
 *
 * The two rows stay distinguishable by a step in the graphite ramp rather than
 * a border: the strip is brand-950 and the bar brand-900, so the bar reads as
 * the nearer surface. A divider line between two near-black bands would have to
 * be either invisible or brighter than both.
 *
 * The bar keeps its 72px height (`h-header`) exactly. That is deliberate: a
 * dozen components position themselves against it with `top-24` and
 * `scroll-mt-*`, and every one of those would be wrong the moment it grew.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { count: favoritesCount } = useFavorites()
  const { count: compareCount } = useCompare()
  const { itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          'hidden overflow-hidden bg-brand-950 text-white transition-all duration-300 lg:block',
          scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100',
        )}
      >
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="size-3.5 text-accent-400" aria-hidden="true" />
              {FULL_ADDRESS}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={TEL_HREF}
              className="flex items-center gap-1.5 text-slate-300 transition-colors hover:text-white"
            >
              <Phone className="size-3.5 text-accent-400" aria-hidden="true" />
              {SITE.phoneDisplay}
            </a>
            <a
              href={MAILTO_HREF}
              className="flex items-center gap-1.5 text-slate-300 transition-colors hover:text-white"
            >
              <Mail className="size-3.5 text-accent-400" aria-hidden="true" />
              {SITE.email}
            </a>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'border-b border-white/10 bg-brand-900 transition-shadow',
          scrolled && 'shadow-header',
        )}
      >
        <div className="container-page flex h-header items-center gap-4">
          <Logo />

          <nav aria-label="Main" className="ml-2 hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        // `whitespace-nowrap` stays even though the row has
                        // room again: it is what turns a future squeeze into a
                        // caught overflow rather than a silently wrapped label.
                        'rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors',
                        isActive
                          ? 'bg-white/10 font-semibold text-white'
                          : 'font-medium text-slate-300 hover:bg-white/10 hover:text-white',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            {/* Each responsive group is wrapped rather than given `hidden …` on
                the button itself. Button and IconLink already set a display
                utility, and two display utilities on one element resolve by
                stylesheet order — not by the order they appear in `class` — so
                `hidden lg:inline-flex` on a Button silently loses to its own
                `inline-flex` and renders at every width. A wrapper makes the
                visibility decision unambiguous. */}
            <div className="hidden items-center gap-0.5 sm:flex">
              <IconLink
                to="/favorites"
                icon={Heart}
                label="Favorites"
                count={favoritesCount}
              />
              <IconLink
                to="/compare"
                icon={ArrowLeftRight}
                label="Compare"
                count={compareCount}
              />
            </div>

            <IconLink
              to="/cart"
              icon={ShoppingCart}
              label="Cart"
              count={itemCount}
            />

            {/* The rule divides the icon cluster from the button cluster, so it
                appears with the buttons rather than at `lg`. Showing it a
                breakpoint early would leave a divider floating in front of
                nothing. */}
            <span
              aria-hidden="true"
              className="mx-2 hidden h-6 w-px bg-white/15 xl:block"
            />

            {/* The buttons start at `xl`, not `lg`.
                At 1024px the row has to hold the logo, seven nav links, three
                icon links and a button, and it does not: measured, that is
                roughly 1000px of content in the 960px a 1024px viewport leaves
                after the page gutters, so the header overflowed from `lg` until
                there was room for it around 1150px.
                Nothing is lost by waiting. "Browse Cars" is the same
                destination as the "Used Cars" nav link sitting a few
                centimetres to its left, so between 1024 and 1280 the header
                still carries a complete, unambiguous route into the inventory
                — and it does so without the row visibly straining. */}
            {/* `white`, not `primary`. The primary variant is `bg-brand-900`,
                which is now the bar's own colour — the button would be a
                graphite rectangle on graphite, with only its label visible.
                A white fill keeps the pair's hierarchy: one solid button and
                one red one, exactly as before. */}
            <div className="hidden xl:block">
              <Button to="/used-cars" variant="white" size="sm" icon={Car}>
                Browse Cars
              </Button>
            </div>

            <div className="hidden pl-2 xl:block">
              <Button
                to="/appointments"
                variant="accent"
                size="sm"
                icon={CalendarCheck}
              >
                Book Appointment
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-controls="mobile-nav"
              aria-expanded={menuOpen}
              className="-mr-2 ml-1 inline-flex size-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
