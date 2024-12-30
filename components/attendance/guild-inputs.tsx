import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";

interface GuildInputsProps {
  guildId: string;
  onGuildIdChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function GuildInputs({
  guildId,
  onGuildIdChange,
}: GuildInputsProps) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <Input
        value={guildId}
        onChange={onGuildIdChange}
        placeholder="Enter guild ID"
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
} 