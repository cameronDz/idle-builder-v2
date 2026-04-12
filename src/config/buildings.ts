import type { Resources } from '../types/game';

export interface BuildingConfig {
  id: string;
  name: string;
  duration: number;
  maxCount: number;
  icon: string;
  enhancedIcon: string;
  ultraIcon: string;
  /** Resources spent when the building is first placed on the grid. */
  cost: Resources;
  /**
   * Base cost used for upgrade calculations. When set, upgrade costs scale
   * from this value instead of `cost`. Use when the placement cost differs
   * from the intended upgrade base (e.g. a foundation building placed for free
   * but with expensive upgrades).
   */
  upgradeCostBase?: Resources;
  upgradeCostMultiplier: number;
  production: Resources;
  productionMultiplier: number;
  /**
   * When true this building must be placed before any other building can be
   * placed on the grid. Only one foundation building is supported.
   */
  isFoundation?: boolean;
  /**
   * When true, starting an upgrade requires at least one other (non-self)
   * building instance on the grid whose level is >= this building's current
   * level. Enforces that the player has levelled up other buildings first.
   */
  upgradeRequiresMatchingLevel?: boolean;
}

export const buildings: BuildingConfig[] = [
  {
    id: 'wooden_house',
    name: 'Wooden House',
    duration: 3000,
    maxCount: 8,
    icon: '🏠',
    enhancedIcon: '🏡',
    ultraIcon: '🏘️',
    cost: { gold: 0, wood: 10, stone: 0, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 2, wood: 0, stone: 0, ore: 0, food: 0 },
    productionMultiplier: 1.5,
  },
  {
    id: 'farm',
    name: 'Farm',
    duration: 6000,
    maxCount: 6,
    icon: '🌾',
    enhancedIcon: '🌻',
    ultraIcon: '🏕️',
    cost: { gold: 5, wood: 15, stone: 0, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 0, stone: 0, ore: 0, food: 5 },
    productionMultiplier: 1.5,
  },
  {
    id: 'stone_castle',
    name: 'Stone Castle',
    duration: 12000,
    maxCount: 1,
    icon: '🏰',
    enhancedIcon: '🏯',
    ultraIcon: '⛩️',
    // Free to place — it is the mandatory first building.
    cost: { gold: 0, wood: 0, stone: 0, ore: 0, food: 0 },
    // Upgrade costs scale from this expensive base rather than the zero placement cost.
    upgradeCostBase: { gold: 50, wood: 30, stone: 40, ore: 10, food: 0 },
    // Steeper multiplier than all other buildings (1.8) to make late upgrades very costly.
    upgradeCostMultiplier: 2.2,
    production: { gold: 8, wood: 0, stone: 0, ore: 0, food: 0 },
    productionMultiplier: 1.5,
    isFoundation: true,
    upgradeRequiresMatchingLevel: true,
  },
  {
    id: 'windmill',
    name: 'Windmill',
    duration: 4500,
    maxCount: 4,
    icon: '🌀',
    enhancedIcon: '💨',
    ultraIcon: '🌪️',
    cost: { gold: 10, wood: 20, stone: 5, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 0, stone: 0, ore: 0, food: 2 },
    productionMultiplier: 1.5,
  },
  {
    id: 'watch_tower',
    name: 'Watch Tower',
    duration: 9000,
    maxCount: 3,
    icon: '🗼',
    enhancedIcon: '🏗️',
    ultraIcon: '🛡️',
    cost: { gold: 20, wood: 25, stone: 15, ore: 5, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 3, wood: 0, stone: 0, ore: 0, food: 0 },
    productionMultiplier: 1.5,
  },
  {
    id: 'barn',
    name: 'Barn',
    duration: 4000,
    maxCount: 5,
    icon: '🏚️',
    enhancedIcon: '🏠',
    ultraIcon: '🏡',
    cost: { gold: 5, wood: 20, stone: 0, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 0, stone: 0, ore: 0, food: 4 },
    productionMultiplier: 1.5,
  },
  {
    id: 'forge',
    name: 'Forge',
    duration: 7500,
    maxCount: 3,
    icon: '⚒️',
    enhancedIcon: '🔨',
    ultraIcon: '⚔️',
    cost: { gold: 25, wood: 10, stone: 20, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 0, stone: 0, ore: 3, food: 0 },
    productionMultiplier: 1.5,
  },
  {
    id: 'market',
    name: 'Market',
    duration: 10000,
    maxCount: 2,
    icon: '🏪',
    enhancedIcon: '🏬',
    ultraIcon: '🏦',
    cost: { gold: 30, wood: 20, stone: 10, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 5, wood: 0, stone: 0, ore: 0, food: 0 },
    productionMultiplier: 1.5,
  },
  {
    id: 'ore_mine',
    name: 'Ore Mine',
    duration: 8000,
    maxCount: 3,
    icon: '⛏️',
    enhancedIcon: '🪨',
    ultraIcon: '💎',
    cost: { gold: 15, wood: 15, stone: 10, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 0, stone: 0, ore: 3, food: 0 },
    productionMultiplier: 1.5,
  },
  {
    id: 'lumber_yard',
    name: 'Lumber Yard',
    duration: 5000,
    maxCount: 7,
    icon: '🌲',
    enhancedIcon: '🌳',
    ultraIcon: '🏭',
    cost: { gold: 10, wood: 25, stone: 5, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 3, stone: 0, ore: 0, food: 0 },
    productionMultiplier: 1.5,
  },
  {
    id: 'quarry',
    name: 'Quarry',
    duration: 6000,
    maxCount: 4,
    icon: '🪨',
    enhancedIcon: '⛏️',
    ultraIcon: '🏔️',
    cost: { gold: 10, wood: 5, stone: 0, ore: 0, food: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 0, stone: 3, ore: 0, food: 0 },
    productionMultiplier: 1.5,
  },
];
