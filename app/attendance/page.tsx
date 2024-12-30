"use client";

import { useState, useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import PageHero from "@/components/page-hero";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { HelpCircle, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AttendanceResult } from "@/components/attendance-result";
import { GuildSearchResult } from "@/types/albion";
import { AttendanceResultType, GuildInfo } from "@/types/attendance";

type BattleType = "zvz" | "all";

export default function Attendance() {
  const [guildName, setGuildName] = useState("");
  const [battleType, setBattleType] = useState<BattleType>("zvz");
  const [useCustomList, setUseCustomList] = useState(false);
  const [playerNames, setPlayerNames] = useState("");
  const [result, setResult] = useState<AttendanceResultType | null>(null);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [guildMembers, setGuildMembers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<GuildSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedGuildName = useDebounce(guildName, 800);
  const [isPending, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCache = useRef<Map<string, GuildSearchResult[]>>(new Map());
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const [error, setError] = useState<string | null>(null);

  // ... rest of the component code ...
}
