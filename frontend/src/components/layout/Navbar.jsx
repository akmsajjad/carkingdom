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
          'border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-shadow',
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
                        'rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-brand-50 font-semibold text-brand-900'
                          : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-900',
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

            <span
              aria-hidden="true"
              className="mx-2 hidden h-6 w-px bg-slate-200 lg:block"
            />

            <div className="hidden lg:block">
              <Button to="/used-cars" variant="primary" size="sm" icon={Car}>
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
              aria-expanded={menuOpen}
              className="-mr-2 ml-1 inline-flex size-10 items-center justify-center rounded-lg text-brand-900 transition-colors hover:bg-slate-100 lg:hidden"
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
