import { useState, useEffect, useRef, useCallback } from 'react';
import type { BuildingInstance, Resources } from '../types/game';
import { buildings } from '../config/buildings';

export interface UseProductionTickReturn {
  productionPerSecond: Resources;
}

export function useProductionTick(
  buildingInstances: BuildingInstance[],
  earn: (amount: Resources) => void,
  /** Example 1 — Production Multiplier from prestige (default 1). */
  globalMultiplier: number = 1
): UseProductionTickReturn {
  const [productionPerSecond, setProductionPerSecond] = useState<Resources>({
    gold: 0,
    wood: 0,
    stone: 0,
    ore: 0,
    food: 0,
  });

  const earnRef = useRef(earn);
  earnRef.current = earn;

  const globalMultiplierRef = useRef(globalMultiplier);
  globalMultiplierRef.current = globalMultiplier;

  const instancesRef = useRef(buildingInstances);
  instancesRef.current = buildingInstances;

  const calculateProduction = useCallback((): Resources => {
    const total: Resources = { gold: 0, wood: 0, stone: 0, ore: 0, food: 0 };
    for (const instance of instancesRef.current) {
      const level = instance.buildingTimer.level;
      const isComplete = instance.buildingTimer.isComplete;
      if (level <= 0 && !isComplete) continue;

      const config = buildings.find(b => b.id === instance.buildingTypeId);
      if (!config) continue;

      const effectiveLevel = level > 0 ? level : 1;
      const multiplier = Math.pow(config.productionMultiplier, effectiveLevel - 1) * globalMultiplierRef.current;

      total.gold += config.production.gold * multiplier;
      total.wood += config.production.wood * multiplier;
      total.stone += config.production.stone * multiplier;
      total.ore += config.production.ore * multiplier;
      total.food += config.production.food * multiplier;
    }
    return total;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const production = calculateProduction();
      setProductionPerSecond(production);
      if (production.gold > 0 || production.wood > 0 || production.stone > 0 || production.ore > 0 || production.food > 0) {
        earnRef.current(production);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateProduction]);

  // Update displayed production when instances change
  useEffect(() => {
    setProductionPerSecond(calculateProduction());
  }, [buildingInstances, calculateProduction]);

  return { productionPerSecond };
}
