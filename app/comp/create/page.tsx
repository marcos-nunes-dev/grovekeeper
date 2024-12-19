import CompositionBuilder from '@/components/composition-builder'

export default function CreateComposition() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Composition</h1>
      <CompositionBuilder />
    </div>
  )
}

