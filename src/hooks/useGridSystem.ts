import { useState, useCallback, useEffect } from 'react';
import type { GridCell, GridPosition, BuildingInstance, BuildingTimer } from '../types/game';
import { buildings } from '../config/buildings';
import type { BuildingConfig } from '../config/buildings';

const GRID_COLS = 5;
const GRID_ROWS = 4;
const STORAGE_KEY_GRID = 'idle-builder-grid';
const STORAGE_KEY_INSTANCES = 'idle-builder-instances';
const MAX_CONCURRENT_BUILDS = 3;

function createEmptyGrid(): GridCell[][] {
  return Array.from({ length: GRID_ROWS }, (_, y) =>
    Array.from({ length: GRID_COLS }, (_, x) => ({
      buildingInstance: null,
      isOccupied: false,
      position: { x, y },
    }))
  );
}

function generateInstanceId(buildingTypeId: string): string {
  return `${buildingTypeId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadGrid(): GridCell[][] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GRID);
    if (!raw) return null;
    return JSON.parse(raw) as GridCell[][];
  } catch {
    return null;
  }
}

function saveGrid(grid: GridCell[][]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GRID, JSON.stringify(grid));
  } catch {
    // ignore
  }
}

function loadInstances(): BuildingInstance[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INSTANCES);
    if (!raw) return null;
    return JSON.parse(raw) as BuildingInstance[];
  } catch {
    return null;
  }
}

function saveInstances(instances: BuildingInstance[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INSTANCES, JSON.stringify(instances));
  } catch {
    // ignore
  }
}

interface UseGridSystemReturn {
  grid: GridCell[][];
  buildingInstances: BuildingInstance[];
  placeBuilding: (position: GridPosition, buildingTypeId: string) => BuildingInstance | null;
  removeBuilding: (instanceId: string) => void;
  updateBuildingInstance: (instanceId: string, timerState: BuildingTimer) => void;
  clearGrid: () => void;
  canPlaceBuilding: (buildingTypeId: string) => boolean;
  isValidPosition: (position: GridPosition) => boolean;
  getBuildingConfig: (buildingTypeId: string) => BuildingConfig | undefined;
  getBuildingCount: (buildingTypeId: string) => number;
  getBuildingsBeingBuiltCount: () => number;
  getActiveOrCompleteCount: () => number;
  getMaxConcurrentBuilds: () => number;
  isBuildingLimitReached: () => boolean;
  getEmptyPositions: () => GridPosition[];
}

export function useGridSystem(): UseGridSystemReturn {
  const [grid, setGrid] = useState<GridCell[][]>(() => loadGrid() ?? createEmptyGrid());
  const [buildingInstances, setBuildingInstances] = useState<BuildingInstance[]>(
    () => loadInstances() ?? []
  );

  // Keep grid in sync with building instances on mount
  useEffect(() => {
    const storedInstances = loadInstances();
    if (storedInstances && storedInstances.length > 0) {
      setGrid(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })));
        // Reset occupancy then repopulate from instances
        for (const row of next) {
          for (const cell of row) {
            cell.buildingInstance = null;
            cell.isOccupied = false;
          }
        }
        for (const instance of storedInstances) {
          const { x, y } = instance.position;
          if (next[y] && next[y][x]) {
            next[y][x].buildingInstance = instance;
            next[y][x].isOccupied = true;
          }
        }
        return next;
      });
    }
  }, []);

  const getBuildingConfig = useCallback((buildingTypeId: string): BuildingConfig | undefined => {
    return buildings.find(b => b.id === buildingTypeId);
  }, []);

  const isValidPosition = useCallback((position: GridPosition): boolean => {
    const { x, y } = position;
    return x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS;
  }, []);

  const getBuildingCount = useCallback(
    (buildingTypeId: string): number => {
      return buildingInstances.filter(i => i.buildingTypeId === buildingTypeId).length;
    },
    [buildingInstances]
  );

  const getBuildingsBeingBuiltCount = useCallback((): number => {
    return buildingInstances.filter(
      i => i.buildingTimer.hasStarted && !i.buildingTimer.isComplete
    ).length;
  }, [buildingInstances]);

  const getActiveOrCompleteCount = useCallback((): number => {
    return buildingInstances.filter(i => i.buildingTimer.hasStarted).length;
  }, [buildingInstances]);

  const getMaxConcurrentBuilds = useCallback((): number => MAX_CONCURRENT_BUILDS, []);

  const isBuildingLimitReached = useCallback((): boolean => {
    return getActiveOrCompleteCount() >= MAX_CONCURRENT_BUILDS;
  }, [getActiveOrCompleteCount]);

  const canPlaceBuilding = useCallback(
    (buildingTypeId: string): boolean => {
      const config = getBuildingConfig(buildingTypeId);
      if (!config) return false;
      if (getBuildingCount(buildingTypeId) >= config.maxCount) return false;

      // If this is not the foundation building, require the foundation to
      // already exist on the grid before any other building can be placed.
      if (!config.isFoundation) {
        const foundationExists = buildings.some(
          b => b.isFoundation && getBuildingCount(b.id) > 0
        );
        if (!foundationExists) return false;
      }

      return true;
    },
    [getBuildingConfig, getBuildingCount]
  );

  const getEmptyPositions = useCallback((): GridPosition[] => {
    const positions: GridPosition[] = [];
    for (const row of grid) {
      for (const cell of row) {
        if (!cell.isOccupied) positions.push(cell.position);
      }
    }
    return positions;
  }, [grid]);

  const placeBuilding = useCallback(
    (position: GridPosition, buildingTypeId: string): BuildingInstance | null => {
      if (!isValidPosition(position)) return null;
      if (!canPlaceBuilding(buildingTypeId)) return null;
      if (isBuildingLimitReached()) return null;

      const { x, y } = position;
      if (grid[y][x].isOccupied) return null;

      const config = getBuildingConfig(buildingTypeId);
      if (!config) return null;

      const instanceId = generateInstanceId(buildingTypeId);
      const autoStart = !isBuildingLimitReached();

      if (autoStart) {
        try {
          localStorage.setItem(
            `timer_${instanceId}`,
            JSON.stringify({ startTime: Date.now(), isCompleted: false, level: 0, baseDuration: config.duration })
          );
        } catch {
          // ignore
        }
      }

      const instance: BuildingInstance = {
        buildingTypeId,
        id: instanceId,
        level: 0,
        position,
        buildingTimer: {
          hasStarted: autoStart,
          isComplete: false,
          level: 0,
          progress: 0,
          timeRemaining: config.duration,
        },
      };

      const nextInstances = [...buildingInstances, instance];
      const nextGrid = grid.map(row => row.map(cell => ({ ...cell })));
      nextGrid[y][x].buildingInstance = instance;
      nextGrid[y][x].isOccupied = true;

      setGrid(nextGrid);
      setBuildingInstances(nextInstances);
      saveGrid(nextGrid);
      saveInstances(nextInstances);

      return instance;
    },
    [buildingInstances, canPlaceBuilding, getBuildingConfig, grid, isBuildingLimitReached, isValidPosition]
  );

  const removeBuilding = useCallback(
    (instanceId: string) => {
      const instance = buildingInstances.find(i => i.id === instanceId);
      if (!instance) return;

      const { x, y } = instance.position;
      const nextInstances = buildingInstances.filter(i => i.id !== instanceId);
      const nextGrid = grid.map(row => row.map(cell => ({ ...cell })));
      nextGrid[y][x].buildingInstance = null;
      nextGrid[y][x].isOccupied = false;

      setGrid(nextGrid);
      setBuildingInstances(nextInstances);
      saveGrid(nextGrid);
      saveInstances(nextInstances);
    },
    [buildingInstances, grid]
  );

  const updateBuildingInstance = useCallback(
    (instanceId: string, timerState: BuildingTimer) => {
      setBuildingInstances(prev => {
        const nextInstances = prev.map(i =>
          i.id === instanceId
            ? { ...i, level: timerState.level, buildingTimer: timerState }
            : i
        );
        saveInstances(nextInstances);

        setGrid(prevGrid => {
          const nextGrid = prevGrid.map(row =>
            row.map(cell => {
              if (cell.buildingInstance?.id === instanceId) {
                const updated = nextInstances.find(i => i.id === instanceId);
                return { ...cell, buildingInstance: updated ?? cell.buildingInstance };
              }
              return cell;
            })
          );
          saveGrid(nextGrid);
          return nextGrid;
        });

        return nextInstances;
      });
    },
    []
  );

  const clearGrid = useCallback(() => {
    const emptyGrid = createEmptyGrid();
    setGrid(emptyGrid);
    setBuildingInstances([]);
    saveGrid(emptyGrid);
    saveInstances([]);
    try {
      // Remove all timer keys associated with current instances
      const keys = Object.keys(localStorage).filter(k => k.startsWith('timer_'));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  return {
    grid,
    buildingInstances,
    placeBuilding,
    removeBuilding,
    updateBuildingInstance,
    clearGrid,
    canPlaceBuilding,
    isValidPosition,
    getBuildingConfig,
    getBuildingCount,
    getBuildingsBeingBuiltCount,
    getActiveOrCompleteCount,
    getMaxConcurrentBuilds,
    isBuildingLimitReached,
    getEmptyPositions,
  };
}
