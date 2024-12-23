export function formatFame(fame: number | undefined | null): string {
  if (fame === undefined || fame === null) return '0';
  
  if (fame >= 1_000_000_000) {
    return `${(fame / 1_000_000_000).toFixed(1)}B`;
  }
  if (fame >= 1_000_000) {
    return `${(fame / 1_000_000).toFixed(1)}M`;
  }
  if (fame >= 1_000) {
    return `${(fame / 1_000).toFixed(1)}K`;
  }
  return fame.toString();
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
