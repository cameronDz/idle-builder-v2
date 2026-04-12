import { useState } from 'react';
import { GridCell } from './GridCell';
import { BuildingSelector } from './BuildingSelector';
import type { GridPosition, BuildingTimer, BuildingInstance, GridCell as GridCellType, Resources } from '../types/game';
import type { BuildingConfig } from '../config/buildings';
import { applyDiscount } from '../utils/buildingUtils';
import styles from './Grid.module.css';

interface GridProps {
  grid: GridCellType[][];
  buildingInstances: BuildingInstance[];
  placeBuilding: (position: GridPosition, buildingTypeId: string) => BuildingInstance | null;
  removeBuilding: (instanceId: string) => void;
  updateBuildingInstance: (instanceId: string, timerState: BuildingTimer) => void;
  clearGrid: () => void;
  getBuildingConfig: (buildingTypeId: string) => BuildingConfig | undefined;
  getBuildingCount: (buildingTypeId: string) => number;
  getBuildingsBeingBuiltCount: () => number;
  getActiveOrCompleteCount: () => number;
  getMaxConcurrentBuilds: () => number;
  isBuildingLimitReached: () => boolean;
  resources: Resources;
  canAfford: (cost: Resources) => boolean;
  spend: (cost: Resources) => boolean;
  resetResources: () => void;
  /** Example 3 — fractional cost discount from prestige (0–0.5). */
  costDiscount: number;
  /** Example 4 — fractional build speed discount from prestige (0–0.1). */
  buildSpeedDiscount: number;
}

export function Grid({
  grid,
  buildingInstances,
  placeBuilding,
  removeBuilding,
  updateBuildingInstance,
  clearGrid,
  getBuildingConfig,
  getBuildingCount,
  getActiveOrCompleteCount,
  getMaxConcurrentBuilds,
  isBuildingLimitReached,
  resources,
  canAfford,
  spend,
  resetResources,
  costDiscount,
  buildSpeedDiscount,
}: GridProps) {
  const [selectorPosition, setSelectorPosition] = useState<GridPosition | null>(null);

  const totalCells = grid.length * (grid[0]?.length ?? 0);
  const placedCount = buildingInstances.length;
  const activeOrComplete = getActiveOrCompleteCount();
  const maxConcurrent = getMaxConcurrentBuilds();

  const handleEmptyCellClick = (position: GridPosition) => {
    if (buildLimitReached) return;
    setSelectorPosition(position);
  };

  const handleBuildingSelect = (buildingTypeId: string) => {
    if (!selectorPosition) return;
    const config = getBuildingConfig(buildingTypeId);
    if (!config) return;
    const discountedCost = applyDiscount(config.cost, costDiscount);
    if (!spend(discountedCost)) return;
    placeBuilding(selectorPosition, buildingTypeId);
    setSelectorPosition(null);
  };

  const handleSelectorCancel = () => {
    setSelectorPosition(null);
  };

  const handleBuildingUpdate = (instanceId: string, timerState: BuildingTimer) => {
    updateBuildingInstance(instanceId, timerState);
  };

  const handleClearGrid = () => {
    if (window.confirm('Clear the entire grid? This cannot be undone.')) {
      clearGrid();
    }
  };

  const handleResetResources = () => {
    if (window.confirm('Reset all resources to starting values?')) {
      resetResources();
    }
  };

  const buildLimitReached = isBuildingLimitReached();
  const isDevMode = localStorage.getItem('devMode') === 'true';

  return (
    <section className={styles.gridSection}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{'Building Grid'}</h2>
          <span className={styles.countBadge}>{`${placedCount} / ${totalCells}`}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.concurrentBadge} ${buildLimitReached ? styles.limitReached : ''}`}>
            {`⚒ ${activeOrComplete}/${maxConcurrent} slots`}
          </span>
          {isDevMode && (
            <button className={styles.clearButton} onClick={handleResetResources}>
              {'Clear Resources'}
            </button>
          )}
          {isDevMode && (
            <button className={styles.clearButton} onClick={handleClearGrid}>
              {'Clear Grid'}
            </button>
          )}
        </div>
      </div>

      <div className={styles.gridWrapper}>
        <div className={styles.grid}>
          {grid.map(row =>
            row.map(cell => (
              <GridCell
                key={`${cell.position.x}-${cell.position.y}`}
                cell={cell}
                buildingInstances={buildingInstances}
                isBuildLimitReached={buildLimitReached}
                canAfford={canAfford}
                currentResources={resources}
                spend={spend}
                onEmptyCellClick={handleEmptyCellClick}
                onBuildingUpdate={handleBuildingUpdate}
                onDestroyBuilding={removeBuilding}
                getBuildingConfig={getBuildingConfig}
                costDiscount={costDiscount}
                buildSpeedDiscount={buildSpeedDiscount}
              />
            ))
          )}
        </div>
      </div>

      {selectorPosition && (
        <BuildingSelector
          onSelect={handleBuildingSelect}
          onCancel={handleSelectorCancel}
          getBuildingCount={getBuildingCount}
          canAfford={canAfford}
          resources={resources}
          costDiscount={costDiscount}
        />
      )}
    </section>
  );
}
