import BuildCreator from '@/components/build-creator'
import PageHero from '@/components/page-hero'

export default function CreateBuild() {
  return (
    <div>
      <PageHero title="Create New Build" children={null} />
      <div className="max-w-7xl mx-auto mb-10">
        <BuildCreator showDismissible={false} />
      </div>
    </div>
  )
}

