import CompositionResults from '@/components/composition-results'
import CompositionFilters from '@/components/composition-filters'

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <CompositionFilters />
      <CompositionResults />
    </div>
  )
}

