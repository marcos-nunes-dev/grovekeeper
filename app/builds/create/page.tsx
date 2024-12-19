import BuildCreator from '@/components/build-creator'

export default function CreateBuild() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Build</h1>
      <BuildCreator showDismissible={false} /> {/* Disable dismissible option for individual build creation */}
    </div>
  )
}

