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
 * - **Major Boost** (-15 min): high cost, aimed at late/end-game where timers
 *   climb into the hour range.
 * - **Hour Boost** (-1 hr): very high cost, aimed at end-game where timers reach
 *   the hour-plus range.
 * - **Five Hour Boost** (-5 hr): highest cost, aimed at deep end-game where timers
 *   climb into the multi-hour range.
 * - **Day Boost** (-24 hr): extreme cost, aimed at the very late-game where timers
 *   reach 24+ hours.
 * - **Week Boost** (-1 week / 168 hr): legendary cost, aimed at the deepest end-game where
 *   timers climb beyond 100 hours.
 * - **Twelve-Week Boost** (-12 weeks / 2016 hr): ultimate cost, aimed at the absolute end-game where
 *   timers climb into the multi-week range.
 * - **Year Boost** (-1 year / 8760 hr, assuming 365-day year): supreme cost, aimed at the true end-game where
 *   timers climb into the year range.
 * - **Six-Year Boost** (-6 years / 52560 hr): ultimate cost, aimed at the absolute pinnacle of the end-game where
 *   timers climb beyond the single-year mark.
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
    id: 'boost_15min',
    label: '-15 min',
    reductionMs: 900_000,
    cost: { gold: 750, wood: 375, stone: 200, ore: 25, food: 0 },
  },
  {
    id: 'boost_1hr',
    label: '-1 hr',
    reductionMs: 3_600_000,
    cost: { gold: 2000, wood: 1000, stone: 500, ore: 100, food: 0 },
  },
  {
    id: 'boost_5hr',
    label: '-5 hr',
    reductionMs: 18_000_000,
    cost: { gold: 10_000, wood: 5_000, stone: 2_500, ore: 500, food: 0 },
  },
  {
    id: 'boost_24hr',
    label: '-24 hr',
    reductionMs: 86_400_000,
    cost: { gold: 50_000, wood: 25_000, stone: 12_500, ore: 2_500, food: 0 },
  },
  {
    id: 'boost_1week',
    label: '-1 week',
    reductionMs: 604_800_000,
    cost: { gold: 350_000, wood: 175_000, stone: 87_500, ore: 17_500, food: 0 },
  },
  {
    id: 'boost_12week',
    label: '-12 weeks',
    reductionMs: 7_257_600_000,
    cost: { gold: 2_000_000, wood: 1_000_000, stone: 500_000, ore: 100_000, food: 0 },
  },
  {
    id: 'boost_1yr',
    label: '-1 year',
    reductionMs: 31_536_000_000,
    cost: { gold: 10_000_000, wood: 5_000_000, stone: 2_500_000, ore: 500_000, food: 0 },
  },
  {
    id: 'boost_6yr',
    label: '-6 years',
    reductionMs: 189_216_000_000,
    cost: { gold: 60_000_000, wood: 30_000_000, stone: 15_000_000, ore: 3_000_000, food: 0 },
  },
];
