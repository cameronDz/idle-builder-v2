import { useState, useEffect, useRef } from 'react';
import type { BuildingInstance, Resources } from '../types/game';
import { buildings } from '../config/buildings';

const LAST_SEEN_KEY = 'idle-builder-last-seen';
const MAX_OFFLINE_MS = 3 * 60 * 60 * 1000; // 3 hours
const MIN_OFFLINE_MS = 60 * 1000; // 1 minute minimum before showing popup
const SAVE_INTERVAL_MS = 60 * 1000; // save last-seen every minute while active

export interface OfflineResult {
  earned: Resources;
  elapsedMs: number;
  isMaxTime: boolean;
}

export interface UseOfflineProgressReturn {
  offlineResult: OfflineResult | null;
  dismissOfflineResult: () => void;
}

function computeProduction(
  buildingInstances: BuildingInstance[],
  globalMultiplier: number
): Resources {
  const total: Resources = { gold: 0, wood: 0, stone: 0, ore: 0 };
  for (const instance of buildingInstances) {
    const level = instance.buildingTimer.level;
    const isComplete = instance.buildingTimer.isComplete;
    // Skip buildings that have not yet been built or are still under construction
    if (level <= 0 && !isComplete) continue;

    const config = buildings.find(b => b.id === instance.buildingTypeId);
    if (!config) continue;

    const effectiveLevel = level > 0 ? level : 1;
    const multiplier = Math.pow(config.productionMultiplier, effectiveLevel - 1) * globalMultiplier;

    total.gold += config.production.gold * multiplier;
    total.wood += config.production.wood * multiplier;
    total.stone += config.production.stone * multiplier;
    total.ore += config.production.ore * multiplier;
  }
  return total;
}

function saveLastSeen(): void {
  try {
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function useOfflineProgress(
  buildingInstances: BuildingInstance[],
  globalMultiplier: number,
  earn: (amount: Resources) => void
): UseOfflineProgressReturn {
  const [offlineResult, setOfflineResult] = useState<OfflineResult | null>(null);

  // Keep a stable ref so the effect callback always reads the latest values
  const earnRef = useRef(earn);
  earnRef.current = earn;
  const instancesRef = useRef(buildingInstances);
  instancesRef.current = buildingInstances;
  const multiplierRef = useRef(globalMultiplier);
  multiplierRef.current = globalMultiplier;

  // Run once on mount: check how long the user was away and award resources
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_SEEN_KEY);
      if (raw !== null) {
        const lastSeen = parseInt(raw, 10);
        if (!isNaN(lastSeen)) {
          const elapsed = Date.now() - lastSeen;
          if (elapsed >= MIN_OFFLINE_MS) {
            const cappedElapsed = Math.min(elapsed, MAX_OFFLINE_MS);
            const offlineSeconds = Math.floor(cappedElapsed / 1000);
            const perSecond = computeProduction(instancesRef.current, multiplierRef.current);
            const earned: Resources = {
              gold: Math.floor(perSecond.gold * offlineSeconds),
              wood: Math.floor(perSecond.wood * offlineSeconds),
              stone: Math.floor(perSecond.stone * offlineSeconds),
              ore: Math.floor(perSecond.ore * offlineSeconds),
            };
            const hasAnyEarned = Object.values(earned).some(v => v > 0);
            if (hasAnyEarned) {
              earnRef.current(earned);
              setOfflineResult({
                earned,
                elapsedMs: cappedElapsed,
                isMaxTime: elapsed >= MAX_OFFLINE_MS,
              });
            }
          }
        }
      }
    } catch {
      // ignore storage errors
    }

    // Record the current time as the new last-seen
    saveLastSeen();
  }, []);

  // Keep last-seen timestamp fresh while the user is active
  useEffect(() => {
    const interval = setInterval(saveLastSeen, SAVE_INTERVAL_MS);

    const handleVisibility = () => {
      saveLastSeen();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleVisibility);
    };
  }, []);

  const dismissOfflineResult = () => setOfflineResult(null);

  return { offlineResult, dismissOfflineResult };
}
