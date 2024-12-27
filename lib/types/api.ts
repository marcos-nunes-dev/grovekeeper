import type { PlayerData } from '@/types/albion'

interface SuccessResponse {
  data: PlayerData;
  cacheStatus: {
    isStale: boolean;
    isUpdating: boolean;
  };
  isCheckingNewEvents?: boolean;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export type ApiResponse = SuccessResponse | ErrorResponse;

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return typeof response === 'object' && response !== null && 'error' in response;
} 