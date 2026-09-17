import CtaBanner from '../components/home/CtaBanner'
import FeaturedVehicles from '../components/home/FeaturedVehicles'
import Hero from '../components/home/Hero'
import ServiceHighlight from '../components/home/ServiceHighlight'
import Testimonials from '../components/home/Testimonials'
import WhyChooseUs from '../components/home/WhyChooseUs'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getFeaturedVehicles, getInventoryStats } from '../services/vehicles'

export default function Home() {
  useDocumentTitle('Used Cars, Auto Service & Parts in Saskatoon')

  // Fetched once here and handed to both the hero and the grid below, rather
  // than each fetching the featured list for itself.
  const {
    data: featured,
    loading,
    error,
    reload,
  } = useAsync(() => getFeaturedVehicles(6), 'featured')

  const { data: stats } = useAsync(getInventoryStats, 'inventory-stats')

  return (
    <>
      <Hero vehicle={featured?.[0]} stats={stats} />

      <FeaturedVehicles
        vehicles={featured ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
        total={stats?.total}
      />

      <WhyChooseUs />
      <ServiceHighlight />
      <Testimonials />
      <CtaBanner />
    </>
  )
}
