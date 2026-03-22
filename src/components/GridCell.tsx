import { useState } from 'react';
import { useTimer } from '../hooks/useTimer';
import { BuildingDetail } from './BuildingDetail';
import type { BuildingInstance, BuildingTimer, Resources } from '../types/game';
import type { BuildingConfig } from '../config/buildings';
import { getUpgradeCost, hasAnyCost } from '../utils/buildingUtils';
import { formatTime } from '../utils/timeUtils';
import styles from './GridCell.module.css';

interface OccupiedCellProps {
  instance: BuildingInstance;
  config: BuildingConfig;
  isBuildLimitReached: boolean;
  canAfford: (cost: Resources) => boolean;
  spend: (cost: Resources) => boolean;
  onBuildingUpdate: (instanceId: string, timerState: BuildingTimer) => void;
}

function OccupiedCell({
  instance,
  config,
  isBuildLimitReached,
  canAfford,
  spend,
  onBuildingUpdate,
}: OccupiedCellProps) {
  const { timerState, startTimer, completeTimer, acknowledgeComplete } = useTimer(
    config.duration,
    instance.id
  );
  const [showDetail, setShowDetail] = useState(false);

  const syncAndUpdate = (updatedState: BuildingTimer) => {
    onBuildingUpdate(instance.id, updatedState);
  };

  const handleStart = () => {
    const upgradeCost = getUpgradeCost(config, timerState.level);
    if (hasAnyCost(upgradeCost)) {
      if (!spend(upgradeCost)) return;
    }
    startTimer();
    const next: BuildingTimer = {
      ...timerState,
      hasStarted: true,
    };
    syncAndUpdate(next);
  };

  const handleFinish = () => {
    completeTimer();
    const next: BuildingTimer = {
      ...timerState,
      hasStarted: true,
      isComplete: true,
      progress: 100,
      timeRemaining: 0,
    };
    syncAndUpdate(next);
  };

  const handleAcknowledge = () => {
    acknowledgeComplete();
    const next: BuildingTimer = {
      hasStarted: false,
      isComplete: false,
      level: timerState.level,
      progress: 0,
      timeRemaining: config.duration,
    };
    syncAndUpdate(next);
  };

  const progressColor =
    timerState.progress >= 80
      ? '#22c55e'
      : timerState.progress >= 40
        ? '#eab308'
        : '#3b82f6';

  const currentIcon =
    timerState.level >= 5
      ? config.ultraIcon
      : timerState.level >= 2
        ? config.enhancedIcon
        : config.icon;

  const level = timerState.level;
  let productionStr: string | null = null;
  if (level > 0) {
    const multiplier = Math.pow(config.productionMultiplier, level - 1);
    const parts: string[] = [];
    if (config.production.gold > 0) parts.push(`💰${(config.production.gold * multiplier).toFixed(1)}`);
    if (config.production.wood > 0) parts.push(`🌲${(config.production.wood * multiplier).toFixed(1)}`);
    if (config.production.stone > 0) parts.push(`🪨${(config.production.stone * multiplier).toFixed(1)}`);
    if (config.production.ore > 0) parts.push(`🔩${(config.production.ore * multiplier).toFixed(1)}`);
    if (config.production.food > 0) parts.push(`🍖${(config.production.food * multiplier).toFixed(1)}`);

    if (parts.length > 0) productionStr = parts.join(' ') + '/s';
  }

  return (
    <div className={styles.occupiedCell}>
      <button
        className={styles.iconButton}
        onClick={() => setShowDetail(true)}
        title={`${config.name} — click for details`}
      >
        <span className={styles.buildingIcon}>{currentIcon}</span>
      </button>
      <span className={styles.buildingName}>{config.name}</span>
      <span className={styles.levelLabel}>{`Lv ${timerState.level}`}</span>
      {productionStr && <span className={styles.productionInfo}>{productionStr}</span>}

      {(timerState.hasStarted || timerState.isComplete) && (
        <div className={styles.progressBarWrapper}>
          <div
            className={styles.progressBar}
            style={{ width: `${timerState.progress}%`, background: progressColor }}
          />
        </div>
      )}

      {timerState.isComplete ? (
        <button className={styles.completeButton} onClick={handleAcknowledge}>
          {'✔ Complete'}
        </button>
      ) : timerState.hasStarted ? (
        <>
          <span className={styles.timeRemaining}>{formatTime(timerState.timeRemaining)}</span>
          {timerState.timeRemaining <= 30000 && (
            <button className={styles.finishButton} onClick={handleFinish}>
              {'⚡ Finish'}
            </button>
          )}
        </>
      ) : null}

      {showDetail && (
        <BuildingDetail
          config={config}
          instance={instance}
          timerState={timerState}
          isBuildLimitReached={isBuildLimitReached}
          canAfford={canAfford}
          onStart={handleStart}
          onFinish={handleFinish}
          onAcknowledge={handleAcknowledge}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
}

interface GridCellProps {
  cell: {
    isOccupied: boolean;
    position: { x: number; y: number };
    buildingInstance: BuildingInstance | null;
  };
  isBuildLimitReached: boolean;
  canAfford: (cost: Resources) => boolean;
  spend: (cost: Resources) => boolean;
  onEmptyCellClick: (position: { x: number; y: number }) => void;
  onBuildingUpdate: (instanceId: string, timerState: BuildingTimer) => void;
  getBuildingConfig: (buildingTypeId: string) => BuildingConfig | undefined;
}

export function GridCell({
  cell,
  isBuildLimitReached,
  canAfford,
  spend,
  onEmptyCellClick,
  onBuildingUpdate,
  getBuildingConfig,
}: GridCellProps) {
  if (!cell.isOccupied || !cell.buildingInstance) {
    return (
      <div
        className={styles.emptyCell}
        onClick={() => onEmptyCellClick(cell.position)}
        title={`Place building at (${cell.position.x}, ${cell.position.y})`}
      >
        <span className={styles.addIcon}>{'+'}</span>
        <span className={styles.positionLabel}>{`${cell.position.x},${cell.position.y}`}</span>
      </div>
    );
  }

  const config = getBuildingConfig(cell.buildingInstance.buildingTypeId);
  if (!config) return null;

  return (
    <OccupiedCell
      instance={cell.buildingInstance}
      config={config}
      isBuildLimitReached={isBuildLimitReached}
      canAfford={canAfford}
      spend={spend}
      onBuildingUpdate={onBuildingUpdate}
    />
  );
}
