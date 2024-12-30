import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { type BattleType } from "@/lib/hooks/use-attendance-calculator";

interface BattleTypeSelectorProps {
  value: BattleType;
  onChange: (value: BattleType) => void;
}

export function BattleTypeSelector({ value, onChange }: BattleTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] border-0 bg-transparent">
        <SelectValue placeholder="Battle Type" />
      </SelectTrigger>
      <SelectContent className="bg-[#161B22] border-zinc-800">
        <SelectItem value="zvz">Only ZvZ</SelectItem>
        <SelectItem value="all">ZvZ and Small</SelectItem>
      </SelectContent>
    </Select>
  );
} 