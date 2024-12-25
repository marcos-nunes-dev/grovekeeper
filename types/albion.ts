export interface AlbionSearchResponse {
  players: Array<{
    Id: string;
    Name: string;
  }>;
}

export interface AlbionPlayerResponse {
  Id: string;
  Name: string;
  GuildName: string | null;
  AllianceName: string | null;
  AllianceTag: string | null;
  KillFame: number;
  DeathFame: number;
  LifetimeStatistics: {
    PvE?: {
      Total: number;
    };
    Gathering?: {
      All?: {
        Total: number;
      };
    };
    Crafting?: {
      Total: number;
    };
  };
}

export interface PlayerData {
  id: string;
  name: string;
  guildName: string;
  allianceName: string;
  allianceTag: string;
  avatar: string;
  killFame: number;
  deathFame: number;
  pveTotal: number;
  gatheringTotal: number;
  craftingTotal: number;
  region: string;
}

export interface CacheStatus {
  isStale: boolean;
  isUpdating: boolean;
}

export interface MurderLedgerEvent {
  id: number;
  time: number;
  battle_id: number;
  killer: {
    name: string;
    item_power: number;
    guild_name: string | null;
    alliance_name: string | null;
    loadout: AlbionLoadout;
    vod: string;
    is_primary: boolean;
    kill_fame: number;
    damage_done: number;
    healing_done: number;
    group_members?: Array<{
      name: string;
      damage_done: number;
      healing_done: number;
      kill_fame: number;
    }>;
  };
  victim: {
    name: string;
    item_power: number;
    guild_name: string | null;
    alliance_name: string | null;
    loadout: AlbionLoadout;
    vod: string;
  };
  total_kill_fame: number;
  participant_count: number;
  party_size: number;
  tags: {
    is_1v1: boolean;
    is_2v2: boolean;
    is_5v5: boolean;
    is_zvz: boolean;
    fair: boolean;
    unfair: boolean;
  };
}

export interface AlbionLoadout {
  main_hand?: AlbionItem;
  off_hand?: AlbionItem;
  head?: AlbionItem;
  body?: AlbionItem;
  shoe?: AlbionItem;
  bag?: AlbionItem;
  cape?: AlbionItem;
  mount?: AlbionItem;
  food?: AlbionItem;
  potion?: AlbionItem;
}

export interface AlbionItem {
  id: string;
  type: string;
  tier: number;
  enchant: number;
  quality: number;
  en_name: string;
}

export interface EventsResponse {
  data: MurderLedgerEvent[];
  newEventsCount: number;
  totalEvents: number;
  isCheckingNewEvents: boolean;
}
