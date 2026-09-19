import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { CompareProvider } from './context/CompareContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { MobileCtaProvider } from './context/MobileCtaContext.jsx'

/**
 * Provider order matters in one direction only: ToastProvider must sit above
 * the other three, because each of them pushes notifications when items are
 * added or removed. Favorites, Compare and Cart are independent of each other,
 * and MobileCtaProvider is independent of all of them — it only tracks whether
 * the mobile bottom bar has been superseded by a page's own.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <FavoritesProvider>
          <CompareProvider>
            <CartProvider>
              <MobileCtaProvider>
                <App />
              </MobileCtaProvider>
            </CartProvider>
          </CompareProvider>
        </FavoritesProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
