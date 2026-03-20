import type { Resources } from '../types/game';

export interface BuildingConfig {
  id: string;
  name: string;
  duration: number;
  maxCount: number;
  icon: string;
  enhancedIcon: string;
  ultraIcon: string;
  cost: Resources;
  upgradeCostMultiplier: number;
  production: Resources;
  productionMultiplier: number;
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
    cost: { gold: 0, wood: 10, stone: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 1, wood: 0, stone: 0 },
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
    cost: { gold: 5, wood: 15, stone: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 0, wood: 2, stone: 0 },
    productionMultiplier: 1.5,
  },
  {
    id: 'stone_castle',
    name: 'Stone Castle',
    duration: 12000,
    maxCount: 2,
    icon: '🏰',
    enhancedIcon: '🏯',
    ultraIcon: '⛩️',
    cost: { gold: 50, wood: 30, stone: 40 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 5, wood: 0, stone: 3 },
    productionMultiplier: 1.5,
  },
  {
    id: 'windmill',
    name: 'Windmill',
    duration: 4500,
    maxCount: 4,
    icon: '🌀',
    enhancedIcon: '💨',
    ultraIcon: '🌪️',
    cost: { gold: 10, wood: 20, stone: 5 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 2, wood: 1, stone: 0 },
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
    cost: { gold: 20, wood: 25, stone: 15 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 3, wood: 0, stone: 2 },
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
    cost: { gold: 5, wood: 20, stone: 0 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 1, wood: 1, stone: 0 },
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
    cost: { gold: 25, wood: 10, stone: 20 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 2, wood: 0, stone: 3 },
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
    cost: { gold: 30, wood: 20, stone: 10 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 5, wood: 1, stone: 1 },
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
    cost: { gold: 15, wood: 15, stone: 10 },
    upgradeCostMultiplier: 1.8,
    production: { gold: 1, wood: 0, stone: 4 },
    productionMultiplier: 1.5,
  },
];
