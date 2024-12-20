import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CLASSES } from '@/lib/constants'
import type { ClassSection as ClassSectionType } from '@/lib/types/composition'

interface ClassSectionProps {
  classSection: ClassSectionType
  classIndex: number
  expandedClass: string | null
  setExpandedClass: (className: string | null) => void
  classSections: ClassSectionType[]
  setClassSections: (sections: ClassSectionType[]) => void
  children: React.ReactNode
}

export default function ClassSection({
  classSection,
  classIndex,
  expandedClass,
  setExpandedClass,
  classSections,
  setClassSections,
  children,
}: ClassSectionProps) {
  const toggleClassExpansion = (className: string) => {
    setExpandedClass(expandedClass === className ? null : className)
  }

  return (
    <div className="bg-[#0D1117] border border-zinc-800/50 rounded-lg overflow-hidden shadow-lg transition-all duration-200 hover:border-zinc-700/50">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#161B22] transition-colors"
        onClick={() => toggleClassExpansion(classSection.name)}
      >
        <div className="flex items-center gap-4">
          <Select
            value={classSection.name}
            onValueChange={(value) => {
              const updatedSections = [...classSections]
              updatedSections[classIndex].name = value
              setClassSections(updatedSections)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map((cls) => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-zinc-400 text-sm">
            {classSection.builds.length} builds
          </span>
        </div>
        {expandedClass === classSection.name ? (
          <ChevronUp className="text-zinc-400" size={20} />
        ) : (
          <ChevronDown className="text-zinc-400" size={20} />
        )}
      </div>

      {expandedClass === classSection.name && (
        <div className="p-4 border-t border-zinc-800/50 bg-gradient-to-b from-[#161B22]/50">
          {children}
        </div>
      )}
    </div>
  )
}

