import { useTimer } from '../hooks/useTimer';
import type { BuildingInstance, BuildingTimer } from '../types/game';
import type { BuildingConfig } from '../config/buildings';
import { formatTime } from '../utils/timeUtils';
import styles from './GridCell.module.css';

interface OccupiedCellProps {
  instance: BuildingInstance;
  config: BuildingConfig;
  isBuildLimitReached: boolean;
  onBuildingUpdate: (instanceId: string, timerState: BuildingTimer) => void;
  onBuildingIconClick: (instanceId: string) => void;
}

function OccupiedCell({
  instance,
  config,
  isBuildLimitReached,
  onBuildingUpdate,
  onBuildingIconClick,
}: OccupiedCellProps) {
  const { timerState, startTimer, completeTimer, acknowledgeComplete } = useTimer(
    config.duration,
    instance.id
  );

  const syncAndUpdate = (updatedState: BuildingTimer) => {
    onBuildingUpdate(instance.id, updatedState);
  };

  const handleStart = () => {
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
        onClick={() => onBuildingIconClick(instance.id)}
        title={`${config.name} — click for details`}
      >
        <span className={styles.buildingIcon}>{currentIcon}</span>
      </button>
      <span className={styles.buildingName}>{config.name}</span>
      <span className={styles.levelLabel}>{`Lv ${timerState.level}`}</span>
      {productionStr && <span className={styles.productionInfo}>{productionStr}</span>}

      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${timerState.progress}%`, background: progressColor }}
        />
      </div>

      {timerState.isComplete ? (
        <button className={styles.completeButton} onClick={handleAcknowledge}>
          {'✔ Complete'}
        </button>
      ) : timerState.hasStarted ? (
        <div className={styles.timerRow}>
          <span className={styles.timeRemaining}>{formatTime(timerState.timeRemaining)}</span>
          {timerState.timeRemaining <= 30000 && (
            <button className={styles.finishButton} onClick={handleFinish}>
              {'Finish'}
            </button>
          )}
        </div>
      ) : (
        <button
          className={styles.startButton}
          onClick={handleStart}
          disabled={isBuildLimitReached}
          title={isBuildLimitReached ? 'Max concurrent builds reached' : 'Start construction'}
        >
          {'▶ Start'}
        </button>
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
  onEmptyCellClick: (position: { x: number; y: number }) => void;
  onBuildingUpdate: (instanceId: string, timerState: BuildingTimer) => void;
  onBuildingIconClick: (instanceId: string) => void;
  getBuildingConfig: (buildingTypeId: string) => BuildingConfig | undefined;
}

export function GridCell({
  cell,
  isBuildLimitReached,
  onEmptyCellClick,
  onBuildingUpdate,
  onBuildingIconClick,
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
      onBuildingUpdate={onBuildingUpdate}
      onBuildingIconClick={onBuildingIconClick}
    />
  );
}
