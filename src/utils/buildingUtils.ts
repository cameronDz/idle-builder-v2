import type { BuildingConfig } from '../config/buildings';
import type { Resources } from '../types/game';

export function getUpgradeCost(config: BuildingConfig, currentLevel: number): Resources {
  if (currentLevel === 0) {
    return { gold: 0, wood: 0, stone: 0, ore: 0, food: 0 };
  }
  const base = config.upgradeCostBase ?? config.cost;
  const multiplier = Math.pow(config.upgradeCostMultiplier, currentLevel);
  return {
    gold: Math.ceil(base.gold * multiplier),
    wood: Math.ceil(base.wood * multiplier),
    stone: Math.ceil(base.stone * multiplier),
    ore: Math.ceil(base.ore * multiplier),
    food: Math.ceil(base.food * multiplier),
  };
}

export function hasAnyCost(cost: Resources): boolean {
  return cost.gold > 0 || cost.wood > 0 || cost.stone > 0 || cost.ore > 0 || cost.food > 0;
}

export function formatCost(cost: Resources): string {
  const parts: string[] = [];
  if (cost.gold > 0) parts.push(`💰${cost.gold}`);
  if (cost.wood > 0) parts.push(`🌲${cost.wood}`);
  if (cost.stone > 0) parts.push(`🪨${cost.stone}`);
  if (cost.ore > 0) parts.push(`🔩${cost.ore}`);
  if (cost.food > 0) parts.push(`🍖${cost.food}`);
  return parts.join(' ');
}
