import { useState, useCallback, useEffect, useRef } from 'react';
import type { Resources } from '../types/game';

const STORAGE_KEY = 'idle-builder-resources';

const STARTING_RESOURCES: Resources = {
  gold: 100,
  wood: 50,
  stone: 25,
};

function loadFromStorage(): Resources | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Resources;
  } catch {
    return null;
  }
}

function saveToStorage(resources: Resources): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  } catch {
    // localStorage unavailable — degrade gracefully
  }
}

export interface UseResourcesReturn {
  resources: Resources;
  canAfford: (cost: Resources) => boolean;
  spend: (cost: Resources) => boolean;
  earn: (amount: Resources) => void;
  getResources: () => Resources;
}

export function useResources(): UseResourcesReturn {
  const [resources, setResources] = useState<Resources>(
    () => loadFromStorage() ?? STARTING_RESOURCES
  );
  const resourcesRef = useRef(resources);
  resourcesRef.current = resources;

  // Cross-tab sync via StorageEvent
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const loaded = loadFromStorage();
      if (loaded) {
        setResources(loaded);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const canAfford = useCallback(
    (cost: Resources): boolean => {
      return (
        resources.gold >= cost.gold &&
        resources.wood >= cost.wood &&
        resources.stone >= cost.stone
      );
    },
    [resources]
  );

  const spend = useCallback((cost: Resources): boolean => {
    const current = resourcesRef.current;
    if (
      current.gold < cost.gold ||
      current.wood < cost.wood ||
      current.stone < cost.stone
    ) {
      return false;
    }
    setResources(prev => {
      if (
        prev.gold >= cost.gold &&
        prev.wood >= cost.wood &&
        prev.stone >= cost.stone
      ) {
        const next: Resources = {
          gold: prev.gold - cost.gold,
          wood: prev.wood - cost.wood,
          stone: prev.stone - cost.stone,
        };
        saveToStorage(next);
        return next;
      }
      return prev;
    });
    return true;
  }, []);

  const earn = useCallback((amount: Resources): void => {
    setResources(prev => {
      const next: Resources = {
        gold: prev.gold + amount.gold,
        wood: prev.wood + amount.wood,
        stone: prev.stone + amount.stone,
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const getResources = useCallback((): Resources => {
    return resources;
  }, [resources]);

  return { resources, canAfford, spend, earn, getResources };
}
