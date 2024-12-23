import { MurderLedgerEvent, PlayerData, CacheStatus } from './albion';

export interface PlayerProfileProps {
  playerData: PlayerData;
  events: MurderLedgerEvent[];
  isCheckingNewEvents: boolean;
  region: string;
  shareUrl: string;
  cacheStatus: CacheStatus;
}

export interface PlayerInfoProps {
  playerData: PlayerData;
  cacheStatus: CacheStatus;
  onShare: () => void;
  copied: boolean;
}

export interface PlayerStatsProps {
  playerData: PlayerData;
}

export interface RecentActivitiesProps {
  events: MurderLedgerEvent[];
  isCheckingNewEvents: boolean;
  isLoadingInitial: boolean;
  playerName: string;
}

export interface GuildHistoryProps {
  playerName: string;
  region: string;
  currentGuild: string;
}

export interface EventSkeletonProps {
  count?: number;
}
