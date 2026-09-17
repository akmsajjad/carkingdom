import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  ChevronRight,
  Clock,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
} from 'lucide-react'
import Logo from '../common/Logo'
import Drawer from '../common/Drawer'
import { cn } from '../../utils/cn'
import { NAV_LINKS } from '../../data/navigation'
import { FULL_ADDRESS, MAILTO_HREF, SITE, TEL_HREF } from '../../data/site'
import { useFavorites } from '../../context/FavoritesContext'
import { useCompare } from '../../context/CompareContext'
import { useCart } from '../../context/CartContext'

/** The mobile navigation drawer. */
export default function MobileNav({ open, onClose }) {
  const location = useLocation()
  const { count: favoritesCount } = useFavorites()
  const { count: compareCount } = useCompare()
  const { itemCount } = useCart()

  // Any navigation closes the drawer.
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const shortcuts = [
    { to: '/favorites', icon: Heart, label: 'Favorites', count: favoritesCount },
    { to: '/compare', icon: ArrowLeftRight, label: 'Compare', count: compareCount },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', count: itemCount },
  ]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      label="Main menu"
      side="right"
      title={<Logo onClick={onClose} />}
    >
      <nav className="px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-900'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-brand-900',
                  )
                }
              >
                {link.label}
                <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-slate-200" />

        <ul className="space-y-0.5">
          {shortcuts.map(({ to, icon: Icon, label, count }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-900"
              >
                <Icon className="size-5 text-slate-400" aria-hidden="true" />
                {label}
                {count > 0 && (
                  <span className="ml-auto rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold text-brand-950 tabular-nums">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-slate-200" />

        <div className="space-y-3 px-3 text-sm text-slate-600">
          <a href={TEL_HREF} className="flex items-center gap-3 hover:text-brand-900">
            <Phone className="size-4 shrink-0 text-accent-600" aria-hidden="true" />
            {SITE.phoneDisplay}
          </a>
          <a href={MAILTO_HREF} className="flex items-center gap-3 hover:text-brand-900">
            <Mail className="size-4 shrink-0 text-accent-600" aria-hidden="true" />
            {SITE.email}
          </a>
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
            {FULL_ADDRESS}
          </p>
          <p className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
            {SITE.hours[0].days}: {SITE.hours[0].time}
          </p>
        </div>
      </nav>
    </Drawer>
  )
}
