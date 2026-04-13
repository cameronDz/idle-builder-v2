import type { BuildingConfig } from '../config/buildings';
import type { Resources } from '../types/game';

/** Ordered list of resource keys, used for consistent display order. */
export const RESOURCE_KEYS: Array<keyof Resources> = ['gold', 'wood', 'stone', 'ore'];


export function getUpgradeCost(config: BuildingConfig, currentLevel: number): Resources {
  if (currentLevel === 0) {
    return { gold: 0, wood: 0, stone: 0, ore: 0 };
  }
  const base = config.upgradeCostBase ?? config.cost;
  const multiplier = Math.pow(config.upgradeCostMultiplier, currentLevel);
  return {
    gold: Math.ceil(base.gold * multiplier),
    wood: Math.ceil(base.wood * multiplier),
    stone: Math.ceil(base.stone * multiplier),
    ore: Math.ceil(base.ore * multiplier),
  };
}

export function hasAnyCost(cost: Resources): boolean {
  return cost.gold > 0 || cost.wood > 0 || cost.stone > 0 || cost.ore > 0;
}

/**
 * Applies a fractional prestige discount (0–1) to a resource cost, rounding
 * each value down to the nearest integer.
 *
 * Example 3 — Building Cost Discount: each prestige reduces costs by 10 %,
 * capped at 50 %. Pass `computeCostDiscount(timesPrestiged)` as `discount`.
 */
export function applyDiscount(cost: Resources, discount: number): Resources {
  const factor = 1 - Math.max(0, Math.min(1, discount));
  return {
    gold: Math.floor(cost.gold * factor),
    wood: Math.floor(cost.wood * factor),
    stone: Math.floor(cost.stone * factor),
    ore: Math.floor(cost.ore * factor),
  };
}

/**
 * Formats a number with a unit suffix for compact display.
 * Values below 1000 are shown as integers; larger values use k/m/b/t suffixes
 * with one decimal place (e.g. 123.4k, 1.2m, 4.5b, 6.7t).
 */
export function formatNumber(value: number): string {
  if (value < 1_000) return String(Math.floor(value));
  if (value < 1_000_000) return `${(value / 1_000).toFixed(1)}k`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value < 1_000_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}b`;
  return `${(value / 1_000_000_000_000).toFixed(1)}t`;
}

export function formatCost(cost: Resources): string {
  const parts: string[] = [];
  if (cost.gold > 0) parts.push(`gold: ${formatNumber(cost.gold)}`);
  if (cost.wood > 0) parts.push(`wood: ${formatNumber(cost.wood)}`);
  if (cost.stone > 0) parts.push(`stone: ${formatNumber(cost.stone)}`);
  if (cost.ore > 0) parts.push(`ore: ${formatNumber(cost.ore)}`);
  return parts.join(', ');
}
