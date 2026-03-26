/**
 * Converts milliseconds to a human-readable time string.
 * Small values use standard units: "45s", "1m 30s", "2h 5m".
 * Large hour counts are compacted with k/m/b/t suffixes: "1.2kh", "3.4mh".
 */
export function formatTime(ms: number): string {
  if (ms <= 0) return '0s';

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (hours >= 1_000_000_000_000) return `${(hours / 1_000_000_000_000).toFixed(1)}th`;
    if (hours >= 1_000_000_000) return `${(hours / 1_000_000_000).toFixed(1)}bh`;
    if (hours >= 1_000_000) return `${(hours / 1_000_000).toFixed(1)}mh`;
    if (hours >= 1_000) return `${(hours / 1_000).toFixed(1)}kh`;
    if (minutes > 0) return `${hours}h ${minutes}m`;
    return `${hours}h`;
  }
  if (minutes > 0) {
    if (seconds > 0) return `${minutes}m ${seconds}s`;
    return `${minutes}m`;
  }
  return `${seconds}s`;
}
