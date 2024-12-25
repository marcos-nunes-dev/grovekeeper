import { MurderLedgerEvent, PlayerData, CacheStatus } from './albion';

export interface PlayerProfileProps {
  playerData: PlayerData;
  events: MurderLedgerEvent[];
  isCheckingNewEvents: boolean;
  shareUrl: string;
  cacheStatus: CacheStatus;
}

export interface PlayerInfoProps {
  playerData: {
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
  };
  cacheStatus?: {
    isStale: boolean;
    isUpdating: boolean;
  };
  onShare: () => void;
  copied: boolean;
  dataPeriod?: {
    start: string | Date;
    end: string | Date;
  };
}

export interface PlayerStatsProps {
  playerData: PlayerData;
}

export interface RecentActivitiesProps {
  events: MurderLedgerEvent[];
  isCheckingNewEvents: boolean;
  playerName: string;
  onLoadMore: () => void;
  isLoadingMore?: boolean;
  hasMoreEvents?: boolean;
}

export interface GuildHistoryProps {
  playerName: string;
}

export interface EventSkeletonProps {
  count?: number;
}

export interface GuildHistoryEntry {
  id: string;
  name: string;
  joinDate: string;
  leaveDate: string;
  duration: string;
}
