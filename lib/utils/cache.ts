export interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate: number;
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 30 * 60 * 1000 // 30 minutes
};

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheStatus {
  isStale: boolean;
  isUpdating: boolean;
}

export function getCacheStatus(timestamp: number, config: CacheConfig = DEFAULT_CACHE_CONFIG): CacheStatus {
  const now = Date.now();
  const age = now - timestamp;

  return {
    isStale: age > config.maxAge,
    isUpdating: age > config.maxAge && age <= config.staleWhileRevalidate
  };
}

export function shouldRevalidate(timestamp: number, config: CacheConfig = DEFAULT_CACHE_CONFIG): boolean {
  const now = Date.now();
  const age = now - timestamp;
  return age > config.maxAge && age <= config.staleWhileRevalidate;
}

export function isValidCache<T>(entry: CacheEntry<T> | null, config: CacheConfig = DEFAULT_CACHE_CONFIG): boolean {
  if (!entry) return false;
  
  const now = Date.now();
  const age = now - entry.timestamp;
  return age <= config.staleWhileRevalidate;
}
