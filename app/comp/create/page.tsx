import CompositionBuilder from '@/components/composition-builder'
import PageHero from '@/components/page-hero'

export default function CreateComposition() {
  return (
    <div>
      <PageHero title="Create New Composition">
        {null}
      </PageHero>
      <div className="max-w-7xl mx-auto mb-10">
        <CompositionBuilder />
      </div>
    </div>
  )
}

