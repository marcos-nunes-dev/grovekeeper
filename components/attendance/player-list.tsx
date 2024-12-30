import { Textarea } from "@/components/ui/textarea";
import { type ChangeEvent } from "react";

interface PlayerListProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlayerList({ value, onChange }: PlayerListProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Enter player names (one per line)"
        className="min-h-[100px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
      />
      <div className="h-px bg-zinc-800" />
    </div>
  );
} 