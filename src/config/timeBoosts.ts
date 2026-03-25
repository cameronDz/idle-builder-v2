import type { Resources } from '../types/game';

export interface TimeBoostTier {
  id: string;
  /** Short display label, e.g. "-1 min". */
  label: string;
  /** Amount of time removed from the active timer, in milliseconds. */
  reductionMs: number;
  /** Resources deducted from the player when the boost is applied. */
  cost: Resources;
}

/**
 * Time Reduction Upgrade tiers.
 *
 * Replaces the planned Achievement system (P2 Polish). Instead of passive
 * achievements, players can actively spend resources to shorten any building's
 * active construction timer. Two tiers are offered:
 *
 * - **Quick Boost** (-1 min): cheap, useful at mid-game when timers start
 *   exceeding one minute (roughly building level 4+).
 * - **Rush Boost** (-5 min): more expensive, aimed at late-game where timers
 *   climb into the 10–30 minute range.
 * - **Hour Boost** (-1 hr): high cost, aimed at end-game where timers reach
 *   the hour-plus range.
 *
 * All available tiers are visible in the BuildingDetail modal while a building is under
 * construction. Buttons are disabled when the player cannot afford the cost or
 * when the reduction would have no effect (timer already at 0).
 */
export const TIME_BOOST_TIERS: TimeBoostTier[] = [
  {
    id: 'boost_1min',
    label: '-1 min',
    reductionMs: 60_000,
    cost: { gold: 50, wood: 25, stone: 0, ore: 0, food: 0 },
  },
  {
    id: 'boost_5min',
    label: '-5 min',
    reductionMs: 300_000,
    cost: { gold: 200, wood: 100, stone: 50, ore: 0, food: 0 },
  },
  {
    id: 'boost_1hr',
    label: '-1 hr',
    reductionMs: 3_600_000,
    cost: { gold: 2000, wood: 1000, stone: 500, ore: 100, food: 0 },
  },
];
