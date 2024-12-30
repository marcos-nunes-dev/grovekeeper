import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CustomListToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function CustomListToggle({ checked, onCheckedChange }: CustomListToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
        <div className="flex flex-col">
          <Label className="text-sm text-zinc-400">
            Use custom member list
          </Label>
          <small className="text-xs text-zinc-400">
            Good option when Guild members API is down
          </small>
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-zinc-400" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              The list of player names can be found in the copy and paste
              function at the guild management option inside the game.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 