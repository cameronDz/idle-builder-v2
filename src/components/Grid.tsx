import { useState } from 'react';
import { useGridSystem } from '../hooks/useGridSystem';
import { GridCell } from './GridCell';
import { BuildingSelector } from './BuildingSelector';
import type { GridPosition, BuildingTimer } from '../types/game';
import styles from './Grid.module.css';

export function Grid() {
  const {
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
  } = useGridSystem();

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
    // Detail modal placeholder — will be implemented in Session 2
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
        />
      )}

      {/* Suppress unused variable warning until detail modal is implemented */}
      {pendingDetailId && null}
    </section>
  );
}
