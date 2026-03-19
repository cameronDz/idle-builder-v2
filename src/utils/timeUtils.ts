/**
 * Converts milliseconds to a human-readable time string.
 * Examples: 45000 → "45s", 90000 → "1m 30s", 7500000 → "2h 5m"
 */
export function formatTime(ms: number): string {
  if (ms <= 0) return '0s';

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes > 0) return `${hours}h ${minutes}m`;
    return `${hours}h`;
  }
  if (minutes > 0) {
    if (seconds > 0) return `${minutes}m ${seconds}s`;
    return `${minutes}m`;
  }
  return `${seconds}s`;
}
