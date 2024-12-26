import BuildResults from '@/components/build-results'
import BuildFilters from '@/components/build-filters'
import PageHero from '@/components/page-hero'

export default function Builds() {
  return (
    <div>
      <PageHero 
        title="Albion Online Builds"
        subtitle="Discover and explore individual builds for every playstyle"
        stats={[
          { value: '500+', label: 'Active Builds' },
          { value: '10K+', label: 'Players Using' }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
          <BuildFilters />
        </div>
      </PageHero>
      <div className="container mx-auto px-4">
        <BuildResults />
      </div>
    </div>
  )
}
