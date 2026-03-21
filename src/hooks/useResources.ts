import { useState, useCallback, useEffect } from 'react';
import type { Resources } from '../types/game';

const STORAGE_KEY = 'idle-builder-resources';
const STARTING_RESOURCES: Resources = { gold: 100, wood: 50, stone: 25, ore: 0, food: 20 };

function loadResources(): Resources {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...STARTING_RESOURCES };
    return JSON.parse(raw) as Resources;
  } catch {
    return { ...STARTING_RESOURCES };
  }
}

function saveResources(resources: Resources): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  } catch {
    // ignore
  }
}

export interface UseResourcesReturn {
  resources: Resources;
  canAfford: (cost: Resources) => boolean;
  spend: (cost: Resources) => boolean;
  earn: (amount: Resources) => void;
  resetResources: () => void;
}

export function useResources(): UseResourcesReturn {
  const [resources, setResources] = useState<Resources>(loadResources);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setResources(loadResources());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const canAfford = useCallback(
    (cost: Resources): boolean => {
      return (
        resources.gold >= cost.gold &&
        resources.wood >= cost.wood &&
        resources.stone >= cost.stone &&
        resources.ore >= cost.ore &&
        resources.food >= cost.food
      );
    },
    [resources]
  );

  const spend = useCallback(
    (cost: Resources): boolean => {
      if (
        resources.gold < cost.gold ||
        resources.wood < cost.wood ||
        resources.stone < cost.stone ||
        resources.ore < cost.ore ||
        resources.food < cost.food
      ) {
        return false;
      }
      const next: Resources = {
        gold: resources.gold - cost.gold,
        wood: resources.wood - cost.wood,
        stone: resources.stone - cost.stone,
        ore: resources.ore - cost.ore,
        food: resources.food - cost.food,
      };
      setResources(next);
      saveResources(next);
      return true;
    },
    [resources]
  );

  const earn = useCallback((amount: Resources): void => {
    setResources(prev => {
      const next: Resources = {
        gold: prev.gold + amount.gold,
        wood: prev.wood + amount.wood,
        stone: prev.stone + amount.stone,
        ore: prev.ore + amount.ore,
        food: prev.food + amount.food,
      };
      saveResources(next);
      return next;
    });
  }, []);

  const resetResources = useCallback(() => {
    const starting = { ...STARTING_RESOURCES };
    setResources(starting);
    saveResources(starting);
  }, []);

  return { resources, canAfford, spend, earn, resetResources };
}
