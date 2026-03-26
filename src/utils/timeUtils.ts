/**
 * Converts milliseconds to a human-readable time string.
 * Small values use standard units: "45s", "1m 30s", "2h 5m".
 * Large durations escalate to days ("2d 3h"), weeks ("3w 2d"), and years ("1y 2w").
 */
export function formatTime(ms: number): string {
  if (ms <= 0) return '0s';

  const HOURS_PER_DAY = 24;
  const HOURS_PER_WEEK = 168;
  const HOURS_PER_YEAR = 8_760; // 365-day year

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours >= HOURS_PER_YEAR) {
    const years = Math.floor(hours / HOURS_PER_YEAR);
    const weeks = Math.floor((hours % HOURS_PER_YEAR) / (HOURS_PER_WEEK));
    if (weeks > 0) return `${years}y ${weeks}w`;
    return `${years}y`;
  }
  if (hours >= HOURS_PER_WEEK) {
    const weeks = Math.floor(hours / HOURS_PER_WEEK);
    const days = Math.floor((hours % HOURS_PER_WEEK) / HOURS_PER_DAY);
    if (days > 0) return `${weeks}w ${days}d`;
    return `${weeks}w`;
  }
  if (hours >= HOURS_PER_DAY) {
    const days = Math.floor(hours / HOURS_PER_DAY);
    const remainingHours = hours % HOURS_PER_DAY;
    if (remainingHours > 0) return `${days}d ${remainingHours}h`;
    return `${days}d`;
  }
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
