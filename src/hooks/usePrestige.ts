import { useState, useCallback } from 'react';
import type { PrestigeState } from '../types/game';
import type { Resources } from '../types/game';

const STORAGE_KEY = 'idle-builder-prestige';

const BASE_STARTING_RESOURCES: Resources = {
  gold: 100,
  wood: 50,
  stone: 25,
  ore: 0,
  food: 20,
};

/**
 * Maximum number of times a player can prestige.
 * Prestige level 10 is the final tier (requires castle level 20).
 */
export const MAX_PRESTIGES = 10;

/**
 * Returns the Stone Castle level required to perform the nth prestige.
 *
 * | Next prestige # | Required castle level |
 * |---|---|
 * | 1 – 3  | 10 |
 * | 4 – 6  | 12 |
 * | 7 – 9  | 15 |
 * | 10 (max) | 20 |
 *
 * TODO: The body below is changed to return 5 for ALL tiers for testing purposes only.
 *       Revert to the commented-out tiered logic when testing is complete.
 */
export function computeRequiredCastleLevel(_nextPrestigeNumber: number): number {
  // TODO: testing only – remove this line and restore the tiered logic below
  return 5;

  // Original tiered thresholds (restore when done testing):
  // if (nextPrestigeNumber <= 3) return 10;
  // if (nextPrestigeNumber <= 6) return 12;
  // if (nextPrestigeNumber <= 9) return 15;
  // return 20;
}

/**
 * Example 1 — Production Multiplier
 * Each prestige adds +50% to the global production multiplier.
 *   timesPrestiged=0 → ×1.0 (no bonus)
 *   timesPrestiged=1 → ×1.5
 *   timesPrestiged=2 → ×2.0
 */
export function computeGlobalMultiplier(timesPrestiged: number): number {
  return 1.0 + timesPrestiged * 0.5;
}

/**
 * Example 2 — Starting Resources Bonus
 * Each prestige increases the starting resource pack by +25 %.
 *   timesPrestiged=0 → base amounts (×1.00)
 *   timesPrestiged=1 → ×1.25 starting resources
 *   timesPrestiged=2 → ×1.50 starting resources
 */
export function computeStartingResources(timesPrestiged: number): Resources {
  const factor = 1 + timesPrestiged * 0.25;
  return {
    gold: Math.floor(BASE_STARTING_RESOURCES.gold * factor),
    wood: Math.floor(BASE_STARTING_RESOURCES.wood * factor),
    stone: Math.floor(BASE_STARTING_RESOURCES.stone * factor),
    ore: Math.floor(BASE_STARTING_RESOURCES.ore * factor),
    food: Math.floor(BASE_STARTING_RESOURCES.food * factor),
  };
}

/**
 * Example 3 — Building Cost Discount
 * Each prestige reduces all building costs by 10 %, capped at 50 %.
 *   timesPrestiged=0 → 0 % discount
 *   timesPrestiged=1 → 10 % discount
 *   timesPrestiged=5 → 50 % discount (cap)
 */
export function computeCostDiscount(timesPrestiged: number): number {
  return Math.min(timesPrestiged * 0.1, 0.5);
}

/**
 * Example 4 — Build Speed Discount
 * Each prestige reduces all construction durations by 1 %, capped at 10 %
 * (matching the MAX_PRESTIGES limit of 10).
 *   timesPrestiged=0  → 0 % faster
 *   timesPrestiged=1  → 1 % faster
 *   timesPrestiged=10 → 10 % faster (cap)
 */
export function computeBuildSpeedDiscount(timesPrestiged: number): number {
  return Math.min(timesPrestiged * 0.01, 0.1);
}

function loadPrestigeState(): PrestigeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timesPrestiged: 0, globalMultiplier: 1 };
    return JSON.parse(raw) as PrestigeState;
  } catch {
    return { timesPrestiged: 0, globalMultiplier: 1 };
  }
}

function savePrestigeState(state: PrestigeState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export interface UsePrestigeReturn {
  /** Times the player has prestiged. */
  timesPrestiged: number;
  /** Example 1 — multiplies all resource production. */
  globalMultiplier: number;
  /** Example 2 — starting resources for the next run. */
  startingResources: Resources;
  /** Example 3 — fractional discount applied to all building costs (0–0.5). */
  costDiscount: number;
  /** Example 4 — fractional reduction applied to all construction durations (0–0.1). */
  buildSpeedDiscount: number;
  /**
   * Whether the prestige action is currently available.
   * Requires the Stone Castle to be at `requiredCastleLevel` AND that
   * `timesPrestiged < MAX_PRESTIGES`.
   */
  canPrestige: boolean;
  /**
   * Required Stone Castle level for the next prestige.
   * Derived from `timesPrestiged` via `computeRequiredCastleLevel`.
   */
  requiredCastleLevel: number;
  /**
   * Set this to the Stone Castle's current timer level so the hook can
   * compute `canPrestige`.
   */
  setCastleLevel: (level: number) => void;
  /**
   * Trigger prestige: increment the counter, update all bonuses, clear the
   * grid, and reset resources to the post-prestige starting pack.
   */
  prestige: (clearGrid: () => void, resetResources: (starting: Resources) => void) => void;
}

export function usePrestige(): UsePrestigeReturn {
  const [prestigeState, setPrestigeState] = useState<PrestigeState>(loadPrestigeState);
  const [castleLevel, setCastleLevel] = useState(0);

  const nextPrestigeNumber = prestigeState.timesPrestiged + 1;
  const requiredCastleLevel = computeRequiredCastleLevel(nextPrestigeNumber);
  const canPrestige =
    prestigeState.timesPrestiged < MAX_PRESTIGES && castleLevel >= requiredCastleLevel;

  const prestige = useCallback(
    (clearGrid: () => void, resetResources: (starting: Resources) => void) => {
      setPrestigeState(prev => {
        const next: PrestigeState = {
          timesPrestiged: prev.timesPrestiged + 1,
          globalMultiplier: computeGlobalMultiplier(prev.timesPrestiged + 1),
        };
        savePrestigeState(next);

        // Reset the grid and resources as part of the same synchronous call so
        // the state updates are batched.
        clearGrid();
        resetResources(computeStartingResources(next.timesPrestiged));

        return next;
      });
    },
    []
  );

  return {
    timesPrestiged: prestigeState.timesPrestiged,
    globalMultiplier: prestigeState.globalMultiplier,
    startingResources: computeStartingResources(prestigeState.timesPrestiged),
    costDiscount: computeCostDiscount(prestigeState.timesPrestiged),
    buildSpeedDiscount: computeBuildSpeedDiscount(prestigeState.timesPrestiged),
    canPrestige,
    requiredCastleLevel,
    setCastleLevel,
    prestige,
  };
}
