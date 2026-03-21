import { useState, useEffect, useRef } from 'react';
import type { BuildingInstance, Resources } from '../types/game';
import { buildings } from '../config/buildings';

const ZERO_RESOURCES: Resources = { gold: 0, wood: 0, stone: 0 };

function calcProductionPerSecond(buildingInstances: BuildingInstance[]): Resources {
  const total: Resources = { gold: 0, wood: 0, stone: 0 };

  for (const instance of buildingInstances) {
    const { buildingTimer } = instance;
    const produces =
      buildingTimer.level > 0 || buildingTimer.isComplete;

    if (!produces) continue;

    const config = buildings.find(b => b.id === instance.buildingTypeId);
    if (!config) continue;

    // If level is 0 but isComplete is true, treat as level 1 for the calculation
    const effectiveLevel = buildingTimer.level > 0 ? buildingTimer.level : 1;
    const multiplier = Math.pow(config.productionMultiplier, effectiveLevel - 1);

    total.gold += config.production.gold * multiplier;
    total.wood += config.production.wood * multiplier;
    total.stone += config.production.stone * multiplier;
  }

  return total;
}

export interface UseProductionTickReturn {
  productionPerSecond: Resources;
}

export function useProductionTick(
  buildingInstances: BuildingInstance[],
  earn: (amount: Resources) => void
): UseProductionTickReturn {
  const [productionPerSecond, setProductionPerSecond] = useState<Resources>(ZERO_RESOURCES);
  const instancesRef = useRef(buildingInstances);
  const earnRef = useRef(earn);

  // Keep refs current without restarting the interval
  instancesRef.current = buildingInstances;
  earnRef.current = earn;

  useEffect(() => {
    const id = setInterval(() => {
      const production = calcProductionPerSecond(instancesRef.current);
      setProductionPerSecond(production);
      if (
        production.gold > 0 ||
        production.wood > 0 ||
        production.stone > 0
      ) {
        earnRef.current(production);
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return { productionPerSecond };
}
