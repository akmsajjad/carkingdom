import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ScrollToTop from './components/layout/ScrollToTop'

/**
 * Every page is a lazy chunk.
 *
 * The marketplace, services and parts pages each pull in substantial code that
 * a visitor browsing only the homepage never needs, so splitting them keeps
 * the first load to the shell plus one page. `RootLayout` holds the Suspense
 * boundary, which keeps the navbar and footer stable while a chunk arrives.
 */
const Home = lazy(() => import('./pages/Home'))
const UsedCars = lazy(() => import('./pages/UsedCars'))
const VehicleDetails = lazy(() => import('./pages/VehicleDetails'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Compare = lazy(() => import('./pages/Compare'))
const Services = lazy(() => import('./pages/Services'))
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'))
const Parts = lazy(() => import('./pages/Parts'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Cart = lazy(() => import('./pages/Cart'))
const Careers = lazy(() => import('./pages/Careers'))
const JobDetails = lazy(() => import('./pages/JobDetails'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />

          <Route path="used-cars" element={<UsedCars />} />
          <Route path="used-cars/:slug" element={<VehicleDetails />} />

          <Route path="favorites" element={<Favorites />} />
          <Route path="compare" element={<Compare />} />

          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetails />} />

          <Route path="parts" element={<Parts />} />
          <Route path="parts/:slug" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />

          <Route path="careers" element={<Careers />} />
          <Route path="careers/:slug" element={<JobDetails />} />

          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
