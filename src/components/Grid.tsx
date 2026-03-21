import { useState } from 'react';
import { GridCell } from './GridCell';
import { BuildingSelector } from './BuildingSelector';
import type { GridPosition, BuildingTimer, BuildingInstance, GridCell as GridCellType, Resources } from '../types/game';
import type { BuildingConfig } from '../config/buildings';
import styles from './Grid.module.css';

interface GridProps {
  grid: GridCellType[][];
  buildingInstances: BuildingInstance[];
  placeBuilding: (position: GridPosition, buildingTypeId: string) => BuildingInstance | null;
  updateBuildingInstance: (instanceId: string, timerState: BuildingTimer) => void;
  clearGrid: () => void;
  getBuildingConfig: (buildingTypeId: string) => BuildingConfig | undefined;
  getBuildingCount: (buildingTypeId: string) => number;
  getBuildingsBeingBuiltCount: () => number;
  getMaxConcurrentBuilds: () => number;
  isBuildingLimitReached: () => boolean;
  resources: Resources;
  canAfford: (cost: Resources) => boolean;
  spend: (cost: Resources) => boolean;
}

export function Grid({
  grid,
  buildingInstances,
  placeBuilding,
  updateBuildingInstance,
  clearGrid,
  getBuildingConfig,
  getBuildingCount,
  getBuildingsBeingBuiltCount,
  getMaxConcurrentBuilds,
  isBuildingLimitReached,
  canAfford,
  spend,
}: GridProps) {
  const [selectorPosition, setSelectorPosition] = useState<GridPosition | null>(null);
  const [pendingDetailId, setPendingDetailId] = useState<string | null>(null);

  const totalCells = grid.length * (grid[0]?.length ?? 0);
  const placedCount = buildingInstances.length;
  const beingBuilt = getBuildingsBeingBuiltCount();
  const maxConcurrent = getMaxConcurrentBuilds();

  const handleEmptyCellClick = (position: GridPosition) => {
    setSelectorPosition(position);
  };

  const handleBuildingSelect = (buildingTypeId: string) => {
    if (!selectorPosition) return;
    const config = getBuildingConfig(buildingTypeId);
    if (!config) return;
    if (!spend(config.cost)) return;
    placeBuilding(selectorPosition, buildingTypeId);
    setSelectorPosition(null);
  };

  const handleSelectorCancel = () => {
    setSelectorPosition(null);
  };

  const handleBuildingUpdate = (instanceId: string, timerState: BuildingTimer) => {
    updateBuildingInstance(instanceId, timerState);
  };

  const handleBuildingIconClick = (instanceId: string) => {
    setPendingDetailId(instanceId);
    console.log('Building detail requested for:', instanceId);
  };

  const handleClearGrid = () => {
    if (window.confirm('Clear the entire grid? This cannot be undone.')) {
      clearGrid();
    }
  };

  const buildLimitReached = isBuildingLimitReached();

  return (
    <section className={styles.gridSection}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{'Building Grid'}</h2>
          <span className={styles.countBadge}>{`${placedCount} / ${totalCells}`}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.concurrentBadge} ${buildLimitReached ? styles.limitReached : ''}`}>
            {`⚒ ${beingBuilt}/${maxConcurrent} building`}
          </span>
          <button className={styles.clearButton} onClick={handleClearGrid}>
            {'Clear Grid'}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {grid.map(row =>
          row.map(cell => (
            <GridCell
              key={`${cell.position.x}-${cell.position.y}`}
              cell={cell}
              isBuildLimitReached={buildLimitReached}
              onEmptyCellClick={handleEmptyCellClick}
              onBuildingUpdate={handleBuildingUpdate}
              onBuildingIconClick={handleBuildingIconClick}
              getBuildingConfig={getBuildingConfig}
            />
          ))
        )}
      </div>

      {selectorPosition && (
        <BuildingSelector
          onSelect={handleBuildingSelect}
          onCancel={handleSelectorCancel}
          getBuildingCount={getBuildingCount}
          canAfford={canAfford}
        />
      )}

      {pendingDetailId && null}
    </section>
  );
}
